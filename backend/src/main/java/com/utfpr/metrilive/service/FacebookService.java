package com.utfpr.metrilive.service;

import com.restfb.Connection;
import com.restfb.DefaultFacebookClient;
import com.restfb.FacebookClient;
import com.restfb.Parameter;
import com.restfb.Version;
import com.restfb.exception.FacebookException;
import com.restfb.exception.FacebookGraphException;
import com.restfb.types.Comment;
import com.restfb.types.LiveVideo;
import com.restfb.types.Page;
import com.restfb.types.Video;
import com.utfpr.metrilive.model.Role;
import com.utfpr.metrilive.model.User;
import com.utfpr.metrilive.model.VideoMetricHistory;
import com.utfpr.metrilive.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class FacebookService {

    private final UserRepository userRepository;
    private final FacebookPageRepository facebookPageRepository;
    private final LiveVideoRepository liveVideoRepository;
    private final CommentRepository commentRepository;
    private final VideoMetricHistoryRepository videoMetricHistoryRepository;
    private final UserService userService;

    private FacebookClient getFacebookClient() {
        User currentUser = userService.getCurrentUser();
        String token = userService.getEffectiveFacebookToken(currentUser);
        return new DefaultFacebookClient(token, Version.LATEST);
    }

    public List<com.utfpr.metrilive.model.FacebookPage> getAllStoredPages() {
        return facebookPageRepository.findAll();
    }

    public List<com.utfpr.metrilive.model.LiveVideo> getAllSavedVideos() {
        User currentUser = userService.getCurrentUser();
        if (currentUser.getRole() == Role.ADMIN) {
            return liveVideoRepository.findAll();
        } else {
            Set<String> authorizedPageIds = currentUser.getAuthorizedPages().stream()
                    .map(com.utfpr.metrilive.model.FacebookPage::getId)
                    .collect(Collectors.toSet());
            
            return liveVideoRepository.findAll().stream()
                    .filter(video -> video.getPage() != null && authorizedPageIds.contains(video.getPage().getId()))
                    .collect(Collectors.toList());
        }
    }

    public List<Page> getPages() {
        User currentUser = userService.getCurrentUser();
        try {
            log.info("Iniciando busca de páginas do Facebook para o usuário: [{}]", currentUser.getUsername());
            FacebookClient client = getFacebookClient();
            
            List<Page> facebookPages;
            try {
                Connection<Page> pagesConnection = client.fetchConnection("me/accounts", Page.class);
                facebookPages = pagesConnection.getData();
                log.info("Busca de páginas concluída. Total encontrado no Facebook: [{}]", facebookPages.size());
            } catch (FacebookGraphException e) {
                if (e.getErrorCode() == 100) {
                    log.info("Falha em 'me/accounts'. Tentando buscar 'me' (Page Token)...");
                    Page page = client.fetchObject("me", Page.class);
                    facebookPages = List.of(page);
                } else {
                    throw e;
                }
            }

            savePages(facebookPages, currentUser);

            if (currentUser.getRole() == Role.ADMIN) {
                return facebookPages;
            } else {
                Set<String> authorizedPageIds = currentUser.getAuthorizedPages().stream()
                        .map(com.utfpr.metrilive.model.FacebookPage::getId)
                        .collect(Collectors.toSet());
                
                return facebookPages.stream()
                        .filter(page -> authorizedPageIds.contains(page.getId()))
                        .collect(Collectors.toList());
            }

        } catch (FacebookException e) {
            log.error("Erro ao buscar páginas do Facebook: {}", e.getMessage());
            throw new RuntimeException("Erro ao se comunicar com o Facebook para buscar páginas.", e);
        }
    }

    private void savePages(List<Page> pages, User user) {
        pages.forEach(page -> {
            Optional<com.utfpr.metrilive.model.FacebookPage> existing = facebookPageRepository.findById(page.getId());
            if (existing.isEmpty()) {
                com.utfpr.metrilive.model.FacebookPage pageEntity = com.utfpr.metrilive.model.FacebookPage.builder()
                        .id(page.getId())
                        .name(page.getName())
                        .user(user)
                        .build();
                facebookPageRepository.save(pageEntity);
            }
        });
        log.info("Páginas sincronizadas com o banco de dados.");
    }

    public List<LiveVideo> getLiveVideos(String pageId) {
        checkPageAccess(pageId);
        try {
            log.info("Iniciando busca de vídeos ao vivo para a página ID: {}", pageId);
            FacebookClient client = getFacebookClient();
            Connection<LiveVideo> liveVideos = client.fetchConnection(pageId + "/live_videos", LiveVideo.class);
            List<LiveVideo> data = liveVideos.getData();
            log.info("Busca de vídeos ao vivo concluída. Total encontrado: {}", data.size());

            Optional<com.utfpr.metrilive.model.FacebookPage> parentPage = facebookPageRepository.findById(pageId);
            if (parentPage.isPresent()) {
                data.forEach(video -> {
                    com.utfpr.metrilive.model.LiveVideo videoEntity = com.utfpr.metrilive.model.LiveVideo.builder()
                            .id(video.getId())
                            .title(video.getTitle())
                            .description(video.getDescription())
                            .creationTime(video.getCreationTime())
                            .page(parentPage.get())
                            .build();
                    liveVideoRepository.save(videoEntity);
                    saveMetricHistory(videoEntity);
                });
            }

            return data;
        } catch (FacebookException e) {
            log.error("Erro ao buscar vídeos ao vivo da página {}: {}", pageId, e.getMessage());
            throw new RuntimeException("Erro ao buscar vídeos ao vivo do Facebook.", e);
        }
    }

    public List<Comment> getLiveVideoComments(String liveVideoId) {
        Optional<com.utfpr.metrilive.model.LiveVideo> videoOpt = liveVideoRepository.findById(liveVideoId);
        if (videoOpt.isPresent()) {
            checkPageAccess(videoOpt.get().getPage().getId());
        }
        
        try {
            log.info("Iniciando busca de comentários para o vídeo ID: {}", liveVideoId);
            FacebookClient client = getFacebookClient();
            Connection<Comment> comments = client.fetchConnection(liveVideoId + "/comments", Comment.class);
            List<Comment> data = comments.getData();

            if (videoOpt.isPresent()) {
                data.forEach(comment -> {
                    com.utfpr.metrilive.model.Comment commentEntity = com.utfpr.metrilive.model.Comment.builder()
                            .id(comment.getId())
                            .message(comment.getMessage())
                            .createdTime(comment.getCreatedTime())
                            .fromId(comment.getFrom() != null ? comment.getFrom().getId() : null)
                            .fromName(comment.getFrom() != null ? comment.getFrom().getName() : null)
                            .liveVideo(videoOpt.get())
                            .build();
                    commentRepository.save(commentEntity);
                });
            }

            return data;
        } catch (FacebookException e) {
            log.error("Erro ao buscar comentários do vídeo {}: {}", liveVideoId, e.getMessage());
            throw new RuntimeException("Erro ao buscar comentários do Facebook.", e);
        }
    }

    private void checkPageAccess(String pageId) {
        User currentUser = userService.getCurrentUser();
        if (currentUser.getRole() == Role.ADMIN) return;

        boolean hasAccess = currentUser.getAuthorizedPages().stream()
                .anyMatch(p -> p.getId().equals(pageId));
        
        if (!hasAccess) {
            throw new RuntimeException("Acesso negado: Você não tem permissão para visualizar dados desta página.");
        }
    }

    public void processVideoUrl(String url) {
        User user = userService.getCurrentUser();
        String videoId = extractVideoIdFromUrl(url);
        log.info("Processando URL do vídeo. ID extraído: {}", videoId);

        try {
            FacebookClient client = getFacebookClient();
            
            Video video = client.fetchObject(videoId, Video.class, Parameter.with("fields", "id,title,description,created_time,from,views,comments.summary(true)"));
            
            if (video == null) {
                throw new RuntimeException("Vídeo não encontrado no Facebook com o ID: " + videoId);
            }
            
            if (video.getFrom() != null) {
                 checkPageAccess(video.getFrom().getId());
            }

            com.utfpr.metrilive.model.FacebookPage pageEntity;
            if (video.getFrom() != null) {
                 pageEntity = com.utfpr.metrilive.model.FacebookPage.builder()
                        .id(video.getFrom().getId())
                        .name(video.getFrom().getName())
                        .user(user)
                        .build();
                facebookPageRepository.save(pageEntity);
            } else {
                 throw new RuntimeException("Não foi possível identificar a página de origem do vídeo.");
            }

            Long viewCount = video.getViews() != null ? video.getViews() : 0L;
            Long shareCount = 0L; 
            Long commentCount = (video.getComments() != null && video.getComments().getTotalCount() != null) ? video.getComments().getTotalCount() : 0L;

            com.utfpr.metrilive.model.LiveVideo videoEntity = com.utfpr.metrilive.model.LiveVideo.builder()
                    .id(video.getId())
                    .title(video.getTitle() != null && !video.getTitle().isEmpty() ? video.getTitle() : "Vídeo sem título")
                    .description(video.getDescription())
                    .creationTime(video.getCreatedTime())
                    .viewCount(viewCount)
                    .shareCount(shareCount)
                    .commentCount(commentCount)
                    .page(pageEntity)
                    .build();
            liveVideoRepository.save(videoEntity);
            saveMetricHistory(videoEntity);

            Connection<Comment> comments = client.fetchConnection(videoId + "/comments", Comment.class);
            List<Comment> commentsData = comments.getData();
            
            commentsData.forEach(comment -> {
                com.utfpr.metrilive.model.Comment commentEntity = com.utfpr.metrilive.model.Comment.builder()
                        .id(comment.getId())
                        .message(comment.getMessage())
                        .createdTime(comment.getCreatedTime())
                        .fromId(comment.getFrom() != null ? comment.getFrom().getId() : null)
                        .fromName(comment.getFrom() != null ? comment.getFrom().getName() : null)
                        .liveVideo(videoEntity)
                        .build();
                commentRepository.save(commentEntity);
            });

        } catch (FacebookGraphException e) {
            if (e.getErrorCode() != null && e.getErrorCode() == 100 && e.getErrorSubcode() != null && e.getErrorSubcode() == 33) {
                log.error("Erro de permissão do Facebook (Objeto não encontrado ou acesso negado).");
                throw new RuntimeException("Acesso negado pelo Facebook. Verifique se o App está em modo Live ou se você administra a página do vídeo.", e);
            }
            log.error("Erro de API do Graph Facebook ao processar vídeo {}: {}", url, e.getMessage());
            throw new RuntimeException("Erro de API do Facebook ao buscar dados do vídeo.", e);
        } catch (FacebookException e) {
            log.error("Erro genérico do Facebook ao processar URL do vídeo {}: {}", url, e.getMessage());
            throw new RuntimeException("Erro ao processar vídeo do Facebook.", e);
        }
    }

    private void saveMetricHistory(com.utfpr.metrilive.model.LiveVideo video) {
        VideoMetricHistory history = VideoMetricHistory.builder()
                .liveVideo(video)
                .collectedAt(new Date())
                .viewCount(video.getViewCount() != null ? video.getViewCount() : 0L)
                .commentCount(video.getCommentCount() != null ? video.getCommentCount() : 0L)
                .shareCount(video.getShareCount() != null ? video.getShareCount() : 0L)
                .build();
        videoMetricHistoryRepository.save(history);
    }

    private String extractVideoIdFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            throw new IllegalArgumentException("A URL do vídeo não pode ser vazia.");
        }

        Pattern queryPattern = Pattern.compile("[?&]v=([0-9]+)");
        Matcher queryMatcher = queryPattern.matcher(url);
        if (queryMatcher.find()) {
            return queryMatcher.group(1);
        }

        String[] pathMarkers = {"/videos/", "/reel/"};
        
        for (String marker : pathMarkers) {
            if (url.contains(marker)) {
                String[] parts = url.split(marker);
                if (parts.length > 1) {
                    String pathAfterMarker = parts[1];
                    if (pathAfterMarker.contains("?")) {
                        pathAfterMarker = pathAfterMarker.substring(0, pathAfterMarker.indexOf("?"));
                    }
                    String[] segments = pathAfterMarker.split("/");
                    for (String segment : segments) {
                        if (segment.matches("^[0-9]+$")) {
                            return segment;
                        }
                    }
                }
            }
        }
        throw new IllegalArgumentException("Não foi possível extrair o ID do vídeo da URL fornecida: " + url);
    }
}
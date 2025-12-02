package com.utfpr.metrilive.service;

import com.restfb.Connection;
import com.restfb.DefaultFacebookClient;
import com.restfb.FacebookClient;
import com.restfb.Parameter;
import com.restfb.Version;
import com.restfb.exception.FacebookException;
import com.restfb.types.Comment;
import com.restfb.types.LiveVideo;
import com.restfb.types.Page;
import com.restfb.types.Video;
import com.utfpr.metrilive.model.User;
import com.utfpr.metrilive.model.VideoMetricHistory;
import com.utfpr.metrilive.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class FacebookService {

    private final UserRepository userRepository;
    private final FacebookPageRepository facebookPageRepository;
    private final LiveVideoRepository liveVideoRepository;
    private final CommentRepository commentRepository;
    private final VideoMetricHistoryRepository videoMetricHistoryRepository;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + username));
    }

    private FacebookClient getFacebookClient(User user) {
        if (user.getFacebookAccessToken() != null) {
            return new DefaultFacebookClient(user.getFacebookAccessToken(), Version.LATEST);
        }
        log.warn("Tentativa de acesso ao Facebook sem token configurado para o usuário: {}", user.getUsername());
        throw new IllegalStateException("Token de acesso do Facebook não configurado para o usuário.");
    }

    public List<Page> getPages() {
        User user = getAuthenticatedUser();
        try {
            log.info("Iniciando busca de páginas do Facebook para o usuário: {}", user.getUsername());
            FacebookClient client = getFacebookClient(user);
            Connection<Page> pages = client.fetchConnection("me/accounts", Page.class);
            List<Page> data = pages.getData();
            log.info("Busca de páginas concluída com sucesso. Total encontrado: {}", data.size());

            data.forEach(page -> {
                com.utfpr.metrilive.model.FacebookPage pageEntity = com.utfpr.metrilive.model.FacebookPage.builder()
                        .id(page.getId())
                        .name(page.getName())
                        .user(user)
                        .build();
                facebookPageRepository.save(pageEntity);
            });
            log.info("Páginas salvas no banco de dados.");

            return data;
        } catch (FacebookException e) {
            log.error("Erro ao buscar páginas do Facebook: {}", e.getMessage());
            throw new RuntimeException("Erro ao se comunicar com o Facebook para buscar páginas.", e);
        }
    }

    public List<LiveVideo> getLiveVideos(String pageId) {
        User user = getAuthenticatedUser();
        try {
            log.info("Iniciando busca de vídeos ao vivo para a página ID: {}", pageId);
            FacebookClient client = getFacebookClient(user);
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
                log.info("Vídeos ao vivo salvos no banco de dados associados à página {}.", pageId);
            } else {
                log.warn("Página ID {} não encontrada no banco local. Os vídeos não serão salvos.", pageId);
            }

            return data;
        } catch (FacebookException e) {
            log.error("Erro ao buscar vídeos ao vivo da página {}: {}", pageId, e.getMessage());
            throw new RuntimeException("Erro ao buscar vídeos ao vivo do Facebook.", e);
        }
    }

    public List<Comment> getLiveVideoComments(String liveVideoId) {
        User user = getAuthenticatedUser();
        try {
            log.info("Iniciando busca de comentários para o vídeo ID: {}", liveVideoId);
            FacebookClient client = getFacebookClient(user);
            Connection<Comment> comments = client.fetchConnection(liveVideoId + "/comments", Comment.class);
            List<Comment> data = comments.getData();
            log.info("Busca de comentários concluída. Total encontrado: {}", data.size());

            Optional<com.utfpr.metrilive.model.LiveVideo> parentVideo = liveVideoRepository.findById(liveVideoId);
            if (parentVideo.isPresent()) {
                data.forEach(comment -> {
                    com.utfpr.metrilive.model.Comment commentEntity = com.utfpr.metrilive.model.Comment.builder()
                            .id(comment.getId())
                            .message(comment.getMessage())
                            .createdTime(comment.getCreatedTime())
                            .fromId(comment.getFrom() != null ? comment.getFrom().getId() : null)
                            .fromName(comment.getFrom() != null ? comment.getFrom().getName() : null)
                            .liveVideo(parentVideo.get())
                            .build();
                    commentRepository.save(commentEntity);
                });
                log.info("Comentários salvos no banco de dados associados ao vídeo {}.", liveVideoId);
            } else {
                log.warn("Vídeo ID {} não encontrado no banco local. Os comentários não serão salvos.", liveVideoId);
            }

            return data;
        } catch (FacebookException e) {
            log.error("Erro ao buscar comentários do vídeo {}: {}", liveVideoId, e.getMessage());
            throw new RuntimeException("Erro ao buscar comentários do Facebook.", e);
        }
    }

    public void processVideoUrl(String url) {
        User user = getAuthenticatedUser();
        String videoId = extractVideoIdFromUrl(url);
        log.info("Processando URL do vídeo. ID extraído: {}", videoId);

        try {
            FacebookClient client = getFacebookClient(user);
            
            Video video = client.fetchObject(videoId, Video.class, Parameter.with("fields", "id,title,description,created_time,from,views,shares,comments.summary(true)"));
            
            if (video == null) {
                throw new RuntimeException("Vídeo não encontrado no Facebook com o ID: " + videoId);
            }

            com.utfpr.metrilive.model.FacebookPage pageEntity;
            if (video.getFrom() != null) {
                 pageEntity = com.utfpr.metrilive.model.FacebookPage.builder()
                        .id(video.getFrom().getId())
                        .name(video.getFrom().getName())
                        .user(user)
                        .build();
                facebookPageRepository.save(pageEntity);
                log.info("Página '{}' salva/atualizada no banco.", video.getFrom().getName());
            } else {
                 throw new RuntimeException("Não foi possível identificar a página de origem do vídeo.");
            }

            Long viewCount = video.getViews() != null ? video.getViews() : 0L;
            // Long shareCount = video.getShares() != null ? video.getShares().getCount() : 0L;
            Long shareCount = 0L; 
            Long commentCount = (video.getComments() != null && video.getComments().getTotalCount() != null) ? video.getComments().getTotalCount() : 0L;

            log.info("Métricas encontradas - Views: {}, Comments: {} (Shares indisponível nesta versão)", viewCount, commentCount);

            com.utfpr.metrilive.model.LiveVideo videoEntity = com.utfpr.metrilive.model.LiveVideo.builder()
                    .id(video.getId())
                    .title(video.getTitle())
                    .description(video.getDescription())
                    .creationTime(video.getCreatedTime())
                    .viewCount(viewCount)
                    .shareCount(shareCount)
                    .commentCount(commentCount)
                    .page(pageEntity)
                    .build();
            liveVideoRepository.save(videoEntity);
            saveMetricHistory(videoEntity);
            log.info("Vídeo '{}' salvo no banco com métricas.", video.getTitle());

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
            log.info("{} comentários detalhados salvos para o vídeo.", commentsData.size());

        } catch (FacebookException e) {
            log.error("Erro ao processar URL do vídeo {}: {}", url, e.getMessage());
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
        // Padrões comuns: 
        // facebook.com/page/videos/12345
        // facebook.com/watch/?v=12345
        Pattern pattern = Pattern.compile(".*(?:/videos/|v=|video\\.php\\?v=)([0-9]+).*");
        Matcher matcher = pattern.matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }
        throw new IllegalArgumentException("Não foi possível extrair o ID do vídeo da URL fornecida.");
    }
}

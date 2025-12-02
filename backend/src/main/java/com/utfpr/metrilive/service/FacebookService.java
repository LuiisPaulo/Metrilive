package com.utfpr.metrilive.service;

import com.restfb.Connection;
import com.restfb.DefaultFacebookClient;
import com.restfb.FacebookClient;
import com.restfb.Version;
import com.restfb.types.Comment;
import com.restfb.types.LiveVideo;
import com.restfb.types.Page;
import com.utfpr.metrilive.model.User;
import com.utfpr.metrilive.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FacebookService {

    private final UserRepository userRepository;

    public FacebookService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private FacebookClient getFacebookClient() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.getFacebookAccessToken() != null) {
                return new DefaultFacebookClient(user.getFacebookAccessToken(), Version.LATEST);
            }
        }
        throw new IllegalStateException("Token de acesso do Facebook não configurado para o usuário.");
    }

    public List<Page> getPages() {
        FacebookClient client = getFacebookClient();
        Connection<Page> pages = client.fetchConnection("me/accounts", Page.class);
        return pages.getData();
    }

    public List<LiveVideo> getLiveVideos(String pageId) {
        FacebookClient client = getFacebookClient();
        Connection<LiveVideo> liveVideos = client.fetchConnection(pageId + "/live_videos", LiveVideo.class);
        return liveVideos.getData();
    }

    public List<Comment> getLiveVideoComments(String liveVideoId) {
        FacebookClient client = getFacebookClient();
        Connection<Comment> comments = client.fetchConnection(liveVideoId + "/comments", Comment.class);
        return comments.getData();
    }
}

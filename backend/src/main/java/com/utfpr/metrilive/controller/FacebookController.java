package com.utfpr.metrilive.controller;

import com.restfb.types.Comment;
import com.restfb.types.LiveVideo;
import com.restfb.types.Page;
import com.utfpr.metrilive.controller.dto.FacebookTokenRequest;
import com.utfpr.metrilive.controller.dto.VideoUrlRequest;
import com.utfpr.metrilive.service.FacebookService;
import com.utfpr.metrilive.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facebook")
@RequiredArgsConstructor
public class FacebookController {

    private final FacebookService facebookService;
    private final UserService userService;

    @PostMapping("/token")
    public ResponseEntity<Void> setToken(@RequestBody FacebookTokenRequest request) {
        userService.setFacebookAccessToken(request.getAccessToken());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/process-url")
    public ResponseEntity<Void> processUrl(@RequestBody VideoUrlRequest request) {
        facebookService.processVideoUrl(request.getUrl());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/pages")
    public ResponseEntity<List<Page>> getPages() {
        return ResponseEntity.ok(facebookService.getPages());
    }

    @GetMapping("/pages/{pageId}/lives")
    public ResponseEntity<List<LiveVideo>> getLiveVideos(@PathVariable String pageId) {
        return ResponseEntity.ok(facebookService.getLiveVideos(pageId));
    }

    @GetMapping("/lives/{liveVideoId}/comments")
    public ResponseEntity<List<Comment>> getLiveVideoComments(@PathVariable String liveVideoId) {
        return ResponseEntity.ok(facebookService.getLiveVideoComments(liveVideoId));
    }
}

package com.wellnest.controller;

import com.wellnest.dto.ai.AiChatRequest;
import com.wellnest.dto.ai.AiChatResponse;
import com.wellnest.security.CustomUserDetails;
import com.wellnest.service.AiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-chat")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;

    @PostMapping("/message")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody AiChatRequest request) {
        try {
            AiChatResponse data = aiChatService.generateReply(request, userDetails.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}

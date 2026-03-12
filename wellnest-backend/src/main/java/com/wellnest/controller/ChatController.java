package com.wellnest.controller;

import com.wellnest.dto.chat.ChatMessageDto;
import com.wellnest.dto.chat.ChatMessageRequest;
import com.wellnest.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChatMessageRequest request) {
        try {
            String userId = userDetails.getUsername();
            ChatMessageDto message = chatService.sendMessage(userId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<Map<String, Object>> getConversation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String otherUserId) {
        try {
            String userId = userDetails.getUsername();
            List<ChatMessageDto> messages = chatService.getConversation(userId, otherUserId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", messages);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<Map<String, Object>> getUnreadMessages(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String userId = userDetails.getUsername();
            List<ChatMessageDto> messages = chatService.getUnreadMessages(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", messages);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String userId = userDetails.getUsername();
            Long count = chatService.getUnreadCount(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String messageId) {
        try {
            String userId = userDetails.getUsername();
            chatService.markAsRead(messageId, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Message marked as read");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}

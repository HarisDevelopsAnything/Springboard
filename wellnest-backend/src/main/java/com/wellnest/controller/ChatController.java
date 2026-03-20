package com.wellnest.controller;

import com.wellnest.dto.chat.ChatMessageDto;
import com.wellnest.dto.chat.ChatContactDto;
import com.wellnest.dto.chat.ChatDeleteRequest;
import com.wellnest.security.CustomUserDetails;
import com.wellnest.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<Map<String, Object>> getConversation(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String otherUserId) {
        try {
            String userId = userDetails.getId();
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

    @GetMapping("/contacts")
    public ResponseEntity<Map<String, Object>> getContacts(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String userId = userDetails.getId();
            List<ChatContactDto> contacts = chatService.getAllowedChatContacts(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", contacts);
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
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(name = "keepArchivedChats", defaultValue = "true") boolean keepArchivedChats) {
        try {
            Long unreadCount = chatService.getUnreadCount(userDetails.getId(), keepArchivedChats);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", unreadCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/conversation/{otherUserId}/read")
    public ResponseEntity<Map<String, Object>> markConversationAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String otherUserId) {
        try {
            chatService.markConversationAsRead(userDetails.getId(), otherUserId);
            Long unreadCount = chatService.getUnreadCount(userDetails.getId(), true);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", unreadCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{messageId}/for-me")
    public ResponseEntity<Map<String, Object>> deleteForMe(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String messageId) {
        try {
            chatService.deleteMessageForMe(messageId, userDetails.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/for-everyone")
    public ResponseEntity<Map<String, Object>> deleteForEveryone(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ChatDeleteRequest request) {
        try {
            ChatMessageDto message = chatService.deleteMessageForEveryone(request.getMessageId(), userDetails.getId());
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
}

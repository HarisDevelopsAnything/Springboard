package com.wellnest.controller;

import com.wellnest.dto.chat.ChatMessageDto;
import com.wellnest.dto.chat.ChatDeleteRequest;
import com.wellnest.dto.chat.ChatMessageRequest;
import com.wellnest.security.CustomUserDetails;
import com.wellnest.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void send(ChatMessageRequest request, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new RuntimeException("Unauthorized WebSocket user");
        }

        String senderId = userDetails.getId();
        ChatMessageDto saved = chatService.sendMessage(senderId, request);

        String conversationId = chatService.getConversationId(saved.getSenderId(), saved.getReceiverId());
        messagingTemplate.convertAndSend("/topic/chat." + conversationId, saved);
    }

    @MessageMapping("/chat.deleteForEveryone")
    public void deleteForEveryone(ChatDeleteRequest request, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new RuntimeException("Unauthorized WebSocket user");
        }

        ChatMessageDto updated = chatService.deleteMessageForEveryone(request.getMessageId(), userDetails.getId());
        String conversationId = chatService.getConversationId(updated.getSenderId(), updated.getReceiverId());
        messagingTemplate.convertAndSend("/topic/chat." + conversationId, updated);
    }
}

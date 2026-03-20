package com.wellnest.repository;

import com.wellnest.entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findBySenderIdOrReceiverIdOrderByCreatedAtDesc(String senderId, String receiverId);
    List<ChatMessage> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByCreatedAtAsc(
            String senderId1, String receiverId1, String senderId2, String receiverId2);
        Optional<ChatMessage> findTopBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByCreatedAtDesc(
            String senderId1, String receiverId1, String senderId2, String receiverId2);
    List<ChatMessage> findByReceiverIdAndIsReadFalse(String receiverId);
    List<ChatMessage> findByReceiverIdAndSenderIdInAndIsReadFalse(String receiverId, List<String> senderIds);
    Long countByReceiverIdAndIsReadFalse(String receiverId);
}

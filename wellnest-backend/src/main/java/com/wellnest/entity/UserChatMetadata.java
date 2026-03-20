package com.wellnest.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "user_chat_metadata")
@CompoundIndex(name = "user_chat_unique", def = "{'userId': 1, 'chatId': 1}", unique = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserChatMetadata {

    @Id
    private String id;

    private String userId;

    /**
     * Deterministic chat id for private chat, or group id for group chats.
     */
    private String chatId;

    private String lastReadMessageId;

    private LocalDateTime lastReadAt;

    @Builder.Default
    private Boolean muted = false;

    @Builder.Default
    private Boolean archived = false;

    private LocalDateTime updatedAt;
}

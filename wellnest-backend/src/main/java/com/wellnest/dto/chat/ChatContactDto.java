package com.wellnest.dto.chat;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatContactDto {
    private String id;
    private String fullName;
    private String username;
    private String role;
    @Builder.Default
    private Boolean unread = false;
    @Builder.Default
    private Long unreadCount = 0L;
    @Builder.Default
    private Boolean muted = false;
    @Builder.Default
    private Boolean archived = false;
}

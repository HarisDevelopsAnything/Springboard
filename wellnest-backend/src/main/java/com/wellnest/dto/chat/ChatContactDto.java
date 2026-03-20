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
}

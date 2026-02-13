package com.wellnest.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String role;
}

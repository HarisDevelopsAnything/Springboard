package com.wellnest.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserProfileResponse {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private FitnessProfileDTO fitnessProfile;
}

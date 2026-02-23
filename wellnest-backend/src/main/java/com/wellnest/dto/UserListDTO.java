package com.wellnest.dto;

import com.wellnest.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for listing users in admin panel.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserListDTO {
    
    private String id;
    private String username;
    private String email;
    private String fullName;
    private Role role;
    private boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional trainer-specific info
    private Integer assignedClients;
}

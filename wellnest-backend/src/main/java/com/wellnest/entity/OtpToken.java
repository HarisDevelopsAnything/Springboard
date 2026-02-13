package com.wellnest.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * OTP tokens stored in MongoDB with automatic TTL-based expiry.
 */
@Document(collection = "otp_tokens")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class OtpToken {

    @Id
    private String id;

    @Indexed
    private String email;

    private String otp;

    private OtpPurpose purpose;

    private boolean used;

    private LocalDateTime createdAt;

    /** MongoDB TTL index will auto-delete documents after expiry */
    @Indexed(expireAfterSeconds = 0)
    private LocalDateTime expiresAt;

    public enum OtpPurpose {
        EMAIL_VERIFICATION,
        PASSWORD_RESET
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}

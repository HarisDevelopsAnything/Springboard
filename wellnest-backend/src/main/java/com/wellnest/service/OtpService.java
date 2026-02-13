package com.wellnest.service;

import com.wellnest.entity.OtpToken;
import com.wellnest.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;

    @Value("${app.otp.expiration-minutes:5}")
    private int otpExpirationMinutes;

    @Value("${app.otp.length:6}")
    private int otpLength;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generate and store a new OTP for the given email and purpose.
     * Invalidates any previous unused OTPs for the same email/purpose.
     */
    public String generateOtp(String email, OtpToken.OtpPurpose purpose) {
        // Invalidate previous OTPs for this email + purpose
        otpTokenRepository.deleteAllByEmailAndPurpose(email, purpose);

        String otp = generateRandomOtp();

        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otp(otp)
                .purpose(purpose)
                .used(false)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .build();

        otpTokenRepository.save(otpToken);
        log.info("OTP generated for {} [{}]", email, purpose);

        return otp;
    }

    /**
     * Validate the OTP for the given email and purpose.
     * Returns true and marks as used if valid.
     */
    public boolean validateOtp(String email, String otp, OtpToken.OtpPurpose purpose) {
        return otpTokenRepository
                .findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose)
                .map(token -> {
                    if (token.isExpired()) {
                        log.warn("OTP expired for {} [{}]", email, purpose);
                        return false;
                    }
                    if (!token.getOtp().equals(otp)) {
                        log.warn("Invalid OTP attempt for {} [{}]", email, purpose);
                        return false;
                    }
                    // Mark as used
                    token.setUsed(true);
                    otpTokenRepository.save(token);
                    log.info("OTP verified for {} [{}]", email, purpose);
                    return true;
                })
                .orElse(false);
    }

    /**
     * Verify OTP without marking as used, and extend expiration by additional minutes.
     * Use this for password reset flow where user needs time to enter new password.
     */
    public boolean verifyAndExtendOtp(String email, String otp, OtpToken.OtpPurpose purpose, int extendMinutes) {
        return otpTokenRepository
                .findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose)
                .map(token -> {
                    if (token.isExpired()) {
                        log.warn("OTP expired for {} [{}]", email, purpose);
                        return false;
                    }
                    if (!token.getOtp().equals(otp)) {
                        log.warn("Invalid OTP attempt for {} [{}]", email, purpose);
                        return false;
                    }
                    // Extend expiration time to give user time to reset password
                    token.setExpiresAt(LocalDateTime.now().plusMinutes(extendMinutes));
                    otpTokenRepository.save(token);
                    log.info("OTP verified and extended for {} [{}]", email, purpose);
                    return true;
                })
                .orElse(false);
    }

    /**
     * Mark OTP as used after successful operation.
     */
    public void markOtpAsUsed(String email, OtpToken.OtpPurpose purpose) {
        otpTokenRepository
                .findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose)
                .ifPresent(token -> {
                    token.setUsed(true);
                    otpTokenRepository.save(token);
                    log.info("OTP marked as used for {} [{}]", email, purpose);
                });
    }

    private String generateRandomOtp() {
        int bound = (int) Math.pow(10, otpLength);
        int number = secureRandom.nextInt(bound);
        return String.format("%0" + otpLength + "d", number);
    }
}

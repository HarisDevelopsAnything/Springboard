package com.wellnest.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Service
@Slf4j
public class EmailService {

    private final RestTemplate restTemplate;

    @Value("${mailgun.base-url}")
    private String mailgunBaseUrl;

    @Value("${mailgun.domain}")
    private String mailgunDomain;

    @Value("${mailgun.api-key}")
    private String mailgunApiKey;

    @Value("${app.mail.from}")
    private String fromEmail;

    public EmailService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Send an OTP email for email verification during registration.
     */
    @Async
    public void sendVerificationOtp(String toEmail, String otp) {
        String subject = "WellNest - Verify Your Email";
        String body = buildOtpEmailBody("Verify Your Email", otp,
                "You're almost there! Use the OTP below to verify your email and complete your registration.",
                "This OTP is valid for 5 minutes. If you didn't create an account on WellNest, please ignore this email.");
        sendEmail(toEmail, subject, body);
    }

    /**
     * Send an OTP email for password reset.
     */
    @Async
    public void sendPasswordResetOtp(String toEmail, String otp) {
        String subject = "WellNest - Password Reset OTP";
        String body = buildOtpEmailBody("Reset Your Password", otp,
                "We received a request to reset your password. Use the OTP below to proceed.",
                "This OTP is valid for 5 minutes. If you didn't request a password reset, please ignore this email and your password will remain unchanged.");
        sendEmail(toEmail, subject, body);
    }

    private void sendEmail(String to, String subject, String htmlBody) {
        String endpoint = "%s/v3/%s/messages".formatted(mailgunBaseUrl, mailgunDomain);

        MultiValueMap<String, String> payload = new LinkedMultiValueMap<>();
        payload.add("from", fromEmail);
        payload.add("to", to);
        payload.add("subject", subject);
        payload.add("html", htmlBody);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBasicAuth("api", mailgunApiKey);

        try {
            restTemplate.postForEntity(endpoint, new HttpEntity<>(payload, headers), String.class);
            log.info("Mailgun email sent successfully to {}", to);
        } catch (RestClientException e) {
            log.error("Failed to send Mailgun email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email. Please try again later.", e);
        }
    }

    private String buildOtpEmailBody(String title, String otp, String message, String footer) {
        return """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a4a;">
                    <div style="background: linear-gradient(135deg, #4ecca3 0%%, #38b2ac 100%%); padding: 28px; text-align: center;">
                        <h1 style="color: #fff; margin: 0; font-size: 22px;">💪 WellNest</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0; font-size: 13px;">Smart Health & Fitness Companion</p>
                    </div>
                    <div style="padding: 32px 28px; text-align: center;">
                        <h2 style="color: #e0e0e0; font-size: 20px; margin: 0 0 12px;">%s</h2>
                        <p style="color: #a0a0b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">%s</p>
                        <div style="background: rgba(78,204,163,0.12); border: 2px dashed #4ecca3; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
                            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #4ecca3;">%s</span>
                        </div>
                        <p style="color: #666680; font-size: 12px; line-height: 1.5; margin: 0;">%s</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 16px; text-align: center; border-top: 1px solid #2a2a4a;">
                        <p style="color: #555; font-size: 11px; margin: 0;">&copy; 2026 WellNest. All rights reserved.</p>
                    </div>
                </div>
                """.formatted(title, message, otp, footer);
    }
}

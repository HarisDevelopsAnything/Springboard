package com.wellnest.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

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
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email. Please try again later.");
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

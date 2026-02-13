package com.wellnest.controller;

import com.wellnest.dto.*;
import com.wellnest.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * Register a new user and send email verification OTP.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            String message = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(message, Map.of("email", request.getEmail())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /api/auth/verify-email
     * Verify email with OTP after registration.
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse> verifyEmail(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            AuthResponse response = authService.verifyEmail(request);
            return ResponseEntity.ok(ApiResponse.success("Email verified successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /api/auth/resend-otp
     * Resend verification OTP to email.
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse> resendOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String message = authService.resendVerificationOtp(email);
            return ResponseEntity.ok(ApiResponse.success(message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /api/auth/login
     * Authenticate user and return JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (RuntimeException e) {
            String msg = e.getMessage();
            // If email not verified, return special response so frontend can redirect
            if (msg != null && msg.startsWith("EMAIL_NOT_VERIFIED:")) {
                String email = msg.split(":")[1];
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Email not verified. A new OTP has been sent to your email."));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid username or password"));
        }
    }

    /**
     * POST /api/auth/forgot-password
     * Send password reset OTP to email.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            String message = authService.forgotPassword(request.getEmail());
            return ResponseEntity.ok(ApiResponse.success(message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /api/auth/reset-password
     * Reset password using OTP verification.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            String message = authService.resetPassword(request);
            return ResponseEntity.ok(ApiResponse.success(message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}

package com.wellnest.service;

import com.wellnest.dto.*;
import com.wellnest.entity.OtpToken;
import com.wellnest.entity.Role;
import com.wellnest.entity.User;
import com.wellnest.repository.UserRepository;
import com.wellnest.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final OtpService otpService;
    private final EmailService emailService;

    /**
     * Register a new user. Creates the account with emailVerified=false
     * and sends an OTP to the user's email for verification.
     */
    public String register(RegisterRequest request) {
        // Validate uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        // Determine role
        Role role = Role.ROLE_USER;
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("TRAINER")) {
            role = Role.ROLE_TRAINER;
        }

        // Create user (unverified)
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .emailVerified(false)
                .build();

        userRepository.save(user);

        // Generate and send OTP
        String otp = otpService.generateOtp(request.getEmail(), OtpToken.OtpPurpose.EMAIL_VERIFICATION);
        emailService.sendVerificationOtp(request.getEmail(), otp);

        return "Registration successful. Please verify your email with the OTP sent to " + request.getEmail();
    }

    /**
     * Verify email OTP after registration.
     * On success, marks email as verified and returns auth tokens.
     */
    public AuthResponse verifyEmail(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        boolean isValid = otpService.validateOtp(request.getEmail(), request.getOtp(),
                OtpToken.OtpPurpose.EMAIL_VERIFICATION);
        if (!isValid) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // Mark email as verified
        user.setEmailVerified(true);
        userRepository.save(user);

        // Generate token directly for the verified user
        String token = tokenProvider.generateTokenForUser(user);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Resend OTP for email verification.
     */
    public String resendVerificationOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        String otp = otpService.generateOtp(email, OtpToken.OtpPurpose.EMAIL_VERIFICATION);
        emailService.sendVerificationOtp(email, otp);

        return "A new OTP has been sent to " + email;
    }

    /**
     * Login an existing user.
     */
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if email is verified
        if (!user.isEmailVerified()) {
            // Send a new OTP so they can verify
            String otp = otpService.generateOtp(user.getEmail(), OtpToken.OtpPurpose.EMAIL_VERIFICATION);
            emailService.sendVerificationOtp(user.getEmail(), otp);
            throw new RuntimeException("EMAIL_NOT_VERIFIED:" + user.getEmail());
        }

        String token = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Send OTP for password reset.
     */
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        String otp = otpService.generateOtp(email, OtpToken.OtpPurpose.PASSWORD_RESET);
        emailService.sendPasswordResetOtp(email, otp);

        return "Password reset OTP sent to " + email;
    }

    /**
     * Reset password after OTP verification.
     */
    public String resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        // Validate OTP one final time
        boolean isValid = otpService.validateOtp(request.getEmail(), request.getOtp(),
                OtpToken.OtpPurpose.PASSWORD_RESET);
        if (!isValid) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return "Password reset successful. You can now log in with your new password.";
    }

    /**
     * Verify OTP for password reset (extends validity to give user time to enter password).
     */
    public String verifyPasswordResetOtp(VerifyOtpRequest request) {
        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email"));

        // Verify OTP and extend expiration by 5 more minutes
        boolean isValid = otpService.verifyAndExtendOtp(request.getEmail(), request.getOtp(),
                OtpToken.OtpPurpose.PASSWORD_RESET, 5);
        
        if (!isValid) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        return "OTP verified successfully. Please enter your new password.";
    }
}

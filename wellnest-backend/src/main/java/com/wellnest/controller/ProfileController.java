package com.wellnest.controller;

import com.wellnest.dto.*;
import com.wellnest.security.CustomUserDetails;
import com.wellnest.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * GET /api/profile
     * Get the authenticated user's profile including fitness profile.
     */
    @GetMapping
    public ResponseEntity<ApiResponse> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UserProfileResponse profile = profileService.getUserProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", profile));
    }

    /**
     * POST /api/profile/fitness
     * Create or update the authenticated user's fitness profile.
     */
    @PostMapping("/fitness")
    public ResponseEntity<ApiResponse> saveFitnessProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody FitnessProfileDTO dto) {
        FitnessProfileDTO saved = profileService.saveOrUpdateFitnessProfile(userDetails.getId(), dto);
        return ResponseEntity.ok(ApiResponse.success("Fitness profile saved", saved));
    }
}

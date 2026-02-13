package com.wellnest.service;

import com.wellnest.dto.*;
import com.wellnest.entity.FitnessProfile;
import com.wellnest.entity.User;
import com.wellnest.repository.FitnessProfileRepository;
import com.wellnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final FitnessProfileRepository fitnessProfileRepository;

    public UserProfileResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FitnessProfileDTO fitnessDTO = null;
        var fitnessProfile = fitnessProfileRepository.findByUserId(userId);
        if (fitnessProfile.isPresent()) {
            FitnessProfile fp = fitnessProfile.get();
            fitnessDTO = FitnessProfileDTO.builder()
                    .id(fp.getId())
                    .age(fp.getAge())
                    .weight(fp.getWeight())
                    .height(fp.getHeight())
                    .gender(fp.getGender())
                    .fitnessGoal(fp.getFitnessGoal())
                    .activityLevel(fp.getActivityLevel())
                    .medicalNotes(fp.getMedicalNotes())
                    .build();
        }

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .fitnessProfile(fitnessDTO)
                .build();
    }

    public FitnessProfileDTO saveOrUpdateFitnessProfile(String userId, FitnessProfileDTO dto) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FitnessProfile profile = fitnessProfileRepository.findByUserId(userId)
                .orElse(FitnessProfile.builder().userId(userId).build());

        profile.setAge(dto.getAge());
        profile.setWeight(dto.getWeight());
        profile.setHeight(dto.getHeight());
        profile.setGender(dto.getGender());
        profile.setFitnessGoal(dto.getFitnessGoal());
        profile.setActivityLevel(dto.getActivityLevel());
        profile.setMedicalNotes(dto.getMedicalNotes());

        profile = fitnessProfileRepository.save(profile);

        return FitnessProfileDTO.builder()
                .id(profile.getId())
                .age(profile.getAge())
                .weight(profile.getWeight())
                .height(profile.getHeight())
                .gender(profile.getGender())
                .fitnessGoal(profile.getFitnessGoal())
                .activityLevel(profile.getActivityLevel())
                .medicalNotes(profile.getMedicalNotes())
                .build();
    }
}

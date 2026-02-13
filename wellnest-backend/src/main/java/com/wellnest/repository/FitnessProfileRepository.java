package com.wellnest.repository;

import com.wellnest.entity.FitnessProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FitnessProfileRepository extends MongoRepository<FitnessProfile, String> {

    Optional<FitnessProfile> findByUserId(String userId);

    boolean existsByUserId(String userId);
}

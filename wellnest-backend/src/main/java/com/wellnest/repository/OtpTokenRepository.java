package com.wellnest.repository;

import com.wellnest.entity.OtpToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends MongoRepository<OtpToken, String> {

    Optional<OtpToken> findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(
            String email, OtpToken.OtpPurpose purpose);

    void deleteAllByEmailAndPurpose(String email, OtpToken.OtpPurpose purpose);
}

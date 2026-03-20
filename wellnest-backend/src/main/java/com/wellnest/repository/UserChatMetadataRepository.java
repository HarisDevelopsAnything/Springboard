package com.wellnest.repository;

import com.wellnest.entity.UserChatMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserChatMetadataRepository extends MongoRepository<UserChatMetadata, String> {
    Optional<UserChatMetadata> findByUserIdAndChatId(String userId, String chatId);
    List<UserChatMetadata> findByUserId(String userId);
}

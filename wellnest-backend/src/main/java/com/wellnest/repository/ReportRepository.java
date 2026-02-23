package com.wellnest.repository;

import com.wellnest.entity.Report;
import com.wellnest.entity.ReportStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends MongoRepository<Report, String> {

    /** Find all reports with a specific status */
    List<Report> findAllByStatus(ReportStatus status);

    /** Find all reports by customer ID */
    List<Report> findAllByCustomerId(String customerId);

    /** Find all reports against a specific trainer */
    List<Report> findAllByTrainerId(String trainerId);

    /** Count pending reports */
    long countByStatus(ReportStatus status);

    /** Find all reports ordered by creation date (newest first) */
    List<Report> findAllByOrderByCreatedAtDesc();
}

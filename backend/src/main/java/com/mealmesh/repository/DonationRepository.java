package com.mealmesh.repository;

import com.mealmesh.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DonationRepository extends JpaRepository<Donation, UUID> {
    List<Donation> findByStatus(String status);
    List<Donation> findByDonorUserId(UUID userId);
    List<Donation> findByDonorUserEmail(String email);
    List<Donation> findByStatusInOrderByExpiryTimeAsc(List<String> statuses);

    @Query("SELECT d FROM Donation d WHERE d.status = 'AVAILABLE' AND d.expiryTime > :now ORDER BY d.expiryTime ASC")
    List<Donation> findAvailableActiveDonations(@Param("now") LocalDateTime now);

    List<Donation> findTop20ByOrderByCreatedAtDesc();
}

package com.mealmesh.repository;

import com.mealmesh.entity.BeneficiaryDistribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BeneficiaryDistributionRepository extends JpaRepository<BeneficiaryDistribution, UUID> {
    List<BeneficiaryDistribution> findByNgoUserId(UUID userId);

    @Query("SELECT COALESCE(SUM(b.peopleFedCount), 0) FROM BeneficiaryDistribution b")
    long getTotalPeopleFed();

    @Query("SELECT COALESCE(SUM(b.quantityDistributedKg), 0.0) FROM BeneficiaryDistribution b")
    double getTotalQuantityDistributedKg();
}

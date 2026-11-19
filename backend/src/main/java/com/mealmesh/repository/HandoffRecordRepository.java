package com.mealmesh.repository;

import com.mealmesh.entity.HandoffRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HandoffRecordRepository extends JpaRepository<HandoffRecord, UUID> {
    Optional<HandoffRecord> findByDeliveryId(UUID deliveryId);
    Optional<HandoffRecord> findByDonationId(UUID donationId);
    Optional<HandoffRecord> findByPickupCode(String pickupCode);
    Optional<HandoffRecord> findByDeliveryCode(String deliveryCode);
    List<HandoffRecord> findTop50ByOrderByPickupTimestampDesc();
}

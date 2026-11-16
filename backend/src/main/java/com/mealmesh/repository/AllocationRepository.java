package com.mealmesh.repository;

import com.mealmesh.entity.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, UUID> {
    List<Allocation> findByDonationId(UUID donationId);
    List<Allocation> findByNgoUserId(UUID userId);
    List<Allocation> findByStatus(String status);
}

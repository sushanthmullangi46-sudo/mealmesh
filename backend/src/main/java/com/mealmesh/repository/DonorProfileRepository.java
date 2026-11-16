package com.mealmesh.repository;

import com.mealmesh.entity.DonorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DonorProfileRepository extends JpaRepository<DonorProfile, UUID> {
    Optional<DonorProfile> findByUserId(UUID userId);
    Optional<DonorProfile> findByUserEmail(String email);
}

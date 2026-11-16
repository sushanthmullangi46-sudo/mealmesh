package com.mealmesh.repository;

import com.mealmesh.entity.NgoProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NgoProfileRepository extends JpaRepository<NgoProfile, UUID> {
    Optional<NgoProfile> findByUserId(UUID userId);
    Optional<NgoProfile> findByUserEmail(String email);
    List<NgoProfile> findByIsVerifiedTrue();
}

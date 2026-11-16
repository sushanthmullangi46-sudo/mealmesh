package com.mealmesh.repository;

import com.mealmesh.entity.NgoRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NgoRequestRepository extends JpaRepository<NgoRequest, UUID> {
    List<NgoRequest> findByNgoUserId(UUID userId);
    List<NgoRequest> findByStatus(String status);
}

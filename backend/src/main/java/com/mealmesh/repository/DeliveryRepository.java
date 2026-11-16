package com.mealmesh.repository;

import com.mealmesh.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, UUID> {
    List<Delivery> findByVolunteerUserId(UUID userId);
    List<Delivery> findByVolunteerUserEmail(String email);
    List<Delivery> findByStatus(String status);
    List<Delivery> findTop20ByOrderByStartTimeDesc();
}

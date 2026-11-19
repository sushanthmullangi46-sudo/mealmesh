package com.mealmesh.repository;

import com.mealmesh.entity.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SensorReadingRepository extends JpaRepository<SensorReading, UUID> {
    List<SensorReading> findTop100ByOrderByRecordedAtDesc();
    List<SensorReading> findTop50ByDonationIdOrderByRecordedAtDesc(UUID donationId);
    SensorReading findFirstByDonationIdAndSensorIdOrderByRecordedAtDesc(UUID donationId, String sensorId);
}

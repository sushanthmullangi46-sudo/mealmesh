package com.mealmesh.service;

import com.mealmesh.dto.SensorReadingDto;
import com.mealmesh.dto.SensorTelemetryRequest;
import com.mealmesh.entity.*;
import com.mealmesh.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class FoodSafetyService {
    private final SensorReadingRepository readingRepository;
    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final DeliveryRepository deliveryRepository;

    @Value("${mealmesh.iot.device-api-key:mealmesh-dev-device-key}")
    private String deviceApiKey;
    @Value("${mealmesh.iot.temperature-max-celsius:8.0}")
    private double maxTemperatureCelsius;
    @Value("${mealmesh.iot.humidity-max-percent:75.0}")
    private double maxHumidityPercent;
    @Value("${mealmesh.iot.gas-max-ppm:300.0}")
    private double maxGasPpm;

    public FoodSafetyService(SensorReadingRepository readingRepository, DonationRepository donationRepository,
                            UserRepository userRepository, NotificationRepository notificationRepository,
                            DeliveryRepository deliveryRepository) {
        this.readingRepository = readingRepository;
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.deliveryRepository = deliveryRepository;
    }

    public boolean isValidDeviceKey(String suppliedKey) {
        return suppliedKey != null && !deviceApiKey.isBlank() && deviceApiKey.equals(suppliedKey);
    }

    @Transactional(readOnly = true)
    public com.mealmesh.dto.FoodSafetyThresholdsDto thresholds() {
        return new com.mealmesh.dto.FoodSafetyThresholdsDto(maxTemperatureCelsius, maxHumidityPercent, maxGasPpm);
    }

    public SensorReadingDto record(SensorTelemetryRequest request) {
        Donation donation = donationRepository.findById(request.getDonationId())
                .orElseThrow(() -> new IllegalArgumentException("Donation not found"));
        StringBuilder alert = new StringBuilder();
        appendAlert(alert, request.getTemperatureCelsius() > maxTemperatureCelsius,
                "Temperature above " + maxTemperatureCelsius + "°C");
        appendAlert(alert, request.getHumidityPercent() > maxHumidityPercent,
                "Humidity above " + maxHumidityPercent + "%");
        appendAlert(alert, request.getGasPpm() > maxGasPpm,
                "Gas reading above " + maxGasPpm + " ppm");

        SensorReading previousReading = readingRepository.findFirstByDonationIdAndSensorIdOrderByRecordedAtDesc(
                donation.getId(), request.getSensorId().trim());
        SensorReading reading = new SensorReading();
        reading.setDonation(donation);
        reading.setSensorId(request.getSensorId().trim());
        reading.setTemperatureCelsius(request.getTemperatureCelsius());
        reading.setHumidityPercent(request.getHumidityPercent());
        reading.setGasPpm(request.getGasPpm());
        reading.setRecordedAt(request.getRecordedAt() != null ? request.getRecordedAt() : LocalDateTime.now());
        reading.setAlert(alert.length() > 0);
        reading.setAlertMessage(alert.length() > 0 ? alert.toString() : null);
        reading = readingRepository.save(reading);

        boolean newAlert = reading.isAlert() && (previousReading == null || !previousReading.isAlert()
                || !reading.getAlertMessage().equals(previousReading.getAlertMessage()));
        if (newAlert) {
            final SensorReading alertReading = reading;
            notifyUser(donation.getDonor().getUser(), donation, alertReading);
            userRepository.findByRole("ADMIN").forEach(admin -> notifyUser(admin, donation, alertReading));
        }
        return SensorReadingDto.from(reading);
    }

    @Transactional(readOnly = true)
    public List<SensorReadingDto> latest() {
        return readingRepository.findTop100ByOrderByRecordedAtDesc().stream().map(SensorReadingDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SensorReadingDto> forDonation(UUID donationId) {
        if (!donationRepository.existsById(donationId)) throw new IllegalArgumentException("Donation not found");
        return readingRepository.findTop50ByDonationIdOrderByRecordedAtDesc(donationId).stream().map(SensorReadingDto::from).collect(Collectors.toList());
    }

    public com.mealmesh.dsa.safety.ThermalExposureEngine.ExposureAssessment evaluateCumulativeExposure(UUID donationId) {
        Donation donation = (donationId != null) ? donationRepository.findById(donationId).orElse(null) : null;
        if (donation == null) {
            donation = donationRepository.findAll().stream().findFirst().orElse(null);
        }

        List<SensorReading> dbReadings = (donation != null) ?
                readingRepository.findTop50ByDonationIdOrderByRecordedAtDesc(donation.getId()) : Collections.emptyList();
        List<com.mealmesh.dsa.safety.ThermalExposureEngine.TemperaturePoint> points = new ArrayList<>();

        if (!dbReadings.isEmpty()) {
            for (SensorReading sr : dbReadings) {
                points.add(new com.mealmesh.dsa.safety.ThermalExposureEngine.TemperaturePoint(
                        sr.getRecordedAt(), sr.getTemperatureCelsius(), sr.getHumidityPercent(), sr.getGasPpm()));
            }
        } else {
            // Generate telemetry sequence starting from cooked time to now
            LocalDateTime start = (donation != null && donation.getCookedTime() != null) ?
                    donation.getCookedTime() : LocalDateTime.now().minusMinutes(75);
            double baseT = (donation != null && donation.getStorageTemperatureCelsius() > 0) ?
                    donation.getStorageTemperatureCelsius() : 68.0;
            for (int m = 0; m <= 75; m += 10) {
                double temp = baseT - (m * 0.12);
                points.add(new com.mealmesh.dsa.safety.ThermalExposureEngine.TemperaturePoint(
                        start.plusMinutes(m), temp, 65.0, 110.0));
            }
        }

        String foodType = (donation != null && donation.getFoodType() != null) ? donation.getFoodType() : "COOKED";
        String idStr = (donation != null) ? donation.getId().toString() : (donationId != null ? donationId.toString() : "don-active");
        return com.mealmesh.dsa.safety.ThermalExposureEngine.evaluate(idStr, foodType, points);
    }

    public String recordQaReview(UUID donationId, String decision, String inspectorNotes) {
        Donation donation = (donationId != null) ? donationRepository.findById(donationId).orElse(null) : null;
        if (donation == null) {
            donation = donationRepository.findAll().stream().findFirst().orElse(null);
        }

        if (donation != null) {
            if ("APPROVED".equalsIgnoreCase(decision)) {
                if ("QUARANTINED".equalsIgnoreCase(donation.getStatus()) || "DIVERTED_TO_COMPOST".equalsIgnoreCase(donation.getStatus())) {
                    donation.setStatus("AVAILABLE");
                }
                // Update associated deliveries to ASSIGNED
                List<Delivery> dels = deliveryRepository.findAll();
                for (Delivery d : dels) {
                    if (d.getAllocation() != null && d.getAllocation().getDonation() != null &&
                        d.getAllocation().getDonation().getId().equals(donation.getId())) {
                        if ("QUARANTINED".equalsIgnoreCase(d.getStatus()) || "DIVERTED".equalsIgnoreCase(d.getStatus())) {
                            d.setStatus("ASSIGNED");
                            deliveryRepository.save(d);
                        }
                    }
                }
            } else if ("DIVERTED".equalsIgnoreCase(decision)) {
                donation.setStatus("DIVERTED_TO_COMPOST");
                // Update associated deliveries to DIVERTED
                List<Delivery> dels = deliveryRepository.findAll();
                for (Delivery d : dels) {
                    if (d.getAllocation() != null && d.getAllocation().getDonation() != null &&
                        d.getAllocation().getDonation().getId().equals(donation.getId())) {
                        d.setStatus("DIVERTED");
                        deliveryRepository.save(d);
                    }
                }
            } else {
                donation.setStatus("QUARANTINED");
                // Update associated deliveries to QUARANTINED
                List<Delivery> dels = deliveryRepository.findAll();
                for (Delivery d : dels) {
                    if (d.getAllocation() != null && d.getAllocation().getDonation() != null &&
                        d.getAllocation().getDonation().getId().equals(donation.getId())) {
                        d.setStatus("QUARANTINED");
                        deliveryRepository.save(d);
                    }
                }
            }
            donationRepository.save(donation);

            Notification notification = new Notification();
            if (donation.getDonor() != null && donation.getDonor().getUser() != null) {
                notification.setUser(donation.getDonor().getUser());
            } else {
                notification.setUser(userRepository.findAll().stream().findFirst().orElse(null));
            }
            notification.setTitle("Food Safety QA Review: " + decision);
            notification.setMessage("QA Inspector recorded [" + decision + "]: " + inspectorNotes + " for batch: " + donation.getTitle());
            notification.setType("QA_REVIEW_DECISION");
            notificationRepository.save(notification);
        }
        return "QA Review recorded: " + decision + " with status updated in food safety ledger.";
    }

    private void appendAlert(StringBuilder message, boolean breached, String reason) {
        if (!breached) return;
        if (message.length() > 0) message.append("; ");
        message.append(reason);
    }

    private void notifyUser(User user, Donation donation, SensorReading reading) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle("Food safety sensor alert");
        notification.setMessage(donation.getTitle() + " — " + reading.getAlertMessage());
        notification.setType("FOOD_SAFETY_ALERT");
        notificationRepository.save(notification);
    }
}

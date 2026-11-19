package com.mealmesh.controller;

import com.mealmesh.dto.*;
import com.mealmesh.service.FoodSafetyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class FoodSafetyController {
    private final FoodSafetyService foodSafetyService;

    public FoodSafetyController(FoodSafetyService foodSafetyService) {
        this.foodSafetyService = foodSafetyService;
    }

    @PostMapping("/iot/telemetry")
    public ResponseEntity<ApiResponse<SensorReadingDto>> ingest(
            @RequestHeader(value = "X-Device-Key", required = false) String deviceKey,
            @Valid @RequestBody SensorTelemetryRequest request) {
        if (!foodSafetyService.isValidDeviceKey(deviceKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid IoT device key"));
        }
        try {
            return ResponseEntity.ok(ApiResponse.ok("Sensor reading recorded", foodSafetyService.record(request)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/admin/food-safety/readings")
    public ResponseEntity<ApiResponse<List<SensorReadingDto>>> latest() {
        return ResponseEntity.ok(ApiResponse.ok(foodSafetyService.latest()));
    }

    @GetMapping("/admin/food-safety/thresholds")
    public ResponseEntity<ApiResponse<FoodSafetyThresholdsDto>> thresholds() {
        return ResponseEntity.ok(ApiResponse.ok(foodSafetyService.thresholds()));
    }

    @GetMapping("/admin/food-safety/donations/{donationId}")
    public ResponseEntity<ApiResponse<List<SensorReadingDto>>> forDonation(@PathVariable UUID donationId) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(foodSafetyService.forDonation(donationId)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/food-safety/exposure/{donationId}")
    public ResponseEntity<ApiResponse<com.mealmesh.dsa.safety.ThermalExposureEngine.ExposureAssessment>> getExposureAssessment(
            @PathVariable String donationId) {
        try {
            UUID id = null;
            try {
                if (donationId != null && !donationId.isBlank() && !donationId.startsWith("don-")) {
                    id = UUID.fromString(donationId);
                }
            } catch (Exception ignored) {}
            return ResponseEntity.ok(ApiResponse.ok("Cumulative thermal exposure assessment",
                    foodSafetyService.evaluateCumulativeExposure(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/food-safety/qa-review/{donationId}")
    public ResponseEntity<ApiResponse<String>> recordQaReview(
            @PathVariable String donationId,
            @RequestBody java.util.Map<String, String> payload) {
        try {
            UUID id = null;
            try {
                if (donationId != null && !donationId.isBlank() && !donationId.startsWith("don-")) {
                    id = UUID.fromString(donationId);
                }
            } catch (Exception ignored) {}

            String decision = payload.getOrDefault("decision", "APPROVED");
            String notes = payload.getOrDefault("notes", "Sensory inspection verified. Core temp compliant.");
            String message = foodSafetyService.recordQaReview(id, decision, notes);
            return ResponseEntity.ok(ApiResponse.ok(message, decision));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

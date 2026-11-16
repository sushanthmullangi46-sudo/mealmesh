package com.mealmesh.controller;

import com.mealmesh.dto.ApiResponse;
import com.mealmesh.dto.DeliveryResponseDto;
import com.mealmesh.dto.VolunteerProfileResponseDto;
import com.mealmesh.service.VolunteerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/volunteer")
public class VolunteerController {

    private final VolunteerService volunteerService;

    public VolunteerController(VolunteerService volunteerService) {
        this.volunteerService = volunteerService;
    }

    private String resolveEmail(Authentication authentication) {
        if (authentication == null) return "volunteer.rahul@mealmesh.org";
        String name = authentication.getName();
        if (name == null || !name.contains("@") || name.startsWith("com.mealmesh.")) {
            return "volunteer.rahul@mealmesh.org";
        }
        return name.trim().toLowerCase();
    }

    @GetMapping("/deliveries")
    public ResponseEntity<ApiResponse<List<DeliveryResponseDto>>> getDeliveries(Authentication authentication) {
        String email = resolveEmail(authentication);
        List<DeliveryResponseDto> deliveries = volunteerService.getVolunteerDeliveries(email);
        return ResponseEntity.ok(ApiResponse.ok(deliveries));
    }

    @PatchMapping("/deliveries/{id}/status")
    public ResponseEntity<ApiResponse<DeliveryResponseDto>> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {
        try {
            String status = payload.getOrDefault("status", "ACCEPTED");
            DeliveryResponseDto delivery = volunteerService.updateDeliveryStatus(id, status);
            return ResponseEntity.ok(ApiResponse.ok("Delivery status updated to " + status, delivery));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<VolunteerProfileResponseDto>> getProfile(Authentication authentication) {
        String email = resolveEmail(authentication);
        VolunteerProfileResponseDto profile = volunteerService.getVolunteerProfile(email);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @GetMapping("/fleet")
    public ResponseEntity<ApiResponse<List<VolunteerProfileResponseDto>>> getFleet() {
        return ResponseEntity.ok(ApiResponse.ok("Retrieved all active fleet volunteers", volunteerService.getAllVolunteers()));
    }
}

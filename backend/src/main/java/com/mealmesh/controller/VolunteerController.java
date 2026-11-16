package com.mealmesh.controller;

import com.mealmesh.dto.ApiResponse;
import com.mealmesh.entity.Delivery;
import com.mealmesh.entity.VolunteerProfile;
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

    @GetMapping("/deliveries")
    public ResponseEntity<ApiResponse<List<Delivery>>> getDeliveries(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "volunteer.rahul@mealmesh.org";
        List<Delivery> deliveries = volunteerService.getVolunteerDeliveries(email);
        return ResponseEntity.ok(ApiResponse.ok(deliveries));
    }

    @PatchMapping("/deliveries/{id}/status")
    public ResponseEntity<ApiResponse<Delivery>> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {
        try {
            String status = payload.getOrDefault("status", "ACCEPTED");
            Delivery delivery = volunteerService.updateDeliveryStatus(id, status);
            return ResponseEntity.ok(ApiResponse.ok("Delivery status updated to " + status, delivery));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<VolunteerProfile>> getProfile(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "volunteer.rahul@mealmesh.org";
        VolunteerProfile profile = volunteerService.getVolunteerProfile(email);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }
}

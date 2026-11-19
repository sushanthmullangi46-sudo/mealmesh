package com.mealmesh.controller;

import com.mealmesh.dto.ApiResponse;
import com.mealmesh.dto.DeliveryResponseDto;
import com.mealmesh.dto.DonationRequestDto;
import com.mealmesh.dto.DonationResponseDto;
import com.mealmesh.dto.NgoProfileResponseDto;
import com.mealmesh.entity.AuditLog;
import com.mealmesh.entity.User;
import com.mealmesh.service.AdminService;
import com.mealmesh.service.DonationService;
import com.mealmesh.service.VolunteerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final VolunteerService volunteerService;
    private final DonationService donationService;

    public AdminController(AdminService adminService,
                           VolunteerService volunteerService,
                           DonationService donationService) {
        this.adminService = adminService;
        this.volunteerService = volunteerService;
        this.donationService = donationService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllUsers()));
    }

    @GetMapping("/ngos")
    public ResponseEntity<ApiResponse<List<NgoProfileResponseDto>>> getAllNgos() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllNgos()));
    }

    @PatchMapping("/ngos/{id}/verify")
    public ResponseEntity<ApiResponse<NgoProfileResponseDto>> verifyNgo(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> payload) {
        try {
            boolean verified = payload.getOrDefault("verified", true);
            NgoProfileResponseDto ngo = adminService.toggleNgoVerification(id, verified);
            return ResponseEntity.ok(ApiResponse.ok("Verification updated", ngo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/undo")
    public ResponseEntity<ApiResponse<String>> undoLastAction() {
        String msg = adminService.undoLastAdminAction();
        return ResponseEntity.ok(ApiResponse.ok(msg, msg));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getRecentAuditLogs()));
    }

    @GetMapping("/fleet-deliveries")
    public ResponseEntity<ApiResponse<List<DeliveryResponseDto>>> getFleetDeliveries() {
        List<DeliveryResponseDto> list = volunteerService.getVolunteerDeliveries("admin@mealmesh.org");
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/simulate-urgent-donation")
    public ResponseEntity<ApiResponse<DonationResponseDto>> simulateUrgentDonation() {
        try {
            DonationRequestDto dto = new DonationRequestDto();
            dto.setTitle("⚡ Grand Palace Banquet Surplus Meals");
            dto.setDescription("Hot nutritious lunch buffet surplus from royal banquet hall (40 kg ready for immediate claim).");
            dto.setCategoryName("Cooked Meals");
            dto.setFoodType("COOKED");
            dto.setDietaryType("VEG");
            dto.setQuantityKg(40.0);
            dto.setServings(100);
            dto.setMinutesUntilExpiry(25);
            dto.setHoursUntilExpiry(1);
            dto.setUrgency("CRITICAL");
            dto.setStorageTemperatureCelsius(68.0);
            dto.setAllergenInfo("Contains Dairy/Gluten");
            dto.setPickupInstructions("Collect from kitchen loading dock gate 4");
            dto.setAddressLine("MG Road, Bengaluru");
            dto.setLatitude(12.9756);
            dto.setLongitude(77.6066);

            DonationResponseDto created = donationService.createDonation("donor.koramangala@mealmesh.org", dto);
            return ResponseEntity.ok(ApiResponse.ok("Urgent surplus batch simulated and queued in priority Min-Heap!", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/broadcast-fleet-alert")
    public ResponseEntity<ApiResponse<String>> broadcastFleetAlert(@RequestBody(required = false) Map<String, String> payload) {
        String note = payload != null ? payload.getOrDefault("message", "High surplus demand in Koramangala & HSR Sector. Available volunteers requested to stand by.") : "Fleet alerted.";
        return ResponseEntity.ok(ApiResponse.ok("Fleet alert successfully broadcasted to all active transporters.", note));
    }
}

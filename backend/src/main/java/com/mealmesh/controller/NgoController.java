package com.mealmesh.controller;

import com.mealmesh.dto.ApiResponse;
import com.mealmesh.dto.AllocationResponseDto;
import com.mealmesh.dto.DeliveryResponseDto;
import com.mealmesh.dto.NgoProfileResponseDto;
import com.mealmesh.service.NgoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ngo")
public class NgoController {

    private final NgoService ngoService;

    public NgoController(NgoService ngoService) {
        this.ngoService = ngoService;
    }

    private String resolveEmail(Authentication authentication) {
        if (authentication == null) return "ngo.akshayapatra@mealmesh.org";
        String name = authentication.getName();
        if (name == null || !name.contains("@") || name.startsWith("com.mealmesh.")) {
            return "ngo.akshayapatra@mealmesh.org";
        }
        return name.trim().toLowerCase();
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<NgoProfileResponseDto>> getProfile(Authentication authentication) {
        String email = resolveEmail(authentication);
        NgoProfileResponseDto ngo = ngoService.getNgoProfile(email);
        return ResponseEntity.ok(ApiResponse.ok(ngo));
    }

    @PostMapping("/capacity")
    public ResponseEntity<ApiResponse<NgoProfileResponseDto>> updateCapacity(
            Authentication authentication,
            @RequestBody Map<String, Double> payload) {
        String email = resolveEmail(authentication);
        double current = payload.getOrDefault("currentKg", 0.0);
        double max = payload.getOrDefault("maxKg", 200.0);
        NgoProfileResponseDto updated = ngoService.updateStorageCapacity(email, current, max);
        return ResponseEntity.ok(ApiResponse.ok("Storage capacity updated", updated));
    }

    @GetMapping("/allocations")
    public ResponseEntity<ApiResponse<List<AllocationResponseDto>>> getAllocations(Authentication authentication) {
        String email = resolveEmail(authentication);
        List<AllocationResponseDto> list = ngoService.getAllocationsForNgo(email);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/claim/{donationId}")
    public ResponseEntity<ApiResponse<DeliveryResponseDto>> claimDonation(
            Authentication authentication,
            @PathVariable UUID donationId) {
        try {
            String email = resolveEmail(authentication);
            DeliveryResponseDto delivery = ngoService.claimDonationForNgo(email, donationId);
            return ResponseEntity.ok(ApiResponse.ok("Donation claimed successfully and dispatched to Volunteer Fleet!", delivery));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

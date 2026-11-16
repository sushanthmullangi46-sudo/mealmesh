package com.mealmesh.controller;

import com.mealmesh.dto.ApiResponse;
import com.mealmesh.dto.DonationRequestDto;
import com.mealmesh.dto.DonationResponseDto;
import com.mealmesh.service.DonationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    private String resolveEmail(Authentication authentication) {
        if (authentication == null) return "donor.koramangala@mealmesh.org";
        String name = authentication.getName();
        if (name == null || !name.contains("@") || name.startsWith("com.mealmesh.")) {
            return "donor.koramangala@mealmesh.org";
        }
        return name.trim().toLowerCase();
    }

    @PostMapping("/donor/donations")
    public ResponseEntity<ApiResponse<DonationResponseDto>> postDonation(
            Authentication authentication,
            @RequestBody DonationRequestDto dto) {
        try {
            String email = resolveEmail(authentication);
            DonationResponseDto created = donationService.createDonation(email, dto);
            return ResponseEntity.ok(ApiResponse.ok("Donation posted successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/donor/my-donations")
    public ResponseEntity<ApiResponse<List<DonationResponseDto>>> getMyDonations(Authentication authentication) {
        String email = resolveEmail(authentication);
        List<DonationResponseDto> list = donationService.getDonationsByDonor(email);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/public/donations/active")
    public ResponseEntity<ApiResponse<List<DonationResponseDto>>> getActiveDonations() {
        List<DonationResponseDto> list = donationService.getPrioritizedActiveDonations();
        return ResponseEntity.ok(ApiResponse.ok("Retrieved priority-sorted donations", list));
    }

    @GetMapping("/public/donations/recent")
    public ResponseEntity<ApiResponse<List<DonationResponseDto>>> getRecentDonations() {
        List<DonationResponseDto> list = donationService.getAllRecentDonations();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/public/donations/{id}")
    public ResponseEntity<ApiResponse<DonationResponseDto>> getDonationById(@PathVariable UUID id) {
        try {
            DonationResponseDto dto = donationService.getDonationById(id);
            return ResponseEntity.ok(ApiResponse.ok(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

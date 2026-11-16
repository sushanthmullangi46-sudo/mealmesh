package com.mealmesh.controller;

import com.mealmesh.dto.ApiResponse;
import com.mealmesh.dto.MatchingResultDto;
import com.mealmesh.matching.MatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @PostMapping("/match-donation/{donationId}")
    public ResponseEntity<ApiResponse<MatchingResultDto>> matchDonation(@PathVariable UUID donationId) {
        try {
            MatchingResultDto result = matchingService.matchAndAllocateDonation(donationId);
            return ResponseEntity.ok(ApiResponse.ok("Greedy matching algorithm completed", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

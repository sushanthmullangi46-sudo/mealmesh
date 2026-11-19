package com.mealmesh.controller;

import com.mealmesh.dsa.fairness.FairnessAllocator;
import com.mealmesh.dto.ApiResponse;
import com.mealmesh.entity.NgoProfile;
import com.mealmesh.service.FairnessService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/fairness")
public class FairnessController {

    private final FairnessService fairnessService;

    public FairnessController(FairnessService fairnessService) {
        this.fairnessService = fairnessService;
    }

    @GetMapping("/profiles")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProfiles() {
        return ResponseEntity.ok(ApiResponse.ok("NGO Community Needs & Fairness Profiles", fairnessService.getNgoFairnessProfiles()));
    }

    @PostMapping("/profile/{ngoId}")
    public ResponseEntity<ApiResponse<NgoProfile>> updateProfile(
            @PathVariable(required = false) String ngoId,
            @RequestBody Map<String, Object> payload) {
        UUID id = null;
        try {
            if (ngoId != null && !ngoId.isBlank() && !ngoId.equalsIgnoreCase("undefined") && !ngoId.equalsIgnoreCase("ngo-current")) {
                id = UUID.fromString(ngoId);
            }
        } catch (Exception ignored) {}

        int vulnerability = payload.containsKey("vulnerabilityIndex") ?
                ((Number) payload.get("vulnerabilityIndex")).intValue() : 7;
        String targetGroup = (String) payload.get("targetBeneficiaryGroup");
        double dailyDeficit = payload.containsKey("dailyDeficitKg") ?
                ((Number) payload.get("dailyDeficitKg")).doubleValue() : 45.0;

        NgoProfile updated = fairnessService.updateNgoFairnessProfile(id, vulnerability, targetGroup, dailyDeficit);
        return ResponseEntity.ok(ApiResponse.ok("Updated community fairness criteria", updated));
    }

    @PostMapping("/allocate/{donationId}")
    public ResponseEntity<ApiResponse<FairnessAllocator.FairnessResult>> executeAllocation(@PathVariable UUID donationId) {
        try {
            FairnessAllocator.FairnessResult result = fairnessService.executeFairnessAllocation(donationId);
            return ResponseEntity.ok(ApiResponse.ok("Fairness-aware allocation completed successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/audit-trail")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAuditTrail() {
        return ResponseEntity.ok(ApiResponse.ok("Fairness allocation audit trail", fairnessService.getFairnessAuditTrail()));
    }
}

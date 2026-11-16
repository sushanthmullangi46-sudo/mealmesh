package com.mealmesh.controller;

import com.mealmesh.dto.ApiResponse;
import com.mealmesh.entity.Allocation;
import com.mealmesh.entity.NgoProfile;
import com.mealmesh.service.NgoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ngo")
public class NgoController {

    private final NgoService ngoService;

    public NgoController(NgoService ngoService) {
        this.ngoService = ngoService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<NgoProfile>> getProfile(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "ngo.akshayapatra@mealmesh.org";
        NgoProfile ngo = ngoService.getNgoProfile(email);
        return ResponseEntity.ok(ApiResponse.ok(ngo));
    }

    @PostMapping("/capacity")
    public ResponseEntity<ApiResponse<NgoProfile>> updateCapacity(
            Authentication authentication,
            @RequestBody Map<String, Double> payload) {
        String email = authentication != null ? authentication.getName() : "ngo.akshayapatra@mealmesh.org";
        double current = payload.getOrDefault("currentKg", 0.0);
        double max = payload.getOrDefault("maxKg", 200.0);
        NgoProfile updated = ngoService.updateStorageCapacity(email, current, max);
        return ResponseEntity.ok(ApiResponse.ok("Storage capacity updated", updated));
    }

    @GetMapping("/allocations")
    public ResponseEntity<ApiResponse<List<Allocation>>> getAllocations(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "ngo.akshayapatra@mealmesh.org";
        List<Allocation> list = ngoService.getAllocationsForNgo(email);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}

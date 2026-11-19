package com.mealmesh.controller;

import com.mealmesh.dsa.routing.DisruptionReplanEngine;
import com.mealmesh.dto.ApiResponse;
import com.mealmesh.service.DisruptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/routing/disruption")
public class DisruptionController {

    private final DisruptionService disruptionService;

    public DisruptionController(DisruptionService disruptionService) {
        this.disruptionService = disruptionService;
    }

    @PostMapping("/simulate")
    public ResponseEntity<ApiResponse<DisruptionReplanEngine.ReplanResult>> simulateDisruption(
            @RequestBody Map<String, String> payload) {
        String deliveryId = payload.get("deliveryId");
        String type = payload.getOrDefault("type", "ROAD_BLOCKED");
        String note = payload.getOrDefault("note", "Incident simulation");

        DisruptionReplanEngine.ReplanResult result = disruptionService.triggerDisruption(deliveryId, type, note);
        return ResponseEntity.ok(ApiResponse.ok("Disruption recovery plan executed", result));
    }
}

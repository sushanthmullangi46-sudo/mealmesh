package com.mealmesh.controller;

import com.mealmesh.dto.ApiResponse;
import com.mealmesh.entity.HandoffRecord;
import com.mealmesh.service.HandoffService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/handoff")
public class HandoffController {

    private final HandoffService handoffService;

    public HandoffController(HandoffService handoffService) {
        this.handoffService = handoffService;
    }

    @GetMapping("/codes/{deliveryId}")
    public ResponseEntity<ApiResponse<HandoffRecord>> getHandoffCodes(@PathVariable UUID deliveryId) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Delivery handoff codes retrieved",
                    handoffService.getOrCreateHandoffForDelivery(deliveryId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/verify-pickup")
    public ResponseEntity<ApiResponse<HandoffRecord>> verifyPickup(@RequestBody Map<String, String> payload) {
        try {
            String code = payload.get("pickupCode");
            String volunteerName = payload.getOrDefault("volunteerName", "Rahul Verma");
            return ResponseEntity.ok(ApiResponse.ok("Pickup custody successfully verified",
                    handoffService.verifyPickup(code, volunteerName)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/verify-delivery")
    public ResponseEntity<ApiResponse<HandoffRecord>> verifyDelivery(@RequestBody Map<String, Object> payload) {
        try {
            String code = (String) payload.get("deliveryCode");
            String recipient = (String) payload.getOrDefault("recipientName", "Anita Rao (NGO Coordinator)");
            double qty = payload.containsKey("receivedQuantityKg") ?
                    ((Number) payload.get("receivedQuantityKg")).doubleValue() : 25.0;
            boolean qualityPassed = !payload.containsKey("qualityInspectionPassed") ||
                    (Boolean) payload.get("qualityInspectionPassed");
            double temp = payload.containsKey("temperatureCelsius") ?
                    ((Number) payload.get("temperatureCelsius")).doubleValue() : 64.0;

            return ResponseEntity.ok(ApiResponse.ok("Delivery handoff confirmed & cryptographic certificate generated",
                    handoffService.verifyDelivery(code, recipient, qty, qualityPassed, temp)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/receipt/{deliveryId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReceipt(@PathVariable UUID deliveryId) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Impact & verified handoff audit certificate",
                    handoffService.getImpactReceipt(deliveryId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

package com.mealmesh.controller;

import com.mealmesh.dsa.forecasting.ForecastingEngine;
import com.mealmesh.dto.ApiResponse;
import com.mealmesh.entity.AuditLog;
import com.mealmesh.repository.AuditLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/forecasting")
public class ForecastingController {

    private final AuditLogRepository auditLogRepository;
    private final List<Map<String, Object>> registeredPledges = new CopyOnWriteArrayList<>();

    public ForecastingController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;

        // Seed initial advance pledges across multiple donors and places
        Map<String, Object> seed1 = new HashMap<>();
        seed1.put("pledgeId", "PLG-LEELA-01");
        seed1.put("donor", "The Leela Palace Banquet");
        seed1.put("targetZone", "Indiranagar & Old Airport Rd");
        seed1.put("pledgedKg", 45.0);
        seed1.put("scheduledDate", "Upcoming Saturday Dinner (Nov 21)");
        seed1.put("timestamp", LocalDateTime.now().minusHours(2).format(DateTimeFormatter.ofPattern("MMM dd, hh:mm a")));
        seed1.put("status", "CONFIRMED & SHELTERS PRE-NOTIFIED");
        seed1.put("impact", "Resolves weekend deficit for 112 shelter beneficiaries");
        registeredPledges.add(seed1);

        Map<String, Object> seed2 = new HashMap<>();
        seed2.put("pledgeId", "PLG-INFOSYS-02");
        seed2.put("donor", "Infosys Corporate Dining");
        seed2.put("targetZone", "Electronic City Phase 1");
        seed2.put("pledgedKg", 60.0);
        seed2.put("scheduledDate", "Upcoming Friday Lunch (Nov 20)");
        seed2.put("timestamp", LocalDateTime.now().minusHours(4).format(DateTimeFormatter.ofPattern("MMM dd, hh:mm a")));
        seed2.put("status", "CONFIRMED & SHELTERS PRE-NOTIFIED");
        seed2.put("impact", "Pre-allocates meals for ~150 vulnerable beneficiaries");
        registeredPledges.add(seed2);

        Map<String, Object> seed3 = new HashMap<>();
        seed3.put("pledgeId", "PLG-TAJ-03");
        seed3.put("donor", "Taj West End Convention Centre");
        seed3.put("targetZone", "High Grounds & Race Course Rd");
        seed3.put("pledgedKg", 40.0);
        seed3.put("scheduledDate", "Upcoming Sunday Banquet (Nov 22)");
        seed3.put("timestamp", LocalDateTime.now().minusHours(6).format(DateTimeFormatter.ofPattern("MMM dd, hh:mm a")));
        seed3.put("status", "CONFIRMED & SHELTERS PRE-NOTIFIED");
        seed3.put("impact", "Fills weekend child shelter supply gap (~100 meals)");
        registeredPledges.add(seed3);

        Map<String, Object> seed4 = new HashMap<>();
        seed4.put("pledgeId", "PLG-ITC-04");
        seed4.put("donor", "ITC Gardenia Kitchen");
        seed4.put("targetZone", "Koramangala Tech Corridor");
        seed4.put("pledgedKg", 50.0);
        seed4.put("scheduledDate", "Upcoming Saturday Dinner (Nov 21)");
        seed4.put("timestamp", LocalDateTime.now().minusHours(8).format(DateTimeFormatter.ofPattern("MMM dd, hh:mm a")));
        seed4.put("status", "CONFIRMED & SHELTERS PRE-NOTIFIED");
        seed4.put("impact", "Resolves weekend deficit for 125 shelter beneficiaries");
        registeredPledges.add(seed4);
    }

    @GetMapping("/7day")
    public ResponseEntity<ApiResponse<ForecastingEngine.ForecastSummary>> get7DayForecast() {
        ForecastingEngine.ForecastSummary summary = ForecastingEngine.generate7DayForecast();
        return ResponseEntity.ok(ApiResponse.ok("7-Day demand and surplus time-series forecast", summary));
    }

    @GetMapping("/pledges")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRegisteredPledges() {
        return ResponseEntity.ok(ApiResponse.ok("Registered surplus advance pledges", new ArrayList<>(registeredPledges)));
    }

    @PostMapping("/pledge")
    public ResponseEntity<ApiResponse<Map<String, Object>>> pledgeSurplus(@RequestBody Map<String, Object> pledgeRequest) {
        String donor = (String) pledgeRequest.getOrDefault("donorName", "Corporate Food Donor");
        String zone = (String) pledgeRequest.getOrDefault("zone", "Koramangala Tech Corridor");
        double qty = 35.0;
        if (pledgeRequest.containsKey("quantityKg")) {
            Object qObj = pledgeRequest.get("quantityKg");
            if (qObj instanceof Number) {
                qty = ((Number) qObj).doubleValue();
            } else {
                try { qty = Double.parseDouble(qObj.toString()); } catch (Exception ignored) {}
            }
        }
        String sched = (String) pledgeRequest.getOrDefault("scheduledDate", "Upcoming Weekend Surplus");

        Map<String, Object> pledge = new HashMap<>();
        String pledgeId = "PLG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        pledge.put("pledgeId", pledgeId);
        pledge.put("donor", donor);
        pledge.put("targetZone", zone);
        pledge.put("pledgedKg", qty);
        pledge.put("scheduledDate", sched);
        pledge.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, hh:mm a")));
        pledge.put("status", "CONFIRMED & SHELTERS PRE-NOTIFIED");
        pledge.put("impact", "Pre-allocates meals for ~" + (int) Math.round(qty * 2.5) + " vulnerable beneficiaries");
        registeredPledges.add(0, pledge);

        // Audit Trail entry
        try {
            AuditLog log = new AuditLog();
            log.setAction("SURPLUS_PLEDGE");
            log.setEntityType("DONATION_PLEDGE");
            log.setDetails(donor + " pledged " + qty + " kg upcoming surplus for " + zone + " (" + sched + ") to prevent weekend deficit.");
            auditLogRepository.save(log);
        } catch (Exception ignored) {}

        return ResponseEntity.ok(ApiResponse.ok("Surplus pledge registered successfully", pledge));
    }
}

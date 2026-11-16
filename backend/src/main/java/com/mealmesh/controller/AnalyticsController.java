package com.mealmesh.controller;

import com.mealmesh.dto.AnalyticsSummaryDto;
import com.mealmesh.dto.ApiResponse;
import com.mealmesh.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/landing/stats")
    public ResponseEntity<ApiResponse<AnalyticsSummaryDto>> getLandingStats() {
        AnalyticsSummaryDto summary = analyticsService.getAnalyticsSummary();
        return ResponseEntity.ok(ApiResponse.ok("Live impact metrics", summary));
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<ApiResponse<AnalyticsSummaryDto>> getAnalyticsSummary() {
        AnalyticsSummaryDto summary = analyticsService.getAnalyticsSummary();
        return ResponseEntity.ok(ApiResponse.ok("Detailed analytics summary", summary));
    }
}

package com.mealmesh.dsa;

import com.mealmesh.dsa.fairness.FairnessAllocator;
import com.mealmesh.dsa.forecasting.ForecastingEngine;
import com.mealmesh.dsa.routing.DisruptionReplanEngine;
import com.mealmesh.dsa.safety.ThermalExposureEngine;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AdvancedDsaFeaturesTest {

    @Test
    void testFairnessAllocatorBalancesEquityAndExplainsDecision() {
        List<FairnessAllocator.CandidateNgo> ngos = new ArrayList<>();
        ngos.add(new FairnessAllocator.CandidateNgo(
                "ngo-1", "High Need Shelter", 12.9200, 77.6300,
                50.0, 100.0, 9, "Vulnerable Children", 40.0, 4, 30.0, List.of("VEG")));
        ngos.add(new FairnessAllocator.CandidateNgo(
                "ngo-2", "Low Need Center", 12.9350, 77.6250,
                80.0, 150.0, 3, "General Public", 10.0, 0, 180.0, List.of("VEG")));

        FairnessAllocator.FairnessResult result = FairnessAllocator.allocate(
                "donation-1", "Warm Meals Batch", 30.0,
                12.9352, 77.6245, 3, "HIGH", ngos);

        assertNotNull(result);
        assertEquals(30.0, result.getAllocatedKg());
        assertFalse(result.getAllocations().isEmpty());

        // High need shelter should win due to vulnerability and starvation defense despite slightly further distance
        assertEquals("High Need Shelter", result.getAllocations().get(0).getNgoName());
        assertTrue(result.getAllocations().get(0).getExplanationReason().contains("Vulnerability Index 9/10"));
        assertTrue(result.getGiniCoefficientAfter() <= result.getGiniCoefficientBefore());
    }

    @Test
    void testForecastingEngineGenerates7DaysAndProactiveAlerts() {
        ForecastingEngine.ForecastSummary summary = ForecastingEngine.generate7DayForecast();

        assertNotNull(summary);
        assertEquals(7, summary.getAggregatedDaily().size());
        assertEquals(5, summary.getZones().size());
        assertTrue(summary.getTotalPredictedSurplusKg() > 0);
        assertTrue(summary.getTotalPredictedDemandKg() > 0);
        assertFalse(summary.getAlerts().isEmpty());
    }

    @Test
    void testThermalExposureEngineDetectsDangerZoneExcursions() {
        LocalDateTime now = LocalDateTime.now();
        List<ThermalExposureEngine.TemperaturePoint> points = new ArrayList<>();

        // Food dropped from 65 to 48 degrees (in danger zone for 45 minutes)
        points.add(new ThermalExposureEngine.TemperaturePoint(now.minusMinutes(45), 65.0, 60.0, 80.0));
        points.add(new ThermalExposureEngine.TemperaturePoint(now.minusMinutes(30), 55.0, 65.0, 120.0));
        points.add(new ThermalExposureEngine.TemperaturePoint(now.minusMinutes(15), 48.0, 70.0, 150.0));
        points.add(new ThermalExposureEngine.TemperaturePoint(now, 45.0, 72.0, 180.0));

        ThermalExposureEngine.ExposureAssessment assessment =
                ThermalExposureEngine.evaluate("don-123", "COOKED", points);

        assertNotNull(assessment);
        assertTrue(assessment.getCumulativeDangerZoneMinutes() >= 30.0);
        assertTrue(assessment.getDegreeMinutesExposure() > 0);
        assertTrue(assessment.isRequiresQaIntervention());
        assertTrue(assessment.getSafetyClassification().contains("QA_REVIEW") ||
                   assessment.getSafetyClassification().contains("QUARANTINED"));
    }

    @Test
    void testDisruptionReplanDetourAroundRoadblock() {
        DisruptionReplanEngine.DisruptionEvent event = new DisruptionReplanEngine.DisruptionEvent(
                "evt-1", "ROAD_BLOCKED", "del-101", "Hosur road blocked");
        event.setBlockedRoadName("Hosur Road Underpass");

        DisruptionReplanEngine.ReplanResult result = DisruptionReplanEngine.replan(
                event, 12.9352, 77.6245, 12.9121, 77.6446, 20.0, List.of());

        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertTrue(result.getDeltaDistanceKm() > 0);
        assertTrue(result.getRouteWaypoints().stream().anyMatch(DisruptionReplanEngine.RouteWaypoint::isDetour));
    }
}

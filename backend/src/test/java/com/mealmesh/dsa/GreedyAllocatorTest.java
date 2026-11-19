package com.mealmesh.dsa;

import com.mealmesh.dsa.greedy.DonationBatch;
import com.mealmesh.dsa.greedy.GreedyAllocator;
import com.mealmesh.dsa.greedy.NgoCandidate;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GreedyAllocatorTest {

    @Test
    void testGreedyMultiCriteriaAllocation() {
        DonationBatch batch = new DonationBatch("DON-1", "Cooked Meals", 50.0, 12.93, 77.62, 3, "VEG", "CRITICAL");

        NgoCandidate ngo1 = new NgoCandidate("NGO-1", "Akshaya Patra", 12.94, 77.62, 0.0, 30.0, List.of("VEG"));
        NgoCandidate ngo2 = new NgoCandidate("NGO-2", "Feeding India", 12.95, 77.63, 0.0, 40.0, List.of("VEG"));

        GreedyAllocator.AllocationResult result = GreedyAllocator.allocate(batch, List.of(ngo1, ngo2));

        assertEquals(50.0, result.getAllocatedQuantityKg());
        assertEquals(0.0, result.getRemainingQuantityKg());
        assertFalse(result.getAllocations().isEmpty());
        assertFalse(result.getSteps().isEmpty());
    }

    @Test
    void scoreNeverExceedsOneHundredEvenForCriticalNearbyBatch() {
        // Critical urgency (x1.5) on a shelter right next door used to push the score above 100.
        DonationBatch batch = new DonationBatch("DON-2", "Idli", 10.0, 12.9352, 77.6245, 0, "VEG", "CRITICAL");
        NgoCandidate nextDoor = new NgoCandidate("NGO-3", "Next Door Shelter", 12.9353, 77.6246, 0.0, 500.0, List.of("ALL"));

        GreedyAllocator.AllocationResult result = GreedyAllocator.allocate(batch, List.of(nextDoor));

        double score = result.getAllocations().get(0).getScore();
        assertTrue(score <= 100.0, "score was " + score);
        assertTrue(score >= 90.0, "a perfect nearby match should still score highly, was " + score);
    }

    @Test
    void closerShelterRanksFirst() {
        DonationBatch batch = new DonationBatch("DON-3", "Pulao", 20.0, 12.93, 77.62, 4, "VEG", "HIGH");
        NgoCandidate near = new NgoCandidate("NEAR", "Near", 12.931, 77.621, 0.0, 100.0, List.of("VEG"));
        NgoCandidate far = new NgoCandidate("FAR", "Far", 13.05, 77.70, 0.0, 100.0, List.of("VEG"));

        GreedyAllocator.AllocationResult result = GreedyAllocator.allocate(batch, List.of(far, near));

        assertEquals("NEAR", result.getAllocations().get(0).getNgoId());
    }
}

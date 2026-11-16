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
}

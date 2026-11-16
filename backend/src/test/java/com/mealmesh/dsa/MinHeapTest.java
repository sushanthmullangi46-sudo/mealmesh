package com.mealmesh.dsa;

import com.mealmesh.dsa.heap.HeapItem;
import com.mealmesh.dsa.heap.MinHeap;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MinHeapTest {

    private MinHeap<String> heap;

    @BeforeEach
    void setUp() {
        heap = new MinHeap<>(true);
    }

    @Test
    void testInsertAndExtractMinOrder() {
        heap.insert(new HeapItem<>("1", 5.0, "Five", "Medium", "Five"));
        heap.insert(new HeapItem<>("2", 1.0, "One", "Critical", "One"));
        heap.insert(new HeapItem<>("3", 3.0, "Three", "High", "Three"));
        heap.insert(new HeapItem<>("4", 8.0, "Eight", "Low", "Eight"));

        assertEquals(4, heap.size());
        assertEquals(1.0, heap.peek().getPriorityKey());

        assertEquals("One", heap.extractMin().getLabel());
        assertEquals("Three", heap.extractMin().getLabel());
        assertEquals("Five", heap.extractMin().getLabel());
        assertEquals("Eight", heap.extractMin().getLabel());

        assertTrue(heap.isEmpty());
        assertNull(heap.extractMin());
    }

    @Test
    void testUpdatePriority() {
        heap.insert(new HeapItem<>("A", 10.0, "A", "Payload"));
        heap.insert(new HeapItem<>("B", 20.0, "B", "Payload"));

        assertEquals("A", heap.peek().getLabel());

        // Promote B to higher priority (lower key)
        heap.updatePriority("B", 2.0);
        assertEquals("B", heap.peek().getLabel());
    }

    @Test
    void testStepRecording() {
        heap.insert(new HeapItem<>("X", 2.0, "X", "P"));
        heap.insert(new HeapItem<>("Y", 1.0, "Y", "P"));
        assertFalse(heap.getRecordedSteps().isEmpty());
    }
}

package com.mealmesh.dsa;

import com.mealmesh.dsa.unionfind.DisjointSetUnion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DisjointSetUnionTest {

    private DisjointSetUnion dsu;

    @BeforeEach
    void setUp() {
        String[] labels = {"Koramangala", "HSR", "Indiranagar", "MG Road", "Whitefield"};
        dsu = new DisjointSetUnion(5, labels);
    }

    @Test
    void testInitialComponents() {
        assertEquals(5, dsu.getComponentCount());
        assertFalse(dsu.connected(0, 1));
    }

    @Test
    void testUnionAndFindWithRank() {
        assertTrue(dsu.union(0, 1)); // Koramangala + HSR
        assertEquals(4, dsu.getComponentCount());
        assertTrue(dsu.connected(0, 1));

        assertTrue(dsu.union(2, 3)); // Indiranagar + MG Road
        assertEquals(3, dsu.getComponentCount());
        assertTrue(dsu.connected(2, 3));

        // Connect both sets
        assertTrue(dsu.union(1, 2));
        assertEquals(2, dsu.getComponentCount());
        assertTrue(dsu.connected(0, 3)); // Transitive connection
        assertFalse(dsu.connected(0, 4)); // Whitefield remains separate
    }
}

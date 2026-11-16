package com.mealmesh.dsa;

import com.mealmesh.dsa.hashtable.CustomHashTable;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CustomHashTableTest {

    private CustomHashTable<String, String> table;

    @BeforeEach
    void setUp() {
        table = new CustomHashTable<>(4); // Small capacity to force collisions and rehash
    }

    @Test
    void testPutAndGet() {
        table.put("K1", "Val1");
        table.put("K2", "Val2");
        table.put("K3", "Val3");

        assertEquals("Val1", table.get("K1"));
        assertEquals("Val2", table.get("K2"));
        assertEquals("Val3", table.get("K3"));
        assertNull(table.get("K_NONEXISTENT"));
        assertTrue(table.containsKey("K1"));
    }

    @Test
    void testRehashWhenThresholdExceeded() {
        int initialCap = table.capacity();
        for (int i = 0; i < 20; i++) {
            table.put("KEY_" + i, "VALUE_" + i);
        }

        assertTrue(table.capacity() > initialCap);
        assertEquals(20, table.size());

        for (int i = 0; i < 20; i++) {
            assertEquals("VALUE_" + i, table.get("KEY_" + i));
        }
    }

    @Test
    void testRemove() {
        table.put("X", "Y");
        assertTrue(table.containsKey("X"));
        assertEquals("Y", table.remove("X"));
        assertNull(table.get("X"));
        assertFalse(table.containsKey("X"));
    }
}

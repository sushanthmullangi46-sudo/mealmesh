package com.mealmesh.dsa;

import com.mealmesh.dsa.trie.Trie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TrieTest {

    private Trie trie;

    @BeforeEach
    void setUp() {
        trie = new Trie();
        trie.insert("akshaya patra", "NGO-1");
        trie.insert("akshaya kitchen", "NGO-2");
        trie.insert("annapoorna", "NGO-3");
        trie.insert("biryani", "CAT-1");
    }

    @Test
    void testSearch() {
        assertTrue(trie.search("akshaya patra"));
        assertTrue(trie.search("biryani"));
        assertFalse(trie.search("burger"));
        assertFalse(trie.search("akshaya")); // Prefix, not complete word
    }

    @Test
    void testPrefixSearch() {
        List<String> results = trie.prefixSearch("akshaya");
        assertEquals(2, results.size());
        assertTrue(results.contains("akshaya patra"));
        assertTrue(results.contains("akshaya kitchen"));

        List<String> bResults = trie.prefixSearch("bi");
        assertEquals(1, bResults.size());
        assertEquals("biryani", bResults.get(0));

        List<String> empty = trie.prefixSearch("xyz");
        assertTrue(empty.isEmpty());
    }
}

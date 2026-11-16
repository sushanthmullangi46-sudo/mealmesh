package com.mealmesh.dsa.trie;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom Prefix Tree (Trie) implemented completely from scratch.
 * Strictly avoids standard collection tree structures.
 * Supports character-by-character step tracing for interactive autocompletion demo.
 */
public class Trie {
    private final TrieNode root;
    private int wordCount;
    private final List<TrieStep> recordedSteps = new ArrayList<>();
    private boolean recordSteps = true;

    public Trie() {
        this.root = new TrieNode();
        this.wordCount = 0;
    }

    public int getWordCount() {
        return wordCount;
    }

    public void clearSteps() {
        recordedSteps.clear();
    }

    public List<TrieStep> getRecordedSteps() {
        return new ArrayList<>(recordedSteps);
    }

    public void setRecordSteps(boolean recordSteps) {
        this.recordSteps = recordSteps;
    }

    public void insert(String word, String entityId) {
        if (word == null || word.trim().isEmpty()) return;
        String clean = word.trim().toLowerCase();

        TrieNode curr = root;
        for (int i = 0; i < clean.length(); i++) {
            char c = clean.charAt(i);
            if (!curr.hasChild(c)) {
                curr.setChild(c, new TrieNode());
            }
            curr = curr.getChild(c);
        }

        if (!curr.isEndOfWord()) {
            curr.setEndOfWord(true);
            wordCount++;
        }
        curr.setFullWord(clean);
        curr.addEntityId(entityId);

        if (recordSteps) {
            recordedSteps.add(new TrieStep(
                recordedSteps.size() + 1,
                "INSERT",
                clean,
                clean.charAt(clean.length() - 1),
                "Indexed word '" + clean + "' (Entity ID: " + entityId + ")",
                List.of(clean)
            ));
        }
    }

    public boolean search(String word) {
        if (word == null) return false;
        String clean = word.trim().toLowerCase();
        TrieNode curr = root;

        for (int i = 0; i < clean.length(); i++) {
            char c = clean.charAt(i);
            if (!curr.hasChild(c)) {
                return false;
            }
            curr = curr.getChild(c);
        }
        return curr != null && curr.isEndOfWord();
    }

    public List<String> prefixSearch(String prefix) {
        List<String> results = new ArrayList<>();
        if (prefix == null) return results;
        String clean = prefix.trim().toLowerCase();

        TrieNode curr = root;
        for (int i = 0; i < clean.length(); i++) {
            char c = clean.charAt(i);
            if (recordSteps) {
                recordedSteps.add(new TrieStep(
                    recordedSteps.size() + 1,
                    "TRAVERSE_PREFIX",
                    clean,
                    c,
                    "Traversing prefix edge for character '" + c + "'",
                    new ArrayList<>(results)
                ));
            }
            if (!curr.hasChild(c)) {
                return results; // No words match prefix
            }
            curr = curr.getChild(c);
        }

        // Collect all words in the subtree under curr
        collectSubtreeWords(curr, results);

        if (recordSteps) {
            recordedSteps.add(new TrieStep(
                recordedSteps.size() + 1,
                "PREFIX_RESULTS",
                clean,
                '\0',
                "Found " + results.size() + " matches matching prefix '" + clean + "'",
                new ArrayList<>(results)
            ));
        }

        return results;
    }

    private void collectSubtreeWords(TrieNode node, List<String> accumulator) {
        if (node == null) return;
        if (node.isEndOfWord() && node.getFullWord() != null) {
            accumulator.add(node.getFullWord());
        }
        for (char c = 0; c < 128; c++) {
            TrieNode child = node.getChild(c);
            if (child != null) {
                collectSubtreeWords(child, accumulator);
            }
        }
    }
}

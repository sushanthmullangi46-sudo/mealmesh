package com.mealmesh.dsa.trie;

import java.util.ArrayList;
import java.util.List;

public class TrieNode {
    private static final int ALPHABET_SIZE = 128;
    private final TrieNode[] children = new TrieNode[ALPHABET_SIZE];
    private boolean isEndOfWord;
    private final List<String> entityIds;
    private String fullWord;

    public TrieNode() {
        this.isEndOfWord = false;
        this.entityIds = new ArrayList<>();
        this.fullWord = null;
    }

    public TrieNode getChild(char c) {
        if (c >= 0 && c < ALPHABET_SIZE) {
            return children[c];
        }
        return null;
    }

    public void setChild(char c, TrieNode node) {
        if (c >= 0 && c < ALPHABET_SIZE) {
            children[c] = node;
        }
    }

    public boolean hasChild(char c) {
        return getChild(c) != null;
    }

    public boolean isEndOfWord() {
        return isEndOfWord;
    }

    public void setEndOfWord(boolean endOfWord) {
        isEndOfWord = endOfWord;
    }

    public List<String> getEntityIds() {
        return entityIds;
    }

    public void addEntityId(String entityId) {
        if (entityId != null && !this.entityIds.contains(entityId)) {
            this.entityIds.add(entityId);
        }
    }

    public String getFullWord() {
        return fullWord;
    }

    public void setFullWord(String fullWord) {
        this.fullWord = fullWord;
    }

    public TrieNode[] getChildren() {
        return children;
    }
}

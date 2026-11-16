package com.mealmesh.dsa.trie;

import java.util.ArrayList;
import java.util.List;

public class TrieStep {
    private int stepNumber;
    private String operation; // "INSERT", "SEARCH", "PREFIX_SEARCH"
    private String query;
    private char currentChar;
    private String description;
    private List<String> matchingWords;

    public TrieStep() {
        this.matchingWords = new ArrayList<>();
    }

    public TrieStep(int stepNumber, String operation, String query, char currentChar, String description, List<String> matchingWords) {
        this.stepNumber = stepNumber;
        this.operation = operation;
        this.query = query;
        this.currentChar = currentChar;
        this.description = description;
        this.matchingWords = matchingWords != null ? new ArrayList<>(matchingWords) : new ArrayList<>();
    }

    public int getStepNumber() {
        return stepNumber;
    }

    public String getOperation() {
        return operation;
    }

    public String getQuery() {
        return query;
    }

    public char getCurrentChar() {
        return currentChar;
    }

    public String getDescription() {
        return description;
    }

    public List<String> getMatchingWords() {
        return matchingWords;
    }
}

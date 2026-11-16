package com.mealmesh.dsa.linkedlist;

import java.util.ArrayList;
import java.util.List;

public class LinkedListStep {
    private int stepNumber;
    private String operation; // "ADD_FIRST", "ADD_LAST", "REMOVE", "TRAVERSE"
    private String itemLabel;
    private String description;
    private List<String> currentList;

    public LinkedListStep() {
        this.currentList = new ArrayList<>();
    }

    public LinkedListStep(int stepNumber, String operation, String itemLabel, String description, List<String> currentList) {
        this.stepNumber = stepNumber;
        this.operation = operation;
        this.itemLabel = itemLabel;
        this.description = description;
        this.currentList = currentList != null ? new ArrayList<>(currentList) : new ArrayList<>();
    }

    public int getStepNumber() {
        return stepNumber;
    }

    public String getOperation() {
        return operation;
    }

    public String getItemLabel() {
        return itemLabel;
    }

    public String getDescription() {
        return description;
    }

    public List<String> getCurrentList() {
        return currentList;
    }
}

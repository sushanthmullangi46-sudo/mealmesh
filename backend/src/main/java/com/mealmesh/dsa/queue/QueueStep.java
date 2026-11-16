package com.mealmesh.dsa.queue;

import java.util.ArrayList;
import java.util.List;

public class QueueStep {
    private int stepNumber;
    private String operation; // "ENQUEUE", "DEQUEUE", "PEEK"
    private String itemLabel;
    private String description;
    private List<String> currentQueue;

    public QueueStep() {
        this.currentQueue = new ArrayList<>();
    }

    public QueueStep(int stepNumber, String operation, String itemLabel, String description, List<String> currentQueue) {
        this.stepNumber = stepNumber;
        this.operation = operation;
        this.itemLabel = itemLabel;
        this.description = description;
        this.currentQueue = currentQueue != null ? new ArrayList<>(currentQueue) : new ArrayList<>();
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

    public List<String> getCurrentQueue() {
        return currentQueue;
    }
}

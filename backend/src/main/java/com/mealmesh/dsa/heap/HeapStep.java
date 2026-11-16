package com.mealmesh.dsa.heap;

import java.util.ArrayList;
import java.util.List;

public class HeapStep {
    private int stepNumber;
    private String operation; // "INSERT", "EXTRACT_MIN", "HEAPIFY_UP", "HEAPIFY_DOWN", "SWAP"
    private String description;
    private int indexA;
    private int indexB;
    private List<HeapItemSnapshot> heapSnapshot;

    public HeapStep() {
        this.heapSnapshot = new ArrayList<>();
    }

    public HeapStep(int stepNumber, String operation, String description, int indexA, int indexB, List<HeapItemSnapshot> heapSnapshot) {
        this.stepNumber = stepNumber;
        this.operation = operation;
        this.description = description;
        this.indexA = indexA;
        this.indexB = indexB;
        this.heapSnapshot = heapSnapshot != null ? new ArrayList<>(heapSnapshot) : new ArrayList<>();
    }

    public int getStepNumber() {
        return stepNumber;
    }

    public void setStepNumber(int stepNumber) {
        this.stepNumber = stepNumber;
    }

    public String getOperation() {
        return operation;
    }

    public void setOperation(String operation) {
        this.operation = operation;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getIndexA() {
        return indexA;
    }

    public void setIndexA(int indexA) {
        this.indexA = indexA;
    }

    public int getIndexB() {
        return indexB;
    }

    public void setIndexB(int indexB) {
        this.indexB = indexB;
    }

    public List<HeapItemSnapshot> getHeapSnapshot() {
        return heapSnapshot;
    }

    public void setHeapSnapshot(List<HeapItemSnapshot> heapSnapshot) {
        this.heapSnapshot = heapSnapshot;
    }

    public static class HeapItemSnapshot {
        private String id;
        private double priorityKey;
        private String label;
        private String urgency;

        public HeapItemSnapshot(String id, double priorityKey, String label, String urgency) {
            this.id = id;
            this.priorityKey = priorityKey;
            this.label = label;
            this.urgency = urgency;
        }

        public String getId() {
            return id;
        }

        public double getPriorityKey() {
            return priorityKey;
        }

        public String getLabel() {
            return label;
        }

        public String getUrgency() {
            return urgency;
        }
    }
}

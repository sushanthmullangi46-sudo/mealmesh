package com.mealmesh.dsa.heap;

public class HeapItem<T> implements Comparable<HeapItem<T>> {
    private String id;
    private double priorityKey; // lower value = higher priority (min-heap)
    private String label;
    private String urgency;     // "CRITICAL", "HIGH", "MEDIUM", "LOW"
    private T payload;

    public HeapItem(String id, double priorityKey, String label, String urgency, T payload) {
        this.id = id;
        this.priorityKey = priorityKey;
        this.label = label;
        this.urgency = urgency;
        this.payload = payload;
    }

    public HeapItem(String id, double priorityKey, String label, T payload) {
        this(id, priorityKey, label, "MEDIUM", payload);
    }

    public String getId() {
        return id;
    }

    public double getPriorityKey() {
        return priorityKey;
    }

    public void setPriorityKey(double priorityKey) {
        this.priorityKey = priorityKey;
    }

    public String getLabel() {
        return label;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public T getPayload() {
        return payload;
    }

    public void setPayload(T payload) {
        this.payload = payload;
    }

    @Override
    public int compareTo(HeapItem<T> other) {
        return Double.compare(this.priorityKey, other.priorityKey);
    }

    @Override
    public String toString() {
        return "[" + label + " : " + priorityKey + " (" + urgency + ")]";
    }
}

package com.mealmesh.dsa.hashtable;

import java.util.ArrayList;
import java.util.List;

public class HashStep {
    private int stepNumber;
    private String operation; // "PUT", "GET", "REMOVE", "REHASH", "COLLISION"
    private String key;
    private int bucketIndex;
    private String description;
    private List<BucketSnapshot> buckets;

    public HashStep() {
        this.buckets = new ArrayList<>();
    }

    public HashStep(int stepNumber, String operation, String key, int bucketIndex, String description, List<BucketSnapshot> buckets) {
        this.stepNumber = stepNumber;
        this.operation = operation;
        this.key = key;
        this.bucketIndex = bucketIndex;
        this.description = description;
        this.buckets = buckets != null ? new ArrayList<>(buckets) : new ArrayList<>();
    }

    public int getStepNumber() {
        return stepNumber;
    }

    public String getOperation() {
        return operation;
    }

    public String getKey() {
        return key;
    }

    public int getBucketIndex() {
        return bucketIndex;
    }

    public String getDescription() {
        return description;
    }

    public List<BucketSnapshot> getBuckets() {
        return buckets;
    }

    public static class BucketSnapshot {
        private int bucketIndex;
        private List<NodeSnapshot> nodes;

        public BucketSnapshot(int bucketIndex, List<NodeSnapshot> nodes) {
            this.bucketIndex = bucketIndex;
            this.nodes = nodes;
        }

        public int getBucketIndex() {
            return bucketIndex;
        }

        public List<NodeSnapshot> getNodes() {
            return nodes;
        }
    }

    public static class NodeSnapshot {
        private String key;
        private String valuePreview;

        public NodeSnapshot(String key, String valuePreview) {
            this.key = key;
            this.valuePreview = valuePreview;
        }

        public String getKey() {
            return key;
        }

        public String getValuePreview() {
            return valuePreview;
        }
    }
}

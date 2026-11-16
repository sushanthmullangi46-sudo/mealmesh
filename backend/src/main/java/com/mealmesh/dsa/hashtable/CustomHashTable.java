package com.mealmesh.dsa.hashtable;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom Separate-Chaining Hash Table implemented completely from scratch.
 * Strictly avoids java.util.HashMap and java.util.Map.
 * Features a custom polynomial rolling hash code and dynamic rehashing.
 */
public class CustomHashTable<K, V> {
    private static final int INITIAL_CAPACITY = 16;
    private static final double LOAD_FACTOR_THRESHOLD = 0.75;

    @SuppressWarnings("unchecked")
    private HashNode<K, V>[] table = new HashNode[INITIAL_CAPACITY];
    private int size = 0;
    private final List<HashStep> recordedSteps = new ArrayList<>();
    private boolean recordSteps = true;

    public CustomHashTable() {
    }

    public CustomHashTable(int capacity) {
        int cap = Math.max(capacity, 4);
        this.table = new HashNode[cap];
    }

    public int size() {
        return size;
    }

    public int capacity() {
        return table.length;
    }

    public double loadFactor() {
        return (double) size / table.length;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    public void clearSteps() {
        recordedSteps.clear();
    }

    public List<HashStep> getRecordedSteps() {
        return new ArrayList<>(recordedSteps);
    }

    public void setRecordSteps(boolean recordSteps) {
        this.recordSteps = recordSteps;
    }

    /**
     * Custom polynomial rolling hash function with prime base 31 and positive modulo.
     */
    public int hash(K key) {
        if (key == null) return 0;
        String str = key.toString();
        long hash = 0;
        long p = 31;
        long m = 1_000_000_007L;
        long power = 1;
        for (int i = 0; i < str.length(); i++) {
            hash = (hash + (str.charAt(i) + 1) * power) % m;
            power = (power * p) % m;
        }
        int index = (int) (Math.abs(hash) % table.length);
        return index;
    }

    public void put(K key, V value) {
        if (key == null) return;

        if ((double) (size + 1) / table.length > LOAD_FACTOR_THRESHOLD) {
            rehash();
        }

        int index = hash(key);
        HashNode<K, V> head = table[index];

        // Search for existing key to overwrite
        HashNode<K, V> curr = head;
        while (curr != null) {
            if (curr.getKey().equals(key)) {
                curr.setValue(value);
                if (recordSteps) {
                    recordedSteps.add(new HashStep(
                        recordedSteps.size() + 1,
                        "UPDATE",
                        key.toString(),
                        index,
                        "Key '" + key + "' already present in bucket " + index + ". Overwrote value.",
                        takeSnapshot()
                    ));
                }
                return;
            }
            curr = curr.getNext();
        }

        // New insertion: prepend to bucket chain
        boolean hadCollision = (head != null);
        HashNode<K, V> newNode = new HashNode<>(key, value, head);
        table[index] = newNode;
        size++;

        if (recordSteps) {
            String desc = hadCollision
                ? "Collision detected! Key '" + key + "' chained onto bucket " + index
                : "Key '" + key + "' inserted cleanly at bucket " + index;
            recordedSteps.add(new HashStep(
                recordedSteps.size() + 1,
                hadCollision ? "COLLISION" : "PUT",
                key.toString(),
                index,
                desc,
                takeSnapshot()
            ));
        }
    }

    public V get(K key) {
        if (key == null) return null;
        int index = hash(key);
        HashNode<K, V> curr = table[index];

        int chainDepth = 0;
        while (curr != null) {
            if (curr.getKey().equals(key)) {
                if (recordSteps) {
                    recordedSteps.add(new HashStep(
                        recordedSteps.size() + 1,
                        "GET_HIT",
                        key.toString(),
                        index,
                        "Key '" + key + "' found in bucket " + index + " at chain depth " + chainDepth,
                        takeSnapshot()
                    ));
                }
                return curr.getValue();
            }
            curr = curr.getNext();
            chainDepth++;
        }

        if (recordSteps) {
            recordedSteps.add(new HashStep(
                recordedSteps.size() + 1,
                "GET_MISS",
                key.toString(),
                index,
                "Key '" + key + "' not found in bucket " + index,
                takeSnapshot()
            ));
        }
        return null;
    }

    public boolean containsKey(K key) {
        return get(key) != null;
    }

    public V remove(K key) {
        if (key == null) return null;
        int index = hash(key);
        HashNode<K, V> curr = table[index];
        HashNode<K, V> prev = null;

        while (curr != null) {
            if (curr.getKey().equals(key)) {
                if (prev == null) {
                    table[index] = curr.getNext();
                } else {
                    prev.setNext(curr.getNext());
                }
                size--;
                if (recordSteps) {
                    recordedSteps.add(new HashStep(
                        recordedSteps.size() + 1,
                        "REMOVE",
                        key.toString(),
                        index,
                        "Removed key '" + key + "' from bucket " + index,
                        takeSnapshot()
                    ));
                }
                return curr.getValue();
            }
            prev = curr;
            curr = curr.getNext();
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private void rehash() {
        int oldCap = table.length;
        int newCap = oldCap * 2;
        HashNode<K, V>[] oldTable = table;
        table = new HashNode[newCap];
        size = 0;

        for (int i = 0; i < oldCap; i++) {
            HashNode<K, V> curr = oldTable[i];
            while (curr != null) {
                // Re-insert into new larger table
                putInternal(curr.getKey(), curr.getValue());
                curr = curr.getNext();
            }
        }

        if (recordSteps) {
            recordedSteps.add(new HashStep(
                recordedSteps.size() + 1,
                "REHASH",
                "LOAD_THRESHOLD_EXCEEDED",
                -1,
                "Rehashed table: Capacity doubled from " + oldCap + " to " + newCap + " (Load factor was " + String.format("%.2f", (double) size / oldCap) + ")",
                takeSnapshot()
            ));
        }
    }

    private void putInternal(K key, V value) {
        int index = hash(key);
        HashNode<K, V> newNode = new HashNode<>(key, value, table[index]);
        table[index] = newNode;
        size++;
    }

    public List<HashStep.BucketSnapshot> takeSnapshot() {
        List<HashStep.BucketSnapshot> buckets = new ArrayList<>();
        for (int i = 0; i < table.length; i++) {
            List<HashStep.NodeSnapshot> nodes = new ArrayList<>();
            HashNode<K, V> curr = table[i];
            while (curr != null) {
                String valStr = curr.getValue() != null ? curr.getValue().toString() : "null";
                if (valStr.length() > 30) {
                    valStr = valStr.substring(0, 27) + "...";
                }
                nodes.add(new HashStep.NodeSnapshot(curr.getKey().toString(), valStr));
                curr = curr.getNext();
            }
            buckets.add(new HashStep.BucketSnapshot(i, nodes));
        }
        return buckets;
    }

    public int getCollisionCount() {
        int collisions = 0;
        for (HashNode<K, V> kvHashNode : table) {
            int chainLen = 0;
            HashNode<K, V> curr = kvHashNode;
            while (curr != null) {
                chainLen++;
                curr = curr.getNext();
            }
            if (chainLen > 1) {
                collisions += (chainLen - 1);
            }
        }
        return collisions;
    }
}

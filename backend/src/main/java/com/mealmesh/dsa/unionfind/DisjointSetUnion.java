package com.mealmesh.dsa.unionfind;

import java.util.ArrayList;
import java.util.List;

/**
 * Disjoint Set Union (DSU) / Union-Find with Path Compression and Union by Rank.
 * Strictly avoids third-party disjoint-set libraries.
 * Time complexity per operation: O(alpha(N)) nearly constant.
 */
public class DisjointSetUnion {
    private final int[] parent;
    private final int[] rank;
    private final String[] labels;
    private int componentCount;
    private final List<DsuStep> recordedSteps = new ArrayList<>();
    private boolean recordSteps = true;

    public DisjointSetUnion(int n, String[] labels) {
        this.parent = new int[n];
        this.rank = new int[n];
        this.labels = new String[n];
        this.componentCount = n;

        for (int i = 0; i < n; i++) {
            parent[i] = i;
            rank[i] = 0;
            this.labels[i] = (labels != null && i < labels.length) ? labels[i] : "Node-" + i;
        }
    }

    public DisjointSetUnion(int n) {
        this(n, null);
    }

    public int getComponentCount() {
        return componentCount;
    }

    public void clearSteps() {
        recordedSteps.clear();
    }

    public List<DsuStep> getRecordedSteps() {
        return new ArrayList<>(recordedSteps);
    }

    public void setRecordSteps(boolean recordSteps) {
        this.recordSteps = recordSteps;
    }

    /**
     * Find root of set with recursive path compression.
     */
    public int find(int i) {
        if (i < 0 || i >= parent.length) return -1;
        if (parent[i] == i) {
            return i;
        }
        parent[i] = find(parent[i]); // Path compression
        return parent[i];
    }

    /**
     * Union sets containing elements i and j by rank.
     */
    public boolean union(int i, int j) {
        int rootI = find(i);
        int rootJ = find(j);

        if (rootI == -1 || rootJ == -1) return false;

        if (rootI == rootJ) {
            if (recordSteps) {
                recordedSteps.add(new DsuStep(
                    recordedSteps.size() + 1,
                    "UNION_ALREADY_CONNECTED",
                    labels[i],
                    labels[j],
                    "Nodes '" + labels[i] + "' and '" + labels[j] + "' already share root '" + labels[rootI] + "'",
                    componentCount,
                    takeRootsList()
                ));
            }
            return false;
        }

        // Union by rank
        if (rank[rootI] < rank[rootJ]) {
            parent[rootI] = rootJ;
        } else if (rank[rootI] > rank[rootJ]) {
            parent[rootJ] = rootI;
        } else {
            parent[rootJ] = rootI;
            rank[rootI]++;
        }
        componentCount--;

        if (recordSteps) {
            recordedSteps.add(new DsuStep(
                recordedSteps.size() + 1,
                "UNION_SUCCESS",
                labels[i],
                labels[j],
                "Merged clusters of '" + labels[i] + "' and '" + labels[j] + "'. Component count reduced to " + componentCount,
                componentCount,
                takeRootsList()
            ));
        }

        return true;
    }

    public boolean connected(int i, int j) {
        int rootI = find(i);
        int rootJ = find(j);
        boolean isConnected = (rootI != -1 && rootI == rootJ);

        if (recordSteps) {
            recordedSteps.add(new DsuStep(
                recordedSteps.size() + 1,
                "CONNECTED_QUERY",
                labels[i],
                labels[j],
                "Connected query between '" + labels[i] + "' and '" + labels[j] + "': " + isConnected,
                componentCount,
                takeRootsList()
            ));
        }

        return isConnected;
    }

    public List<String> takeRootsList() {
        List<String> list = new ArrayList<>();
        for (int i = 0; i < parent.length; i++) {
            list.add(labels[find(i)]);
        }
        return list;
    }

    public int size() {
        return parent.length;
    }
}

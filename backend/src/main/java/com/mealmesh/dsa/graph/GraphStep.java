package com.mealmesh.dsa.graph;

import java.util.ArrayList;
import java.util.List;

/**
 * Detailed trace event emitted during graph algorithms (Dijkstra, BFS, DFS)
 * so that frontend algorithmic laboratories can play/pause/scrub through the actual execution.
 */
public class GraphStep {
    private int stepNumber;
    private String type; // "VISIT", "RELAX", "DISCOVER", "FINISH", "QUEUE_PUSH", "QUEUE_POP"
    private String currentVertexId;
    private String targetVertexId;
    private double edgeWeight;
    private double tentativeDistance;
    private String description;
    private List<String> frontier;
    private List<String> visited;

    public GraphStep() {
        this.frontier = new ArrayList<>();
        this.visited = new ArrayList<>();
    }

    public GraphStep(int stepNumber, String type, String currentVertexId, String targetVertexId,
                     double edgeWeight, double tentativeDistance, String description,
                     List<String> frontier, List<String> visited) {
        this.stepNumber = stepNumber;
        this.type = type;
        this.currentVertexId = currentVertexId;
        this.targetVertexId = targetVertexId;
        this.edgeWeight = edgeWeight;
        this.tentativeDistance = tentativeDistance;
        this.description = description;
        this.frontier = frontier != null ? new ArrayList<>(frontier) : new ArrayList<>();
        this.visited = visited != null ? new ArrayList<>(visited) : new ArrayList<>();
    }

    public int getStepNumber() {
        return stepNumber;
    }

    public void setStepNumber(int stepNumber) {
        this.stepNumber = stepNumber;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCurrentVertexId() {
        return currentVertexId;
    }

    public void setCurrentVertexId(String currentVertexId) {
        this.currentVertexId = currentVertexId;
    }

    public String getTargetVertexId() {
        return targetVertexId;
    }

    public void setTargetVertexId(String targetVertexId) {
        this.targetVertexId = targetVertexId;
    }

    public double getEdgeWeight() {
        return edgeWeight;
    }

    public void setEdgeWeight(double edgeWeight) {
        this.edgeWeight = edgeWeight;
    }

    public double getTentativeDistance() {
        return tentativeDistance;
    }

    public void setTentativeDistance(double tentativeDistance) {
        this.tentativeDistance = tentativeDistance;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getFrontier() {
        return frontier;
    }

    public void setFrontier(List<String> frontier) {
        this.frontier = frontier;
    }

    public List<String> getVisited() {
        return visited;
    }

    public void setVisited(List<String> visited) {
        this.visited = visited;
    }
}

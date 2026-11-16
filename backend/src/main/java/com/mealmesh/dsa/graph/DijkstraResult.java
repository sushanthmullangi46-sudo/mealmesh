package com.mealmesh.dsa.graph;

import java.util.ArrayList;
import java.util.List;

public class DijkstraResult {
    private List<Vertex> path;
    private List<String> pathNodeIds;
    private double totalDistanceKm;
    private double totalTimeMinutes;
    private int exploredCount;
    private List<String> exploredVertexIds;
    private List<GraphStep> steps;
    private boolean reachable;

    public DijkstraResult() {
        this.path = new ArrayList<>();
        this.pathNodeIds = new ArrayList<>();
        this.exploredVertexIds = new ArrayList<>();
        this.steps = new ArrayList<>();
        this.reachable = false;
    }

    public List<Vertex> getPath() {
        return path;
    }

    public void setPath(List<Vertex> path) {
        this.path = path;
    }

    public List<String> getPathNodeIds() {
        return pathNodeIds;
    }

    public void setPathNodeIds(List<String> pathNodeIds) {
        this.pathNodeIds = pathNodeIds;
    }

    public double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public void setTotalDistanceKm(double totalDistanceKm) {
        this.totalDistanceKm = totalDistanceKm;
    }

    public double getTotalTimeMinutes() {
        return totalTimeMinutes;
    }

    public void setTotalTimeMinutes(double totalTimeMinutes) {
        this.totalTimeMinutes = totalTimeMinutes;
    }

    public int getExploredCount() {
        return exploredCount;
    }

    public void setExploredCount(int exploredCount) {
        this.exploredCount = exploredCount;
    }

    public List<String> getExploredVertexIds() {
        return exploredVertexIds;
    }

    public void setExploredVertexIds(List<String> exploredVertexIds) {
        this.exploredVertexIds = exploredVertexIds;
    }

    public List<GraphStep> getSteps() {
        return steps;
    }

    public void setSteps(List<GraphStep> steps) {
        this.steps = steps;
    }

    public boolean isReachable() {
        return reachable;
    }

    public void setReachable(boolean reachable) {
        this.reachable = reachable;
    }
}

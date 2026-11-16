package com.mealmesh.dto;

import java.util.List;

public class RouteRequestDto {
    private String originId;
    private String destinationId;
    private List<String> waypointIds;
    private String optimizationObjective = "distance"; // "distance" or "time"

    public RouteRequestDto() {}

    public String getOriginId() { return originId; }
    public void setOriginId(String originId) { this.originId = originId; }

    public String getDestinationId() { return destinationId; }
    public void setDestinationId(String destinationId) { this.destinationId = destinationId; }

    public List<String> getWaypointIds() { return waypointIds; }
    public void setWaypointIds(List<String> waypointIds) { this.waypointIds = waypointIds; }

    public String getOptimizationObjective() { return optimizationObjective; }
    public void setOptimizationObjective(String optimizationObjective) { this.optimizationObjective = optimizationObjective; }
}

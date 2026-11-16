package com.mealmesh.dto;

import java.util.List;

public class DsaLabRequestDto {
    private String structure; // "HEAP", "GRAPH", "HASHTABLE", "QUEUE", "STACK", "LINKEDLIST", "TRIE", "GREEDY", "DSU"
    private String operation; // e.g. "INSERT", "EXTRACT_MIN", "DIJKSTRA", "BFS", "DFS", "PUT", "GET", "SEARCH", "PREFIX_SEARCH", "UNION", "FIND"
    private String key;
    private String value;
    private Double priority;
    private String startNode;
    private String targetNode;
    private String metric;
    private List<String> items;

    public DsaLabRequestDto() {}

    public String getStructure() { return structure; }
    public void setStructure(String structure) { this.structure = structure; }

    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public Double getPriority() { return priority; }
    public void setPriority(Double priority) { this.priority = priority; }

    public String getStartNode() { return startNode; }
    public void setStartNode(String startNode) { this.startNode = startNode; }

    public String getTargetNode() { return targetNode; }
    public void setTargetNode(String targetNode) { this.targetNode = targetNode; }

    public String getMetric() { return metric; }
    public void setMetric(String metric) { this.metric = metric; }

    public List<String> getItems() { return items; }
    public void setItems(List<String> items) { this.items = items; }
}

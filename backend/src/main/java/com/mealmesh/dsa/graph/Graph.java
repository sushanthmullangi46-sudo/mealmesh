package com.mealmesh.dsa.graph;

import com.mealmesh.dsa.heap.HeapItem;
import com.mealmesh.dsa.heap.MinHeap;

import java.util.*;

/**
 * Custom Adjacency-List Graph implementation from scratch.
 * Strictly avoids using standard graph libraries or HashMap/HashSet for core algorithm representations.
 * Provides BFS, DFS, and Dijkstra's Shortest Path with fine-grained step recording.
 */
public class Graph {

    private static class EdgeNode {
        Edge edge;
        EdgeNode next;

        EdgeNode(Edge edge, EdgeNode next) {
            this.edge = edge;
            this.next = next;
        }
    }

    private Vertex[] vertices;
    private EdgeNode[] adjList;
    private int vertexCount;
    private static final int INITIAL_CAPACITY = 64;

    public Graph() {
        this.vertices = new Vertex[INITIAL_CAPACITY];
        this.adjList = new EdgeNode[INITIAL_CAPACITY];
        this.vertexCount = 0;
    }

    public synchronized void addVertex(Vertex vertex) {
        if (indexOf(vertex.getId()) != -1) {
            return; // Vertex already exists
        }
        ensureCapacity();
        vertices[vertexCount] = vertex;
        adjList[vertexCount] = null;
        vertexCount++;
    }

    public synchronized void addEdge(Vertex u, Vertex v, double distanceKm, double transitMinutes, String condition, boolean bidirectional) {
        addVertex(u);
        addVertex(v);

        int uIdx = indexOf(u.getId());
        int vIdx = indexOf(v.getId());

        Edge edgeForward = new Edge(u, v, distanceKm, transitMinutes, condition);
        adjList[uIdx] = new EdgeNode(edgeForward, adjList[uIdx]);

        if (bidirectional) {
            Edge edgeBackward = new Edge(v, u, distanceKm, transitMinutes, condition);
            adjList[vIdx] = new EdgeNode(edgeBackward, adjList[vIdx]);
        }
    }

    public synchronized void addEdge(Vertex u, Vertex v, double distanceKm, double transitMinutes) {
        addEdge(u, v, distanceKm, transitMinutes, "CLEAR", true);
    }

    public Vertex getVertex(String id) {
        int idx = indexOf(id);
        return idx != -1 ? vertices[idx] : null;
    }

    public int indexOf(String id) {
        if (id == null) return -1;
        for (int i = 0; i < vertexCount; i++) {
            if (vertices[i] != null && vertices[i].getId().equalsIgnoreCase(id)) {
                return i;
            }
        }
        return -1;
    }

    public List<Vertex> getVertices() {
        List<Vertex> list = new ArrayList<>(vertexCount);
        for (int i = 0; i < vertexCount; i++) {
            if (vertices[i] != null) {
                list.add(vertices[i]);
            }
        }
        return list;
    }

    public List<Edge> getEdges() {
        List<Edge> edges = new ArrayList<>();
        for (int i = 0; i < vertexCount; i++) {
            EdgeNode curr = adjList[i];
            while (curr != null) {
                edges.add(curr.edge);
                curr = curr.next;
            }
        }
        return edges;
    }

    public List<Edge> getNeighbors(String vertexId) {
        int idx = indexOf(vertexId);
        List<Edge> neighbors = new ArrayList<>();
        if (idx == -1) return neighbors;

        EdgeNode curr = adjList[idx];
        while (curr != null) {
            neighbors.add(curr.edge);
            curr = curr.next;
        }
        return neighbors;
    }

    /**
     * Dijkstra's Shortest Path Algorithm from scratch using custom MinHeap.
     * Generates comprehensive execution step trace for UI visualization.
     */
    public DijkstraResult dijkstra(String startId, String targetId, String metric) {
        DijkstraResult result = new DijkstraResult();
        int startIdx = indexOf(startId);
        int targetIdx = indexOf(targetId);

        if (startIdx == -1 || targetIdx == -1) {
            return result;
        }

        double[] dist = new double[vertexCount];
        int[] parent = new int[vertexCount];
        boolean[] settled = new boolean[vertexCount];
        Arrays.fill(dist, Double.POSITIVE_INFINITY);
        Arrays.fill(parent, -1);

        dist[startIdx] = 0.0;
        MinHeap<Vertex> minHeap = new MinHeap<>(false);
        minHeap.insert(new HeapItem<>(vertices[startIdx].getId(), 0.0, vertices[startIdx].getLabel(), vertices[startIdx]));

        List<GraphStep> steps = new ArrayList<>();
        List<String> visitedOrder = new ArrayList<>();
        int stepCount = 1;

        steps.add(new GraphStep(
            stepCount++,
            "INITIALIZE",
            startId,
            null,
            0.0,
            0.0,
            "Initialized Dijkstra search from '" + vertices[startIdx].getLabel() + "'. All other distances set to infinity.",
            List.of(startId),
            List.of()
        ));

        while (!minHeap.isEmpty()) {
            HeapItem<Vertex> minItem = minHeap.extractMin();
            int uIdx = indexOf(minItem.getId());

            if (uIdx == -1 || settled[uIdx]) {
                continue;
            }

            settled[uIdx] = true;
            visitedOrder.add(vertices[uIdx].getId());

            steps.add(new GraphStep(
                stepCount++,
                "VISIT_VERTEX",
                vertices[uIdx].getId(),
                null,
                0.0,
                dist[uIdx],
                "Settled vertex '" + vertices[uIdx].getLabel() + "' with shortest cost " + String.format(Locale.US, "%.2f", dist[uIdx]),
                getHeapNodeIds(minHeap),
                new ArrayList<>(visitedOrder)
            ));

            if (uIdx == targetIdx) {
                steps.add(new GraphStep(
                    stepCount++,
                    "DESTINATION_REACHED",
                    vertices[targetIdx].getId(),
                    null,
                    0.0,
                    dist[targetIdx],
                    "Target vertex '" + vertices[targetIdx].getLabel() + "' reached with optimal cost " + String.format(Locale.US, "%.2f", dist[targetIdx]),
                    getHeapNodeIds(minHeap),
                    new ArrayList<>(visitedOrder)
                ));
                break;
            }

            EdgeNode edgeNode = adjList[uIdx];
            while (edgeNode != null) {
                Edge edge = edgeNode.edge;
                int vIdx = indexOf(edge.getDestination().getId());

                if (vIdx != -1 && !settled[vIdx]) {
                    double weight = edge.getEffectiveWeight(metric);
                    double newDist = dist[uIdx] + weight;

                    steps.add(new GraphStep(
                        stepCount++,
                        "EXAMINE_EDGE",
                        vertices[uIdx].getId(),
                        vertices[vIdx].getId(),
                        weight,
                        newDist,
                        "Evaluating road to '" + vertices[vIdx].getLabel() + "' (cost: " + String.format(Locale.US, "%.2f", weight) + ")",
                        getHeapNodeIds(minHeap),
                        new ArrayList<>(visitedOrder)
                    ));

                    if (newDist < dist[vIdx]) {
                        dist[vIdx] = newDist;
                        parent[vIdx] = uIdx;
                        minHeap.insert(new HeapItem<>(vertices[vIdx].getId(), newDist, vertices[vIdx].getLabel(), vertices[vIdx]));

                        steps.add(new GraphStep(
                            stepCount++,
                            "RELAX_EDGE",
                            vertices[uIdx].getId(),
                            vertices[vIdx].getId(),
                            weight,
                            newDist,
                            "Relaxed edge: Updated shortest cost to '" + vertices[vIdx].getLabel() + "' -> " + String.format(Locale.US, "%.2f", newDist),
                            getHeapNodeIds(minHeap),
                            new ArrayList<>(visitedOrder)
                        ));
                    }
                }
                edgeNode = edgeNode.next;
            }
        }

        result.setSteps(steps);
        result.setExploredCount(visitedOrder.size());
        result.setExploredVertexIds(visitedOrder);

        if (dist[targetIdx] < Double.POSITIVE_INFINITY) {
            result.setReachable(true);
            List<Vertex> path = new ArrayList<>();
            List<String> pathIds = new ArrayList<>();
            int curr = targetIdx;
            while (curr != -1) {
                path.add(0, vertices[curr]);
                pathIds.add(0, vertices[curr].getId());
                curr = parent[curr];
            }
            result.setPath(path);
            result.setPathNodeIds(pathIds);

            // Compute total actual distance and transit time along reconstructed path
            double totalDist = 0.0;
            double totalTime = 0.0;
            for (int i = 0; i < path.size() - 1; i++) {
                Vertex a = path.get(i);
                Vertex b = path.get(i + 1);
                Edge edge = findEdge(a.getId(), b.getId());
                if (edge != null) {
                    totalDist += edge.getDistanceKm();
                    totalTime += edge.getEffectiveWeight("time");
                } else {
                    totalDist += a.distanceTo(b);
                    totalTime += (a.distanceTo(b) / 30.0) * 60.0; // 30 km/h estimate
                }
            }
            result.setTotalDistanceKm(Math.round(totalDist * 100.0) / 100.0);
            result.setTotalTimeMinutes(Math.round(totalTime * 10.0) / 10.0);
        }

        return result;
    }

    /**
     * Breadth-First Search traversal with step logging.
     */
    public List<GraphStep> bfs(String startId) {
        List<GraphStep> steps = new ArrayList<>();
        int startIdx = indexOf(startId);
        if (startIdx == -1) return steps;

        boolean[] visited = new boolean[vertexCount];
        int[] queue = new int[vertexCount];
        int head = 0, tail = 0;

        queue[tail++] = startIdx;
        visited[startIdx] = true;

        List<String> visitedOrder = new ArrayList<>();
        int stepNumber = 1;

        while (head < tail) {
            int uIdx = queue[head++];
            visitedOrder.add(vertices[uIdx].getId());

            steps.add(new GraphStep(
                stepNumber++,
                "VISIT_VERTEX",
                vertices[uIdx].getId(),
                null,
                0,
                0,
                "BFS Visited: " + vertices[uIdx].getLabel(),
                getQueueLabels(queue, head, tail),
                new ArrayList<>(visitedOrder)
            ));

            EdgeNode curr = adjList[uIdx];
            while (curr != null) {
                int vIdx = indexOf(curr.edge.getDestination().getId());
                if (vIdx != -1 && !visited[vIdx]) {
                    visited[vIdx] = true;
                    queue[tail++] = vIdx;

                    steps.add(new GraphStep(
                        stepNumber++,
                        "DISCOVER_VERTEX",
                        vertices[uIdx].getId(),
                        vertices[vIdx].getId(),
                        curr.edge.getDistanceKm(),
                        0,
                        "Discovered neighbor '" + vertices[vIdx].getLabel() + "' from '" + vertices[uIdx].getLabel() + "'",
                        getQueueLabels(queue, head, tail),
                        new ArrayList<>(visitedOrder)
                    ));
                }
                curr = curr.next;
            }
        }
        return steps;
    }

    /**
     * Depth-First Search traversal with step logging.
     */
    public List<GraphStep> dfs(String startId) {
        List<GraphStep> steps = new ArrayList<>();
        int startIdx = indexOf(startId);
        if (startIdx == -1) return steps;

        boolean[] visited = new boolean[vertexCount];
        List<String> visitedOrder = new ArrayList<>();
        dfsRecursive(startIdx, visited, visitedOrder, steps, new int[]{1});
        return steps;
    }

    private void dfsRecursive(int uIdx, boolean[] visited, List<String> visitedOrder, List<GraphStep> steps, int[] stepCounter) {
        visited[uIdx] = true;
        visitedOrder.add(vertices[uIdx].getId());

        steps.add(new GraphStep(
            stepCounter[0]++,
            "VISIT_VERTEX",
            vertices[uIdx].getId(),
            null,
            0,
            0,
            "DFS Visited: " + vertices[uIdx].getLabel(),
            List.of(),
            new ArrayList<>(visitedOrder)
        ));

        EdgeNode curr = adjList[uIdx];
        while (curr != null) {
            int vIdx = indexOf(curr.edge.getDestination().getId());
            if (vIdx != -1 && !visited[vIdx]) {
                steps.add(new GraphStep(
                    stepCounter[0]++,
                    "EXPLORE_EDGE",
                    vertices[uIdx].getId(),
                    vertices[vIdx].getId(),
                    curr.edge.getDistanceKm(),
                    0,
                    "Exploring branch to '" + vertices[vIdx].getLabel() + "'",
                    List.of(),
                    new ArrayList<>(visitedOrder)
                ));
                dfsRecursive(vIdx, visited, visitedOrder, steps, stepCounter);
            }
            curr = curr.next;
        }
    }

    private Edge findEdge(String uId, String vId) {
        int uIdx = indexOf(uId);
        if (uIdx == -1) return null;
        EdgeNode curr = adjList[uIdx];
        while (curr != null) {
            if (curr.edge.getDestination().getId().equalsIgnoreCase(vId)) {
                return curr.edge;
            }
            curr = curr.next;
        }
        return null;
    }

    private List<String> getHeapNodeIds(MinHeap<Vertex> heap) {
        List<String> ids = new ArrayList<>();
        for (HeapItem<Vertex> item : heap.toList()) {
            ids.add(item.getId());
        }
        return ids;
    }

    private List<String> getQueueLabels(int[] queue, int head, int tail) {
        List<String> list = new ArrayList<>();
        for (int i = head; i < tail; i++) {
            list.add(vertices[queue[i]].getId());
        }
        return list;
    }

    private void ensureCapacity() {
        if (vertexCount >= vertices.length) {
            int newCap = vertices.length * 2;
            Vertex[] newV = new Vertex[newCap];
            EdgeNode[] newAdj = new EdgeNode[newCap];
            System.arraycopy(vertices, 0, newV, 0, vertexCount);
            System.arraycopy(adjList, 0, newAdj, 0, vertexCount);
            vertices = newV;
            adjList = newAdj;
        }
    }
}

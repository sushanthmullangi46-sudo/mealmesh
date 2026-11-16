package com.mealmesh.dsa;

import com.mealmesh.dsa.graph.DijkstraResult;
import com.mealmesh.dsa.graph.Graph;
import com.mealmesh.dsa.graph.GraphStep;
import com.mealmesh.dsa.graph.Vertex;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GraphDijkstraTest {

    private Graph graph;
    private Vertex vA;
    private Vertex vB;
    private Vertex vC;
    private Vertex vD;

    @BeforeEach
    void setUp() {
        graph = new Graph();
        vA = new Vertex("A", "Node A", 12.93, 77.62, "DONOR");
        vB = new Vertex("B", "Node B", 12.95, 77.63, "JUNCTION");
        vC = new Vertex("C", "Node C", 12.97, 77.64, "NGO");
        vD = new Vertex("D", "Node D", 12.99, 77.65, "ISOLATED");

        graph.addVertex(vA);
        graph.addVertex(vB);
        graph.addVertex(vC);
        graph.addVertex(vD);

        // Path A -> B -> C (total dist 7.0) vs direct A -> C (dist 10.0)
        graph.addEdge(vA, vB, 3.0, 10.0, "CLEAR", true);
        graph.addEdge(vB, vC, 4.0, 12.0, "CLEAR", true);
        graph.addEdge(vA, vC, 10.0, 30.0, "CLEAR", true);
    }

    @Test
    void testDijkstraShortestPath() {
        DijkstraResult result = graph.dijkstra("A", "C", "distance");
        assertTrue(result.isReachable());
        assertEquals(7.0, result.getTotalDistanceKm());
        assertEquals(List.of("A", "B", "C"), result.getPathNodeIds());
        assertFalse(result.getSteps().isEmpty());
    }

    @Test
    void testUnreachableNode() {
        DijkstraResult result = graph.dijkstra("A", "D", "distance");
        assertFalse(result.isReachable());
        assertTrue(result.getPath().isEmpty());
    }

    @Test
    void testBfsAndDfs() {
        List<GraphStep> bfsSteps = graph.bfs("A");
        assertFalse(bfsSteps.isEmpty());

        List<GraphStep> dfsSteps = graph.dfs("A");
        assertFalse(dfsSteps.isEmpty());
    }
}

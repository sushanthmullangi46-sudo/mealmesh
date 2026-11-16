package com.mealmesh.service;

import com.mealmesh.dsa.graph.DijkstraResult;
import com.mealmesh.dsa.graph.Graph;
import com.mealmesh.dsa.graph.GraphStep;
import com.mealmesh.dsa.graph.Vertex;
import com.mealmesh.dsa.greedy.DonationBatch;
import com.mealmesh.dsa.greedy.GreedyAllocator;
import com.mealmesh.dsa.greedy.NgoCandidate;
import com.mealmesh.dsa.hashtable.CustomHashTable;
import com.mealmesh.dsa.heap.HeapItem;
import com.mealmesh.dsa.heap.MinHeap;
import com.mealmesh.dsa.linkedlist.DoublyLinkedList;
import com.mealmesh.dsa.queue.CustomQueue;
import com.mealmesh.dsa.stack.CustomStack;
import com.mealmesh.dsa.trie.Trie;
import com.mealmesh.dsa.unionfind.DisjointSetUnion;
import com.mealmesh.dto.DsaLabRequestDto;
import com.mealmesh.routing.RouteOptimizationService;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DsaLabService {

    private final RouteOptimizationService routeOptimizationService;

    // In-memory persistent interactive lab instances
    private final MinHeap<String> labHeap = new MinHeap<>(true);
    private final CustomHashTable<String, String> labHashTable = new CustomHashTable<>(8);
    private final CustomQueue<String> labQueue = new CustomQueue<>();
    private final CustomStack<String> labStack = new CustomStack<>();
    private final DoublyLinkedList<String> labLinkedList = new DoublyLinkedList<>();
    private final Trie labTrie = new Trie();
    private DisjointSetUnion labDsu;

    public DsaLabService(RouteOptimizationService routeOptimizationService) {
        this.routeOptimizationService = routeOptimizationService;
    }

    @PostConstruct
    public void seedLabStructures() {
        // Seed MinHeap with initial food donations
        labHeap.setRecordSteps(false);
        labHeap.insert(new HeapItem<>("DON-01", 1.5, "Surplus Meals (ITC)", "CRITICAL", "Biryani 30kg"));
        labHeap.insert(new HeapItem<>("DON-02", 3.0, "Bakery Surplus (Thom's)", "HIGH", "Bread 15kg"));
        labHeap.insert(new HeapItem<>("DON-03", 5.0, "Raw Vegetables (Reliance)", "MEDIUM", "Veggies 40kg"));
        labHeap.insert(new HeapItem<>("DON-04", 2.0, "Cooked Rice (Taza Kitchen)", "HIGH", "Rice 25kg"));
        labHeap.setRecordSteps(true);

        // Seed HashTable
        labHashTable.setRecordSteps(false);
        labHashTable.put("DON-101", "ITC Gardenia Kitchen - 45kg Meals");
        labHashTable.put("DON-102", "Corner House Sweets - 20kg Desserts");
        labHashTable.put("DON-103", "Triguna Sweets - 15kg Snacks");
        labHashTable.put("NGO-201", "Akshaya Patra HSR Hub");
        labHashTable.put("VOL-301", "Rahul Sharma (Two-Wheeler)");
        labHashTable.setRecordSteps(true);

        // Seed Queue
        labQueue.setRecordSteps(false);
        labQueue.enqueue("Request #101: Robin Hood Army (30kg)");
        labQueue.enqueue("Request #102: Feeding India (50kg)");
        labQueue.enqueue("Request #103: Samarthanam Trust (25kg)");
        labQueue.setRecordSteps(true);

        // Seed Stack
        labStack.setRecordSteps(false);
        labStack.push("Action: Alloc #401 Confirmed (ITC -> Akshaya)");
        labStack.push("Action: Volunteer #12 Assigned (Rahul)");
        labStack.push("Action: Route Optimisation Recalculated");
        labStack.setRecordSteps(true);

        // Seed Doubly Linked List
        labLinkedList.setRecordSteps(false);
        labLinkedList.addLast("09:00 AM - Donation DON-01 Posted");
        labLinkedList.addLast("10:15 AM - Matched with Akshaya Patra");
        labLinkedList.addLast("10:45 AM - Volunteer Picked Up");
        labLinkedList.addLast("11:30 AM - Delivered Successfully");
        labLinkedList.setRecordSteps(true);

        // Seed Trie
        labTrie.setRecordSteps(false);
        labTrie.insert("akshaya patra foundation", "NGO-01");
        labTrie.insert("akshaya kitchen koramangala", "NGO-02");
        labTrie.insert("annapoorna trust", "NGO-03");
        labTrie.insert("biryani meals", "CAT-01");
        labTrie.insert("bakery items", "CAT-02");
        labTrie.insert("bread and pastries", "CAT-03");
        labTrie.insert("breakfast buffet", "CAT-04");
        labTrie.insert("itc gardenia", "DON-01");
        labTrie.insert("indiranagar community kitchen", "DON-02");
        labTrie.setRecordSteps(true);

        // Seed DSU (8 delivery zones across Bengaluru)
        String[] zones = {"Koramangala", "Indiranagar", "HSR", "Whitefield", "MG Road", "Jayanagar", "Malleshwaram", "Electronic City"};
        labDsu = new DisjointSetUnion(zones.length, zones);
        labDsu.setRecordSteps(false);
        labDsu.union(0, 2); // Koramangala - HSR
        labDsu.union(1, 4); // Indiranagar - MG Road
        labDsu.setRecordSteps(true);
    }

    public Map<String, Object> executeOperation(DsaLabRequestDto req) {
        String structure = req.getStructure() != null ? req.getStructure().toUpperCase() : "HEAP";
        String operation = req.getOperation() != null ? req.getOperation().toUpperCase() : "PEEK";

        Map<String, Object> response = new HashMap<>();
        response.put("structure", structure);
        response.put("operation", operation);

        switch (structure) {
            case "HEAP" -> {
                labHeap.clearSteps();
                if ("INSERT".equalsIgnoreCase(operation)) {
                    double prio = req.getPriority() != null ? req.getPriority() : 2.5;
                    String label = req.getValue() != null ? req.getValue() : "New Donation (" + prio + "h)";
                    String urgency = prio <= 2.0 ? "CRITICAL" : (prio <= 4.0 ? "HIGH" : "MEDIUM");
                    labHeap.insert(new HeapItem<>("DON-" + (System.currentTimeMillis() % 1000), prio, label, urgency, label));
                } else if ("EXTRACT_MIN".equalsIgnoreCase(operation)) {
                    HeapItem<String> min = labHeap.extractMin();
                    response.put("extractedItem", min != null ? min.toString() : null);
                }
                response.put("heapSnapshot", labHeap.takeSnapshot());
                response.put("steps", labHeap.getRecordedSteps());
                response.put("size", labHeap.size());
            }
            case "GRAPH" -> {
                Graph graph = routeOptimizationService.getGraph();
                String start = req.getStartNode() != null ? req.getStartNode() : "V_KORAMANGALA";
                String target = req.getTargetNode() != null ? req.getTargetNode() : "V_JAYANAGAR";
                String metric = req.getMetric() != null ? req.getMetric() : "distance";

                if ("BFS".equalsIgnoreCase(operation)) {
                    List<GraphStep> steps = graph.bfs(start);
                    response.put("steps", steps);
                    response.put("algorithm", "Breadth-First Search (Queue-driven Level Traversal)");
                } else if ("DFS".equalsIgnoreCase(operation)) {
                    List<GraphStep> steps = graph.dfs(start);
                    response.put("steps", steps);
                    response.put("algorithm", "Depth-First Search (Recursive Backtracking)");
                } else {
                    DijkstraResult res = graph.dijkstra(start, target, metric);
                    response.put("dijkstraResult", res);
                    response.put("steps", res.getSteps());
                    response.put("algorithm", "Dijkstra Shortest Path with Binary Min-Heap Priority Queue");
                }
                response.put("vertices", graph.getVertices());
            }
            case "HASHTABLE" -> {
                labHashTable.clearSteps();
                if ("PUT".equalsIgnoreCase(operation)) {
                    String k = req.getKey() != null ? req.getKey() : "DON-" + (System.currentTimeMillis() % 1000);
                    String v = req.getValue() != null ? req.getValue() : "Donation batch item";
                    labHashTable.put(k, v);
                } else if ("GET".equalsIgnoreCase(operation)) {
                    String val = labHashTable.get(req.getKey());
                    response.put("foundValue", val);
                } else if ("REMOVE".equalsIgnoreCase(operation)) {
                    String removed = labHashTable.remove(req.getKey());
                    response.put("removedValue", removed);
                }
                response.put("buckets", labHashTable.takeSnapshot());
                response.put("steps", labHashTable.getRecordedSteps());
                response.put("size", labHashTable.size());
                response.put("capacity", labHashTable.capacity());
                response.put("loadFactor", Math.round(labHashTable.loadFactor() * 100.0) / 100.0);
                response.put("collisions", labHashTable.getCollisionCount());
            }
            case "QUEUE" -> {
                labQueue.clearSteps();
                if ("ENQUEUE".equalsIgnoreCase(operation)) {
                    String item = req.getValue() != null ? req.getValue() : "Food Request #" + (System.currentTimeMillis() % 1000);
                    labQueue.enqueue(item);
                } else if ("DEQUEUE".equalsIgnoreCase(operation)) {
                    String item = labQueue.dequeue();
                    response.put("dequeuedItem", item);
                }
                response.put("currentQueue", labQueue.toListOfStrings());
                response.put("steps", labQueue.getRecordedSteps());
                response.put("size", labQueue.size());
            }
            case "STACK" -> {
                labStack.clearSteps();
                if ("PUSH".equalsIgnoreCase(operation)) {
                    String action = req.getValue() != null ? req.getValue() : "Admin Action #" + (System.currentTimeMillis() % 1000);
                    labStack.push(action);
                } else if ("POP".equalsIgnoreCase(operation)) {
                    String popped = labStack.pop();
                    response.put("poppedAction", popped);
                }
                response.put("currentStack", labStack.toListOfStrings());
                response.put("steps", labStack.getRecordedSteps());
                response.put("size", labStack.size());
            }
            case "LINKEDLIST" -> {
                labLinkedList.clearSteps();
                if ("ADD_FIRST".equalsIgnoreCase(operation)) {
                    labLinkedList.addFirst(req.getValue() != null ? req.getValue() : "Head Event");
                } else if ("ADD_LAST".equalsIgnoreCase(operation)) {
                    labLinkedList.addLast(req.getValue() != null ? req.getValue() : "Tail Event");
                } else if ("REMOVE".equalsIgnoreCase(operation)) {
                    boolean removed = labLinkedList.remove(req.getValue());
                    response.put("removedSuccess", removed);
                }
                response.put("forward", labLinkedList.toForwardList());
                response.put("backward", labLinkedList.toBackwardList());
                response.put("steps", labLinkedList.getRecordedSteps());
                response.put("size", labLinkedList.size());
            }
            case "TRIE" -> {
                labTrie.clearSteps();
                if ("INSERT".equalsIgnoreCase(operation)) {
                    String word = req.getKey() != null ? req.getKey() : "sample entity";
                    String id = req.getValue() != null ? req.getValue() : "ENT-" + (System.currentTimeMillis() % 1000);
                    labTrie.insert(word, id);
                }
                String prefix = req.getKey() != null ? req.getKey() : "ak";
                List<String> matches = labTrie.prefixSearch(prefix);
                response.put("prefixQuery", prefix);
                response.put("matches", matches);
                response.put("steps", labTrie.getRecordedSteps());
                response.put("wordCount", labTrie.getWordCount());
            }
            case "UNIONFIND" -> {
                labDsu.clearSteps();
                if ("UNION".equalsIgnoreCase(operation)) {
                    int i = req.getKey() != null ? Integer.parseInt(req.getKey()) : 0;
                    int j = req.getValue() != null ? Integer.parseInt(req.getValue()) : 1;
                    boolean unioned = labDsu.union(i, j);
                    response.put("unioned", unioned);
                } else if ("CONNECTED".equalsIgnoreCase(operation)) {
                    int i = req.getKey() != null ? Integer.parseInt(req.getKey()) : 0;
                    int j = req.getValue() != null ? Integer.parseInt(req.getValue()) : 1;
                    boolean conn = labDsu.connected(i, j);
                    response.put("connected", conn);
                }
                response.put("componentCount", labDsu.getComponentCount());
                response.put("roots", labDsu.takeRootsList());
                response.put("steps", labDsu.getRecordedSteps());
            }
            case "GREEDY" -> {
                double qty = req.getPriority() != null ? req.getPriority() : 60.0;
                DonationBatch batch = new DonationBatch("DON-GREEDY-DEMO", "Hot Meals (Curry & Rice)", qty, 12.9352, 77.6245, 3, "VEG", "HIGH");
                List<NgoCandidate> ngos = List.of(
                    new NgoCandidate("NGO-1", "Akshaya Patra Foundation", 12.9250, 77.5938, 20.0, 50.0, List.of("VEG", "ALL")),
                    new NgoCandidate("NGO-2", "Robin Hood Army HSR", 12.9121, 77.6446, 10.0, 40.0, List.of("VEG")),
                    new NgoCandidate("NGO-3", "Feeding India Indiranagar", 12.9784, 77.6408, 0.0, 30.0, List.of("VEG", "NON_VEG")),
                    new NgoCandidate("NGO-4", "Samarthanam Trust", 12.8452, 77.6602, 10.0, 50.0, List.of("VEG"))
                );
                GreedyAllocator.AllocationResult allocRes = GreedyAllocator.allocate(batch, ngos);
                response.put("allocationResult", allocRes);
                response.put("steps", allocRes.getSteps());
            }
            default -> response.put("message", "Unknown structure: " + structure);
        }

        return response;
    }
}

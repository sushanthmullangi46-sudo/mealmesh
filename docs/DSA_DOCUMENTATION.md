# MealMesh – Data Structures & Algorithms (DSA) Engine Documentation

MealMesh is built on genuine, production-grade Data Structures and Algorithms designed and implemented from scratch in Java. Standard collection wrappers (`java.util.PriorityQueue`, `java.util.HashMap`, `java.util.Stack`, `java.util.LinkedList`) were strictly avoided for the internal representations to demonstrate pure computer science fundamentals.

---

## 1. Custom Binary Min-Heap Priority Queue

- **Package:** `com.mealmesh.dsa.heap.MinHeap<T>`
- **Real-World Purpose:** Prioritizes active food donations according to expiry deadlines and urgency weight. Food batches nearing expiration are automatically positioned at the root ($O(1)$ lookup, $O(\log N)$ extraction) so NGOs and dispatchers can rescue them before spoilage.
- **Internal Structure:** Dynamic 0-indexed array with explicit pointer arithmetic:
  $$\text{Parent}(i) = \left\lfloor \frac{i - 1}{2} \right\rfloor, \quad \text{Left}(i) = 2i + 1, \quad \text{Right}(i) = 2i + 2$$
- **Operations & Complexity:**
  - `insert(item)`: $O(\log N)$ via bottom-up `heapifyUp`
  - `extractMin()`: $O(\log N)$ via top-down `heapifyDown`
  - `peek()`: $O(1)$
  - `updatePriority(id, newPriority)`: $O(N + \log N)$
- **Visualization:** Generates step-by-step array snapshots and swap highlights for the interactive DSA Laboratory.

---

## 2. Custom Graph & Dijkstra Shortest Path Engine

- **Package:** `com.mealmesh.dsa.graph.Graph`
- **Real-World Purpose:** Represents the Bengaluru urban transport network (junctions, donor kitchens, distribution shelters). Calculates the optimal volunteer delivery route minimizing road distance or traffic-adjusted travel time.
- **Internal Structure:** Adjacency list using custom singly linked `EdgeNode` structures per vertex.
- **Algorithms:**
  - **Dijkstra Shortest Path:** Uses the custom `MinHeap` priority queue to greedily settle vertices with minimum distance.
    $$\text{Time Complexity: } O((V + E) \log V), \quad \text{Space: } O(V + E)$$
  - **Breadth-First Search (BFS):** Level-by-level exploration using a custom queue.
  - **Depth-First Search (DFS):** Branch exploration using recursive backtracking.
  - **Nearest-Neighbor TSP Heuristic:** Sequences multi-stop pickups by chaining Dijkstra shortest paths between nearest unvisited stops.

---

## 3. Custom Separate-Chaining Hash Table

- **Package:** `com.mealmesh.dsa.hashtable.CustomHashTable<K, V>`
- **Real-World Purpose:** Instantaneous $O(1)$ lookups for active food donations, registered NGOs, and delivery waypoints by alphanumeric ID.
- **Internal Structure:** Array of buckets with singly-linked `HashNode<K, V>` collision chains.
- **Hash Function:** Polynomial rolling hash with prime base $p = 31$ and large prime modulus:
  $$h(s) = \left( \sum_{i=0}^{n-1} (s[i] + 1) \cdot 31^i \right) \pmod{10^9 + 7} \pmod M$$
- **Dynamic Rehashing:** Automatically doubles capacity and re-inserts all existing nodes when the load factor $\alpha = \frac{N}{M}$ exceeds $0.75$.
- **Complexity:** Average $O(1)$ search, insert, and delete.

---

## 4. Multi-Criteria Greedy Matching & Allocation Engine

- **Package:** `com.mealmesh.dsa.greedy.GreedyAllocator`
- **Real-World Purpose:** Matches newly registered surplus food batches with verified candidate NGOs based on a weighted composite utility function.
- **Scoring Function:**
  $$\text{Score} = w_1 \cdot \text{Proximity} + w_2 \cdot \text{CapacityFit} + w_3 \cdot \text{DietaryMatch} + w_4 \cdot \text{ExpiryUrgency}$$
  - **Proximity:** Inverse Haversine distance: $\max(0, 100 - 4 \cdot \text{distKm})$
  - **Capacity Fit:** Proportion of surplus quantity that fits within candidate NGO's available storage space.
  - **Dietary Match:** 100 points for matching dietary requirements (Veg, Non-Veg, Vegan).
  - **Expiry Urgency:** Multiplier ($1.5\times$ for critical, $1.25\times$ for high).
- **In-Place Sorting:** In-place QuickSort partition ordering candidate NGOs descending by composite score, then sequentially allocating quantity without exceeding storage limits.

---

## 5. Disjoint Set Union (DSU / Union-Find)

- **Package:** `com.mealmesh.dsa.unionfind.DisjointSetUnion`
- **Real-World Purpose:** Groups Bengaluru urban delivery waypoints, donor kitchens, and recipient NGOs into connected clusters and delivery zones.
- **Optimizations:**
  - **Path Compression:** Flattens tree hierarchy during `find(i)`, linking visited nodes directly to the root.
  - **Union by Rank:** Attaches smaller trees under the root of deeper trees to prevent degenerate chains.
- **Complexity:** $O(\alpha(N))$ nearly $O(1)$ per operation, where $\alpha$ is the Inverse Ackermann function.

---

## 6. Custom Prefix Tree (Trie)

- **Package:** `com.mealmesh.dsa.trie.Trie`
- **Real-World Purpose:** Sub-millisecond instant autocomplete and prefix search for registered donors, NGOs, food categories, and dish names.
- **Internal Structure:** 128-element child pointer array per `TrieNode` covering ASCII character set without collection wrappers.
- **Complexity:** $O(L)$ where $L$ is the length of the query string.

---

## 7. Custom Singly-Linked FIFO Queue

- **Package:** `com.mealmesh.dsa.queue.CustomQueue<T>`
- **Real-World Purpose:** Fair, first-come-first-served request processing for NGOs requesting staple food batches during supply shortages.
- **Complexity:** $O(1)$ enqueue (tail) and $O(1)$ dequeue (head).

---

## 8. Custom Singly-Linked LIFO Stack

- **Package:** `com.mealmesh.dsa.stack.CustomStack<T>`
- **Real-World Purpose:** Powers the administrative reversible operation stack. Any verification toggle, status edit, or manual reassignment is pushed onto the stack and can be popped to roll back the state safely.
- **Complexity:** $O(1)$ push and $O(1)$ pop.

---

## 9. Custom Doubly Linked List

- **Package:** `com.mealmesh.dsa.linkedlist.DoublyLinkedList<T>`
- **Real-World Purpose:** Chronological timeline navigation for food donations and deliveries. Supports bidirectional forward and backward step hops with $O(1)$ head/tail manipulation.

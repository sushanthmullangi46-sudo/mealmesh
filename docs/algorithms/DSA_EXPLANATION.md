# Data Structures & Algorithms (DSA) Technical Specification

This document provides in-depth algorithmic documentation, formal mathematical foundations, pseudocode, and rigorous time/space complexity analyses for the **Intelligent Route Optimization & Navigation System**.

---

## 1. Graph Data Model & Representations

### 1.1 Mathematical Formulation
The road network is modeled as a weighted, directed multigraph $G = (V, E, W)$, where:
- $V = \{v_1, v_2, \dots, v_n\}$ represents physical intersections, landmarks, and transit terminals.
- $E \subseteq V \times V$ represents navigable road segments.
- $W: E \times \mathcal{O} \to \mathbb{R}^+$ represents dynamic edge cost under an optimization objective $\mathcal{O} \in \{\text{Distance}, \text{Time}, \text{Cost}\}$.

### 1.2 In-Memory Representation
- **Structure**: Adjacency list backed by hash tables:
  $$\text{adj}: V \to \text{List}[E]$$
- **Space Complexity**: $\mathcal{O}(|V| + |E|)$
- **Lookup Complexity**: $\mathcal{O}(1)$ average node lookup, $\mathcal{O}(\text{deg}(u))$ neighbor iteration.

---

## 2. Dijkstra's Shortest Path Algorithm

### 2.1 Description
Dijkstra's algorithm solves the Single-Source Shortest Path (SSSP) problem on graphs with non-negative edge weights. It maintains a frontier set prioritized by tentative distance using a Min-Heap.

### 2.2 Complexity Analysis
- **Time Complexity**: $\mathcal{O}((|V| + |E|) \log |V|)$
  - Extract-Min: $|V|$ operations each taking $\mathcal{O}(\log |V|)$ in binary heap.
  - Decrease-Key / Push: At most $|E|$ edge relaxations taking $\mathcal{O}(\log |V|)$.
- **Space Complexity**: $\mathcal{O}(|V|)$ to store distance, visited, parent, and priority queue arrays.

### 2.3 Pseudocode
```
Algorithm Dijkstra(G, source, target, objective):
    Input:  Graph G = (V, E), source node s, target node t, objective O
    Output: Path P, total cost C

    dist[v] <- INF for all v in V
    parent[v] <- NULL for all v in V
    visited[v] <- FALSE for all v in V

    dist[s] <- 0
    PQ <- new MinPriorityQueue()
    PQ.push(s, priority = 0)

    while PQ is not empty:
        (u, d) <- PQ.pop()

        if visited[u]:
            continue
        visited[u] <- TRUE

        if u == t:
            break

        for each edge e = (u, v) in G.adj[u]:
            w <- e.getWeight(O)
            if w == INF or visited[v]:
                continue

            newDist <- d + w
            if newDist < dist[v]:
                dist[v] <- newDist
                parent[v] <- u
                PQ.push(v, priority = newDist)

    if dist[t] == INF:
        return (NoPath, INF)

    // Reconstruct path
    P <- []
    curr <- t
    while curr != NULL:
        P.prepend(curr)
        curr <- parent[curr]

    return (P, dist[t])
```

---

## 3. A* Pathfinding with Admissible Haversine Heuristic

### 3.1 Description
A* enhances Dijkstra's search by directing exploration toward the target using an evaluation function:
$$f(n) = g(n) + h(n)$$
where $g(n)$ is the exact cost from source to $n$, and $h(n)$ is the heuristic estimate from $n$ to target $t$.

### 3.2 Haversine Great-Circle Heuristic
$$d_{\text{hav}}(\phi_1, \lambda_1, \phi_2, \lambda_2) = 2 R \arcsin \left( \sqrt{ \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos \phi_1 \cos \phi_2 \sin^2\left(\frac{\Delta \lambda}{2}\right) } \right)$$
- Mean Earth radius: $R = 6371.0088\text{ km}$.

### 3.3 Proof of Admissibility & Consistency
1. **Admissibility**: A heuristic is admissible if $h(u) \le h^*(u)$ for all $u$, where $h^*(u)$ is the true shortest path cost from $u$ to target $t$.
   - **Distance Objective**: The great-circle arc is the shortest possible geodesic path between two spherical points. Because road networks conform to terrain and streets, actual road distance $d_{\text{road}}(u, t) \ge d_{\text{hav}}(u, t)$. Hence, $h(u) \le d^*(u, t)$ strictly holds.
   - **Time Objective**: Let $v_{\max} = \max_{e \in E} (\text{speed limit of } e)$. The lower bound travel time is $h_t(u) = \frac{d_{\text{hav}}(u, t)}{v_{\max}} \times 60.0$. Since actual travel speed $\le v_{\max}$ and actual distance $\ge d_{\text{hav}}$, $h_t(u) \le t^*(u, t)$.
2. **Consistency (Monotonicity)**: For any edge $(u, v)$ with weight $w(u, v)$:
   $$h(u) \le w(u, v) + h(v)$$
   By the spherical triangle inequality, $d_{\text{hav}}(u, t) \le d_{\text{hav}}(u, v) + d_{\text{hav}}(v, t) \le w(u, v) + d_{\text{hav}}(v, t)$. Thus consistency is guaranteed, ensuring nodes are expanded at most once.

### 3.4 Complexity Analysis
- **Time Complexity**: $\mathcal{O}(|E| \log |V|)$ worst-case, but substantially lower than Dijkstra on average ($\approx 40\text{--}70\%$ reduction in explored nodes).
- **Space Complexity**: $\mathcal{O}(|V|)$ for open and closed sets.

---

## 4. Disjoint Set Union (DSU) & Connectivity Analysis

### 4.1 Description
Used to partition the road network into connected components and detect isolated vertices or disconnected islands.

### 4.2 Optimizations
1. **Path Compression**: During `find(x)`, every traversed node points directly to the component root:
   $$\text{parent}[x] \leftarrow \text{find}(\text{parent}[x])$$
2. **Union by Rank**: The tree with smaller height is attached under the root of the tree with greater height.

### 4.3 Complexity Analysis
- **Time Complexity**: $\mathcal{O}(\alpha(|V|))$ amortized per operation, where $\alpha$ is the Inverse Ackermann function ($\alpha(N) < 5$ for all physical universe inputs). Total analysis time: $\mathcal{O}(|V| + |E| \alpha(|V|))$.
- **Space Complexity**: $\mathcal{O}(|V|)$ for `parent` and `rank` maps.

---

## 5. Multi-Stop Route Optimization (TSP 2-Opt Heuristic)

### 5.1 Description
Visiting $K$ waypoints is an instance of the NP-hard Traveling Salesperson Problem. The system implements a two-stage approximation pipeline:
1. **Stage 1 (Construction)**: Nearest Neighbor Greedy Heuristic.
2. **Stage 2 (Local Search)**: 2-Opt edge exchange.

### 5.2 2-Opt Edge Exchange Mechanism
In each iteration, test reversing the subsegment between waypoint $i$ and $j$:
$$\text{Tour} = [v_1, \dots, v_{i-1}, \mathbf{v_i, \dots, v_j}, v_{j+1}, \dots, v_n]$$
$$\text{Tour}' = [v_1, \dots, v_{i-1}, \mathbf{v_j, \dots, v_i}, v_{j+1}, \dots, v_n]$$

The change in tour cost is:
$$\Delta = (D[v_{i-1}, v_j] + D[v_i, v_{j+1}]) - (D[v_{i-1}, v_i] + D[v_j, v_{j+1}])$$
If $\Delta < 0$, the reversal strictly improves the tour.

### 5.3 Complexity Analysis
- **Distance Matrix Precomputation**: $K \times \text{Dijkstra} = \mathcal{O}(K \cdot (|V| + |E|) \log |V|)$.
- **2-Opt Optimization**: $\mathcal{O}(K^2)$ per pass, converging in $\mathcal{O}(I \cdot K^2)$ steps where $I \le 500$.
- **Space Complexity**: $\mathcal{O}(K^2 + |V|)$ for the distance matrix and subpath cache.


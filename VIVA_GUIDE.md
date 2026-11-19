# MealMesh — Viva & Demo Guide

Read this once before the evaluation. Every answer below matches the actual code, with file names so you can open them if madam asks "show me".

---

## 1. The 30-second introduction

> "MealMesh connects hotels and caterers that have surplus food with NGOs that feed people. A donor posts a batch, a **min-heap** puts the most urgent batch first, a **greedy multi-criteria algorithm** picks the best NGO, and **Dijkstra's algorithm on a road graph** gives the volunteer the shortest route. We built nine data structures ourselves in Java (heap, graph, hash table, stack, queue, doubly linked list, trie, disjoint set union, greedy allocator), and each one is used in a real feature, not only in a demo."

---

## 2. How the frontend, backend and data structures are connected

```
 Browser (React + TypeScript)            Spring Boot backend (Java 21)                       Database
 ───────────────────────────            ─────────────────────────────                       ────────
 DonorDashboard.tsx                      DonationController.java   (REST endpoint)
   │  user clicks "Publish"                 │
   │  api.postDonation(data)                ▼
   │  fetch POST /api/donor/donations   DonationService.java        (business logic)
   │  header: Authorization: Bearer JWT     │   uses ─► MinHeap, DoublyLinkedList, Trie,
   ▼                                        │           CustomHashTable  (package com.mealmesh.dsa)
 JSON request  ───── HTTP ─────►            ▼
                                        DonationRepository (Spring Data JPA) ─────────►  H2 database
 JSON response ◄──── HTTP ──────            (saves / loads Donation rows)                  (file: data/mealmesh)
   │
   ▼
 React re-renders the list in the order the heap returned
```

**How to say it:**

1. **Frontend → backend:** React never touches the database. Every screen calls a function in `frontend/src/services/api.ts`, which sends an HTTP request (`fetch`) to a URL starting with `/api/...`. The data travels as **JSON**.
2. **Login and roles:** On login the backend returns a **JWT token**. The frontend stores it and sends it in the `Authorization` header. `SecurityConfig.java` only allows `/api/admin/**` for ADMIN, `/api/donor/**` for DONOR, `/api/ngo/**` for NGO and `/api/volunteer/**` for VOLUNTEER. Without a token you get 401; with the wrong role, 403.
3. **Backend layers:** *Controller* (receives the request) → *Service* (logic) → *Repository* (database). The **data structures are used inside the services**, between reading the rows and sending the answer.
4. **Data structures → database:** The database stores the records (donations, NGOs, deliveries). The data structures decide **order and choice**: which batch first (heap), which NGO (greedy), which route (graph + Dijkstra), which volunteer (nearest neighbour), how many zones (DSU), and so on.
5. **Running together:** For the demo, the React build is placed inside the Spring Boot jar, so **one program** serves both the website and the API at `http://localhost:8080`.

### Worked example to explain: "What happens when a donor posts food?"
1. `DonorDashboard.tsx` → `api.postDonation()` → `POST /api/donor/donations` with the JWT.
2. `DonationController.createDonation()` → `DonationService.createDonation()` saves the row (urgency CRITICAL if it expires within 2 hours).
3. The list is reloaded with `GET /api/donor/my-donations` → `DonationService.getDonationsByDonor()`:
   - every still-claimable batch is **inserted into the MinHeap** with key = *seconds to expiry × urgency weight* (CRITICAL 0.5, HIGH 0.75, MEDIUM 1.0, LOW 1.25);
   - `extractMin()` is called repeatedly, so the most urgent batch comes out first;
   - the result is appended to a **DoublyLinkedList** (urgent batches first, then history), which is converted to JSON.
4. React shows the cards in exactly that order.

### Second example: "What happens when an NGO clicks Claim?"
`NgoDashboard.tsx` → `POST /api/ngo/claim/{id}` → `NgoService.claimDonationForNgo()`:
- rejects the claim if the batch is already claimed or expired (no double claim);
- scores the NGO with the **GreedyAllocator** formula (0–100);
- picks the **nearest available volunteer** (greedy nearest-neighbour using the haversine distance);
- saves the allocation and delivery with the real distance (km) and time estimate.

---

## 3. Every data structure: where it is, where it is used, why

| # | Data structure | Our file (`backend/src/main/java/com/mealmesh/dsa/...`) | Used in the real app | Screen | Complexity | Why this structure |
|---|---|---|---|---|---|---|
| 1 | **Binary Min-Heap** | `heap/MinHeap.java` (array, starts at 32, doubles when full, `heapifyUp` / `heapifyDown`) | `DonationService` — orders available donations; also inside Dijkstra | Donor list, NGO "Available Surplus" list | insert / extract O(log n), peek O(1) | We always need "the most urgent batch next". Sorting the whole list every time is O(n log n); the heap gives the minimum in O(log n). |
| 2 | **Weighted Graph + Dijkstra** (also BFS, DFS) | `graph/Graph.java` (array of vertices + adjacency list of edge nodes) | `routing/RouteOptimizationService` — Bengaluru junctions are vertices, roads are weighted edges (km and minutes) | Volunteer "Dijkstra Shortest Path" tab, DSA Lab | O((V + E) log V) with our MinHeap | Shortest route with non-negative road weights is exactly what Dijkstra solves. |
| 3 | **Greedy Multi-Criteria Allocator** | `greedy/GreedyAllocator.java` (own QuickSort on scores) | `MatchingService` ("Run Greedy Match"), `NgoService` claim score | Donor "Run Greedy Match", NGO match score | O(n log n) (scoring O(n) + sort) | Fast and explainable. Score = 0.35·proximity (boosted by urgency, max 100) + 0.35·capacity + 0.15·diet + 0.15·freshness, always 0–100. |
| 4 | **Hash Table (separate chaining)** | `hashtable/CustomHashTable.java` (polynomial rolling hash p = 31, mod 1 000 000 007; rehash when load factor > 0.75) | `AnalyticsService` adds up kg per food category; `DonationService` maps trie keys back to dish names | Analytics pie chart, dish autocomplete | put / get O(1) average | Grouping by a key needs fast lookup. Collisions are handled by chaining (linked list per bucket). |
| 5 | **Stack (linked)** | `stack/CustomStack.java` | `AdminService` pushes every NGO verify/unverify; **Undo Last Action** pops and reverses it | Admin dashboard → Undo | push / pop O(1) | Undo must reverse the *most recent* action first: Last In, First Out. |
| 6 | **Queue (linked)** | `queue/CustomQueue.java` | `BatchSyncController` replays actions saved while offline, in the same order | Navbar "Offline mode" → Sync | enqueue / dequeue O(1) | Offline actions must be applied in the order they happened: First In, First Out. |
| 7 | **Doubly Linked List** | `linkedlist/DoublyLinkedList.java` | `DonationService` builds the donor timeline (heap output, then history) | Donor list | add at head/tail O(1) | O(1) append at the tail and traversal in both directions (forward and backward timeline). |
| 8 | **Trie (prefix tree)** | `trie/Trie.java`, `TrieNode.java` (128 children per node, ASCII) | `DonationService.suggestFoodNames()` → `GET /api/public/food-suggestions?prefix=` | Donor form: type "ve" → suggestions | search O(L), L = prefix length | Autocomplete only walks the letters typed, regardless of how many dish names exist. |
| 9 | **Disjoint Set Union** | `unionfind/DisjointSetUnion.java` (union by rank + path compression) | `AnalyticsService.countDeliveryZones()`: donor and NGO sites within 3 km are union-ed; number of sets = number of zones | Analytics → "Delivery Zones" | nearly O(1) per operation, O(α(n)) | Grouping "connected" places is exactly the union–find problem. |

**Extra algorithm engines** (in `dsa/`): `FairnessAllocator` (fair NGO allocation using vulnerability, days unserved, Gini index), `ForecastingEngine` (7-day surplus forecast with day-of-week factors), `ThermalExposureEngine` (food-safety score from temperature over time), `DisruptionReplanEngine` (re-routing when a road is blocked).

**Honest note if asked "are they 100% from scratch?":** The storage inside each structure is our own arrays and node classes. No `PriorityQueue`, `HashMap` or `LinkedList` is used inside them. We use `ArrayList` only to *return* results and to record the steps shown in the DSA Laboratory animations.

---

## 4. Questions madam is likely to ask — with answers

**Q1. Why a min-heap and not just sort the list?**
New donations keep arriving. With a heap each insert costs O(log n) and the most urgent item is always at the root. Re-sorting after every insert costs O(n log n).

**Q2. What is the heap key?**
`seconds remaining until expiry × urgency weight` (CRITICAL 0.5, HIGH 0.75, MEDIUM 1.0, LOW 1.25). Smaller key = more urgent = comes out first. See `DonationService.priorityKey()`.

**Q3. Explain heapifyUp and heapifyDown.**
Insert puts the item at the end of the array and swaps it with its parent `(i-1)/2` while it is smaller (heapifyUp). extractMin moves the last item to the root and swaps it with the smaller child `2i+1` / `2i+2` until the heap property holds (heapifyDown).

**Q4. Why Dijkstra and not BFS?**
Roads have different lengths and travel times (weighted edges). BFS finds the fewest edges, not the shortest distance. Dijkstra works because all our weights are non-negative.

**Q5. Can Dijkstra handle negative edges?**
No. With negative weights you would need Bellman–Ford. Distances and times can never be negative, so Dijkstra is correct here.

**Q6. Is the greedy allocator optimal?**
Not always. Greedy picks the best-scoring NGO first and does not reconsider. It is fast (O(n log n)) and easy to explain, which matters when food expires in hours. For a fairer split we also have the `FairnessAllocator`.

**Q7. How do you handle hash collisions?**
Separate chaining: each bucket holds a linked list of nodes. When size / capacity goes above 0.75 we double the table and rehash all keys.

**Q8. Why a stack for undo?**
The last admin action must be undone first (LIFO). Each verify/unverify is pushed as a token with the old and new value; pop reads it and restores the old value. (The stack is in memory, so it starts empty after a server restart.)

**Q9. What does the trie store and what is the cost?**
Each node has 128 child pointers (one per ASCII character). Searching a prefix walks L characters (O(L)), then collects the words below that node.

**Q10. What does DSU do in your project?**
Each donor/NGO location is a node. If two are within 3 km we `union` them. At the end, the number of disjoint sets is the number of delivery zones shown on the Analytics page. Union by rank and path compression make each operation almost constant time.

**Q11. Why a doubly linked list for the timeline?**
O(1) insertion at both ends, plus traversal forward (newest to oldest) and backward without reversing.

**Q12. How is distance calculated?**
Haversine formula (great-circle distance on the Earth's surface) between latitude/longitude points. The road route itself comes from Dijkstra on the road graph.

**Q13. How is the volunteer chosen?**
Greedy nearest neighbour: among available volunteers, the one with the smallest haversine distance to the pickup point.

**Q14. Can two NGOs claim the same food?**
No. The claim is rejected if the batch is not AVAILABLE or has expired. The second NGO gets "This batch has already been claimed".

**Q15. Can a donor open the admin pages?**
No. The page redirects to login, and the API returns 403 because the JWT role is checked in `SecurityConfig`.

**Q16. Which database? Where is the data?**
H2 (a Java SQL database) stored in the `data/` folder next to the program, accessed through Spring Data JPA (Hibernate). On first run, `DataInitializer` fills demo donors, NGOs, volunteers and one week of delivery history. A PostgreSQL profile also exists for production.

**Q17. How do you know it works?**
25 JUnit tests for the data structures (`backend/src/test/java/com/mealmesh/dsa/`), e.g. heap order, Dijkstra paths, hash table rehashing, DSU, trie, doubly linked list, greedy score ≤ 100. There are also 4 frontend tests (Vitest). Run with `mvnw test`.

**Q18. What happens if the backend is down?**
The frontend shows empty values, not fake numbers. The navbar has an offline mode that queues actions and replays them in order with the queue when back online.

**Q19. What is JWT?**
JSON Web Token: a signed string containing the user's email and role. The server signs it with a secret key, so it can trust it on every request without storing sessions.

**Q20. What would you improve next?**
Real GPS traffic data for edge weights, persisting the undo stack in the database, and push notifications for NGOs.

---

## 5. Five-minute demo order

1. **Landing page** (`http://localhost:8080`): live impact numbers, then scroll to "Nine Data Structures Power Every Screen".
2. **Sign In → "Log in as Food Donor"**: type "ve" in Dish Name (trie suggestions), post a batch with **Expiry 1 hour**, and show it jumps to the top of the list (min-heap). Post another with **10 hours**: it goes lower, not to the top.
3. **Sign Out → NGO**: the same batch is first in "Available Surplus". Click **Claim**: the match score is ≤ 100, and the real distance is shown. Claim again → refused.
4. **Sign Out → Volunteer**: the mission is there; open **Dijkstra Shortest Path** to show the route.
5. **Sign Out → Admin**: verify/unverify an NGO, then **Undo Last Action** (stack).
6. **Analytics**: weekly chart, category pie (hash table), **Delivery Zones** (DSU).
7. **DSA Laboratory**: play any visualizer step by step (e.g. Min-Heap or Dijkstra).

Demo accounts (password for all: `demo123`): `donor.koramangala@mealmesh.org`, `ngo.akshayapatra@mealmesh.org`, `volunteer.rahul@mealmesh.org`, `admin@mealmesh.org`.

---

## 6. What was fixed in this version (so you are not surprised)

- **Crash on a new computer fixed:** the backend failed to start on an empty database (seeding order). It now starts cleanly anywhere.
- Donor list now really uses the **min-heap** order (before, it was "newest first").
- **Match scores** capped to 0–100 (before, 102.9/100 was possible).
- NGO claim: **no double claims**, real distance/time, real greedy score, nearest volunteer (before: always 4.5 km, 14 min, score 95).
- Analytics: computed from real data; category percentages add up to 100 (before 120%); weekly chart from the database (before: fixed numbers).
- **Security:** role-protected APIs (before, every API was open), and typing `/admin` no longer logs you in.
- Hash table, queue, trie and DSU are now used in **real features** (before, only in the DSA Lab).
- All 5 food categories exist (Dairy/Packaged were silently saved as another category).
- Old project name in the browser tab, fake testimonials, and made-up fallback numbers removed.
- Phone layout fixed (navbar), pie chart labels fixed.
- One-click run: `run/START-MEALMESH.bat`. Public hosting: `Dockerfile` + `render.yaml`.
- Added unit tests: doubly linked list (3) and greedy score/ordering (2).

# MealMesh – Testing & Verification Guide

MealMesh includes exhaustive unit testing across backend custom Data Structures and Algorithms and frontend React modules.

---

## 1. Backend DSA Unit Test Suite

- **Location:** `backend/src/test/java/com/mealmesh/dsa/`
- **Framework:** JUnit 5 (Jupiter) with Assertions.
- **Execution Command:**
  ```powershell
  # Using system maven or maven wrapper:
  & "C:\Users\mdpul\.vscode\extensions\oracle.oracle-java-27.0.0\nbcode\java\maven\bin\mvn.cmd" -f backend/pom.xml test
  ```

### Verified Test Cases (16 Tests Passing):
1. **`MinHeapTest.java`**:
   - `testInsertAndExtractMinOrder`: Confirms min-heap priority invariant across multiple insertions and deletions.
   - `testUpdatePriority`: Validates dynamic priority updates with heapify-up / heapify-down.
   - `testStepRecording`: Verifies step event logging for frontend visualizations.
2. **`GraphDijkstraTest.java`**:
   - `testDijkstraShortestPath`: Verifies optimal route calculation, distance accumulation, and path reconstruction.
   - `testUnreachableNode`: Validates graceful handling of disconnected subgraphs.
   - `testBfsAndDfs`: Verifies queue-based BFS and recursive DFS step generation.
3. **`CustomHashTableTest.java`**:
   - `testPutAndGet`: Validates average $O(1)$ operations with custom polynomial rolling hash.
   - `testRehashWhenThresholdExceeded`: Validates automated capacity doubling and element re-indexing when load factor exceeds 0.75.
   - `testRemove`: Validates collision-chain pointer unlinking.
4. **`TrieTest.java`**:
   - `testSearch`: Validates exact word membership.
   - `testPrefixSearch`: Validates prefix subtree exploration across alphabet nodes.
5. **`DisjointSetUnionTest.java`**:
   - `testInitialComponents`: Validates initial $N$ singleton components.
   - `testUnionAndFindWithRank`: Validates path compression and union by rank across delivery zones.
6. **`GreedyAllocatorTest.java`**:
   - `testGreedyMultiCriteriaAllocation`: Validates multi-criteria scoring and quantity allocation under capacity bounds.
7. **`CustomStackQueueTest.java`**:
   - `testCustomQueueFifo`: Validates FIFO head/tail pointer manipulation.
   - `testCustomStackLifo`: Validates LIFO top pointer manipulation for administrative undos.

---

## 2. Frontend Vitest Suite

- **Location:** `frontend/src/tests/App.test.tsx`
- **Framework:** Vitest + React Testing Library.
- **Execution Command:**
  ```powershell
  npm.cmd --prefix frontend test
  ```

### Verified Test Cases (4 Tests Passing):
1. Validates core user roles (`DONOR`, `NGO`, `VOLUNTEER`, `ADMIN`).
2. Validates greedy heuristic weights summing to 1.0.
3. Verifies environmental CO2 ($2.5\times$) and economic INR savings ($120\times$) formulas.
4. Validates min-heap array index parent/child calculation invariants.

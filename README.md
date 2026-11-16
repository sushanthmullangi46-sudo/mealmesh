# MealMesh – Intelligent Food Rescue & Redistribution System

<div align="center">
  <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80" alt="MealMesh Banner" width="100%" style="border-radius: 16px; max-height: 380px; object-fit: cover;" />

  <br />

  <h1>Rescue Food. Redistribute Hope.</h1>
  <p><strong>A production-grade, full-stack platform powered by genuine Data Structures & Algorithms to eliminate urban food waste and combat hunger.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Java-21%2B%20%7C%2025-blue?logo=openjdk" alt="Java" />
    <img src="https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen?logo=springboot" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/React-18.3-blue?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/TailwindCSS-3.4-teal?logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Tests-100%25%20Passing-success" alt="Tests" />
  </p>
</div>

---

## 🌟 Overview & Mission

Large quantities of wholesome, edible surplus food from commercial kitchens, hotels, and caterers are discarded daily, while millions of individuals struggle with food insecurity. 

**MealMesh** resolves this critical logistical challenge through an intelligent, algorithm-driven redistribution network:
1. **Min-Heap Expiry Priority:** Newly posted food batches are prioritized automatically in $O(\log N)$ time, ensuring the most urgently expiring items are rescued first.
2. **Greedy Multi-Criteria Matching:** Allocates food portions to nearby verified NGOs by evaluating real-time distance, remaining storage capacity, dietary preferences, and expiry urgency.
3. **Dijkstra Road Optimization:** Computes fastest and shortest delivery paths across the urban road network for volunteer transport fleets.
4. **Reversible Operation Stack:** Enables dispatchers and administrators to safely roll back allocations and verification decisions.
5. **Interactive DSA Laboratory:** A 10-visualizer sandbox enabling live inspection, step-by-step playback, and debugging of all custom data structures.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, Leaflet / OpenStreetMap |
| **Backend** | Java 21+ (Running JDK 25), Spring Boot 3.3.5, Spring Security, Spring Data JPA, Hibernate ORM, Flyway Migrations |
| **Database** | PostgreSQL 16 (Production) & Persistent H2 file mode (`./data/mealmesh.mv.db`, Development) |
| **DSA Engine** | 9 Custom Data Structures & Algorithms implemented completely from scratch (`com.mealmesh.dsa.*`) |
| **Testing** | JUnit 5, Mockito, Vitest, React Testing Library (100% Passing) |
| **Containerization** | Docker, Docker Compose (Multi-stage builds) |

---

## 🧩 Core DSA Engine (Implemented From Scratch)

Standard Java collections (`PriorityQueue`, `HashMap`, `Stack`, `LinkedList`) were **strictly avoided** for the core algorithmic representations:

1. **Binary Min-Heap (`com.mealmesh.dsa.heap.MinHeap`)**: 0-indexed resizable array representation for time-to-expiry prioritization with dynamic `heapifyUp` and `heapifyDown`.
2. **Adjacency-List Graph (`com.mealmesh.dsa.graph.Graph`)**: Weighted directed/undirected graph with $O((V + E) \log V)$ **Dijkstra Shortest Path**, BFS, DFS, and Nearest-Neighbor TSP heuristic.
3. **Separate-Chaining Hash Table (`com.mealmesh.dsa.hashtable.CustomHashTable`)**: Polynomial rolling hash function with automatic capacity doubling when load factor exceeds 0.75.
4. **Multi-Criteria Greedy Allocator (`com.mealmesh.dsa.greedy.GreedyAllocator`)**: Composite scoring function balancing proximity, capacity, dietary alignment, and urgency with in-place QuickSort partitioning.
5. **Disjoint Set Union (`com.mealmesh.dsa.unionfind.DisjointSetUnion`)**: Delivery zone clustering with path compression and union by rank in $O(\alpha(N))$ time.
6. **Prefix Tree (`com.mealmesh.dsa.trie.Trie`)**: 128-child pointer array per node for sub-millisecond search and autocompletion.
7. **Singly-Linked FIFO Queue (`com.mealmesh.dsa.queue.CustomQueue`)**: Fair first-come-first-served request management.
8. **Singly-Linked LIFO Stack (`com.mealmesh.dsa.stack.CustomStack`)**: Administrative reversible action stack.
9. **Doubly Linked List (`com.mealmesh.dsa.linkedlist.DoublyLinkedList`)**: Bidirectional donation timeline navigation.

---

## 🚀 Quick Start Guide

### Prerequisites
- Java 21 or later (`java -version`)
- Node.js 18+ and npm (`node -v`, `npm -v`)
- Maven (included or system)

### 1. Start the Spring Boot Backend
```powershell
# In a terminal window:
cd backend
& "C:\Users\mdpul\.vscode\extensions\oracle.oracle-java-27.0.0\nbcode\java\maven\bin\mvn.cmd" spring-boot:run
```
*Backend runs on `http://localhost:8080` with persistent local H2 database and auto-seeded Bengaluru data.*

### 2. Start the React Frontend
```powershell
# In a second terminal window:
cd frontend
npm.cmd run dev
```
*Frontend runs on `http://localhost:3000` (or `http://localhost:5173`).*

---

## 👥 Demo Accounts (1-Click Instant Login)

The frontend includes 1-click demo switcher buttons in the navigation bar:

| Role | Demo Email | Password | Pre-seeded Context |
|---|---|---|---|
| **Donor** | `donor.koramangala@mealmesh.org` | `demo123` | ITC Gardenia Kitchen (Koramangala 4th Block) |
| **NGO** | `ngo.akshayapatra@mealmesh.org` | `demo123` | Akshaya Patra Foundation (HSR Layout Hub) |
| **Volunteer** | `volunteer.rahul@mealmesh.org` | `demo123` | Two-Wheeler Transporter (Rahul Sharma) |
| **Admin** | `admin@mealmesh.org` | `demo123` | Central MealMesh Administrator |

---

## 🧪 Verification & Test Suites

```powershell
# Run backend DSA unit tests (16 tests):
& "C:\Users\mdpul\.vscode\extensions\oracle.oracle-java-27.0.0\nbcode\java\maven\bin\mvn.cmd" -f backend/pom.xml test

# Run frontend test suite (4 tests):
npm.cmd --prefix frontend test
```

---

## 📁 Repository Structure

```
├── backend/                  # Java 21+ Spring Boot 3.3.5 Backend
│   ├── src/main/java/com/mealmesh/
│   │   ├── dsa/              # Custom Data Structures & Algorithms
│   │   │   ├── graph/        # Vertex, Edge, Graph, DijkstraResult, GraphStep
│   │   │   ├── heap/         # MinHeap, HeapItem, HeapStep
│   │   │   ├── hashtable/    # CustomHashTable, HashNode, HashStep
│   │   │   ├── greedy/       # GreedyAllocator, NgoCandidate, DonationBatch
│   │   │   ├── unionfind/    # DisjointSetUnion, DsuStep
│   │   │   ├── trie/         # Trie, TrieNode, TrieStep
│   │   │   ├── queue/        # CustomQueue, QueueNode, QueueStep
│   │   │   ├── stack/        # CustomStack, StackNode, StackStep
│   │   │   └── linkedlist/   # DoublyLinkedList, DoublyNode, LinkedListStep
│   │   ├── entity/           # JPA Entities (User, Donation, Allocation, Delivery)
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   ├── service/          # Business services (Donation, Matching, Routing)
│   │   ├── controller/       # REST API endpoints
│   │   └── security/         # JWT Token Provider, Filter & SecurityConfig
│   └── src/main/resources/
│       ├── application.yml   # Multi-profile H2/PostgreSQL configuration
│       └── db/migration/     # V1 Schema & V2 Bengaluru Demo Seed Data
├── frontend/                 # React 18 + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── pages/            # LandingPage, Donor, NGO, Volunteer, Admin, DSA Lab, Analytics
│   │   ├── maps/             # Leaflet MealMeshMap with route polylines
│   │   ├── components/       # Navbar, Footer
│   │   ├── services/         # Typed API Client
│   │   └── types/            # TypeScript interfaces
├── docs/                     # Comprehensive Architectural Documentation
│   ├── ARCHITECTURE.md
│   ├── DSA_DOCUMENTATION.md
│   ├── DATABASE_DESIGN.md
│   ├── API_DOCUMENTATION.md
│   └── TESTING.md
├── archive/route-optimization/# Preserved previous project files
└── docker-compose.yml        # PostgreSQL 16 & Multi-service containerization
```

---

## 📜 Compliance & Impact Standards

- **FSSAI Food Safety Standards:** Hygiene ratings and storage temperature requirements tracked per donation batch.
- **UN SDG Goal #2:** Direct contribution to Zero Hunger and Sustainable Consumption.
- **Environmental Index:** Rescuing 1 kg of food avoids approximately 2.5 kg of CO2 equivalent emissions.
- **Indian Financial Metric:** Rescued economic value evaluated in Indian Rupees (`INR ₹`).

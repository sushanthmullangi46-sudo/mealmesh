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
6. **IoT Food Safety Monitoring:** ESP32 telemetry ingestion for DHT22 temperature/humidity and MQ-series gas readings, configurable threshold alerts, and an admin sensor monitor.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, Leaflet / OpenStreetMap |
| **Backend** | Java 21+ (Running JDK 25), Spring Boot 3.3.5, Spring Security, Spring Data JPA, Hibernate ORM, Flyway Migrations |
| **Database** | PostgreSQL 16 (Production) & Persistent H2 file mode (`./data/mealmesh.mv.db`, Development) |
| **DSA Engine** | 9 custom data structures built on our own arrays and nodes (`com.mealmesh.dsa.*`) |
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

### Option A — One click (for evaluation, needs only Java 21+)
1. Open the `run` folder.
2. Double-click **`START-MEALMESH.bat`** (macOS/Linux: `./start-mealmesh.sh`).
3. The browser opens **http://localhost:8080** after about 20 seconds. Keep the black window open while using the app.

`run/MealMesh.jar` contains both the Spring Boot backend and the built React frontend. On the first start it creates `run/data/` with a fresh demo database (donors, NGOs, volunteers and one week of delivery history).

### Option B — Developer mode (live reload)
```bash
# Terminal 1: backend on http://localhost:8080 (Maven is downloaded by the wrapper)
cd backend
mvnw.cmd spring-boot:run        # macOS/Linux: ./mvnw spring-boot:run

# Terminal 2: frontend on http://localhost:3000 (calls are proxied to :8080)
cd frontend
npm install
npm run dev
```

### Rebuilding `run/MealMesh.jar` after changes
```bash
cd frontend && npm run build
# copy frontend/dist/* into backend/src/main/resources/static/
cd ../backend && mvnw.cmd clean package
copy target\mealmesh-backend-1.0.0.jar ..\run\MealMesh.jar
```

### Option C — Public link (free hosting on Render)
1. Push this folder to a GitHub repository.
2. On https://render.com: **New + → Blueprint**, pick the repository. `render.yaml` and the root `Dockerfile` build everything automatically.
3. Render gives a public URL like `https://mealmesh-xxxx.onrender.com`. (Free instances sleep when idle; the first visit can take about a minute, and the demo database resets on each restart.)

With Docker installed locally: `docker compose up --build` → http://localhost:8080.

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

```bash
# Backend: 25 JUnit tests for the data structures
cd backend && mvnw.cmd test

# Frontend: 4 Vitest tests + TypeScript type-check
cd frontend && npm test && npx tsc --noEmit
```

See **`VIVA_GUIDE.md`** for how the frontend, backend and data structures connect, a table of where each structure is used, and likely viva questions with answers.

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

## IoT Food Safety Setup

See [docs/IOT_FOOD_SAFETY.md](docs/IOT_FOOD_SAFETY.md) for ESP32 wiring, telemetry API details, threshold configuration, and sensor calibration notes. The example firmware is in `firmware/mealmesh_food_safety/`.

## 📜 Compliance & Impact Standards

- **FSSAI Food Safety Standards:** Hygiene ratings and storage temperature requirements tracked per donation batch.
- **UN SDG Goal #2:** Direct contribution to Zero Hunger and Sustainable Consumption.
- **Environmental Index:** Rescuing 1 kg of food avoids approximately 2.5 kg of CO2 equivalent emissions.
- **Indian Financial Metric:** Rescued economic value evaluated in Indian Rupees (`INR ₹`).

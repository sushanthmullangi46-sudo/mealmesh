# MealMesh – System Architecture

MealMesh is architected as an intelligent, modular SaaS platform combining a reactive React/TypeScript frontend, a high-throughput Java 21+ Spring Boot backend, a transactional relational database (PostgreSQL / H2), and a custom Data Structures & Algorithms (DSA) computation engine.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 18 + TypeScript                           │
│  Landing Page │ Donor Hub │ NGO Hub │ Volunteer Fleet │ DSA Laboratory │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ REST / JSON (JWT Authenticated)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Spring Boot 3.3.5 Application                       │
│ ┌──────────────────────────┐     ┌───────────────────────────────────┐ │
│ │ Controllers & Security   │     │ Services & Business Logic         │ │
│ │ (BCrypt, JWT Filter)     │────▶│ (Matching, Routing, Analytics)    │ │
│ └──────────────────────────┘     └─────────────────┬─────────────────┘ │
│                                                    │                   │
│                                                    ▼                   │
│                                  ┌───────────────────────────────────┐ │
│                                  │ Custom DSA Engine                 │ │
│                                  │ (com.mealmesh.dsa.*)              │ │
│                                  │ • Min-Heap (Expiry Priority)      │ │
│                                  │ • Dijkstra Shortest Path          │ │
│                                  │ • Greedy Heuristic Allocator      │ │
│                                  │ • Separate-Chaining Hash Table    │ │
│                                  │ • Disjoint Set Union (Clusters)   │ │
│                                  │ • Trie Autocomplete Engine        │ │
│                                  │ • Reversible Stack & FIFO Queue   │ │
│                                  └─────────────────┬─────────────────┘ │
│                                                    │                   │
│                                                    ▼                   │
│                                  ┌───────────────────────────────────┐ │
│                                  │ Spring Data JPA Repositories      │ │
│                                  └─────────────────┬─────────────────┘ │
└────────────────────────────────────────────────────┼───────────────────┘
                                                     │
                                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 PostgreSQL 16 / H2 Persistent Database                 │
│  Users │ Profiles │ Donations │ Allocations │ Deliveries │ Audit Logs  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Component Layers

### 1. Presentation Layer (Frontend)
- **Framework:** React 18 with TypeScript and Vite.
- **Styling & Theming:** Tailwind CSS utilizing an eco-conscious palette:
  - Deep Forest Green (`#064e3b`, `#047857`)
  - Emerald Accent (`#10b981`)
  - Warm Off-White Canvas (`#fcfbf9`)
  - Urgent Alert Orange (`#ea580c`)
- **Interactive Mapping:** Leaflet with OpenStreetMap tiles displaying Bengaluru waypoints, donor kitchens, distribution shelters, and computed Dijkstra polylines.
- **Analytics:** Recharts rendering dynamic area charts and distribution breakdown pies.
- **State Management:** Stateless API tokens stored in `localStorage` with reactive React state.

### 2. Security Layer
- **Stateless Authentication:** JSON Web Tokens (JWT) signed via HS256 with 24-hour expiration.
- **Password Hashing:** BCrypt with standard 10 salt rounds.
- **Role-Based Authorization:** Strict path segmentation for `DONOR`, `NGO`, `VOLUNTEER`, and `ADMIN`.

### 3. Core Engine Layer (Custom DSA)
- Implemented from scratch under `com.mealmesh.dsa.*` without standard collection wrappers.
- Emits fine-grained event traces (`GraphStep`, `HeapStep`, `HashStep`, `GreedyStep`, etc.) allowing the interactive DSA Laboratory to step forward and backward through algorithm executions.

### 4. Persistence Layer
- **Schema Management:** Flyway database migrations (`V1__init_mealmesh_schema.sql` and `V2__seed_demo_data.sql`).
- **ORM:** Hibernate with Spring Data JPA.
- **Dual Profiles:**
  - `dev` profile: Persistent H2 file database (`./data/mealmesh.mv.db`) with PostgreSQL syntax compatibility mode for instant local execution without pre-installed databases.
  - `prod` profile: Enterprise PostgreSQL 16 containerized via Docker Compose.

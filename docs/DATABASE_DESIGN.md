# MealMesh – Database Schema & Architecture

The MealMesh database is designed according to Third Normal Form (3NF) principles with strict foreign key integrity, appropriate performance indexes, and database migrations managed via Flyway.

---

## 1. Entity Relationship Overview

```
 [Users] (1) ─────────── (1) [Donor Profiles]
    │  (1)
    ├──────── (1) [NGO Profiles]
    │  (1)
    └──────── (1) [Volunteer Profiles]
    │
    └──────── (N) [Locations]

 [Donor Profiles] (1) ─── (N) [Donations] (1) ─── (N) [Allocations] (1) ─── (N) [Deliveries]
                                  │                       │                      │
                                  ▼                       ▼                      ▼
                            [Categories]            [NGO Profiles]        [Volunteer Profiles]
```

---

## 2. Table Specifications

### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Authentication username |
| `password_hash` | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| `full_name` | VARCHAR(255) | NOT NULL | User's legal name |
| `phone` | VARCHAR(50) | NULL | Contact phone number |
| `role` | VARCHAR(50) | NOT NULL | `DONOR`, `NGO`, `VOLUNTEER`, `ADMIN` |
| `is_verified` | BOOLEAN | DEFAULT TRUE | Account verification status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |

### `locations`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique location identifier |
| `user_id` | UUID | FK -> `users(id)` | Associated entity |
| `name` | VARCHAR(255) | NOT NULL | Location label (e.g., Central Kitchen) |
| `address_line` | VARCHAR(255) | NOT NULL | Street address |
| `city` | VARCHAR(100) | DEFAULT 'Bengaluru' | Operating city |
| `latitude` | DOUBLE | NOT NULL | WGS84 Latitude coordinate |
| `longitude` | DOUBLE | NOT NULL | WGS84 Longitude coordinate |

### `donations`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique donation batch identifier |
| `donor_id` | UUID | FK -> `donor_profiles(id)` | Registered donor kitchen |
| `category_id` | UUID | FK -> `food_categories(id)` | Category (Cooked Meals, Bakery, etc.) |
| `title` | VARCHAR(255) | NOT NULL | Dish title |
| `quantity_kg` | DOUBLE | NOT NULL | Total mass in kilograms |
| `servings` | INT | NOT NULL | Estimated nutritional servings |
| `cooked_time` | TIMESTAMP | NULL | Time prepared |
| `expiry_time` | TIMESTAMP | NOT NULL | Expiration deadline |
| `urgency` | VARCHAR(50) | NOT NULL | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `status` | VARCHAR(50) | NOT NULL | `AVAILABLE`, `RESERVED`, `IN_TRANSIT`, `DELIVERED` |

### `allocations`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique allocation identifier |
| `donation_id` | UUID | FK -> `donations(id)` | Matched donation |
| `ngo_id` | UUID | FK -> `ngo_profiles(id)` | Receiving NGO |
| `allocated_quantity_kg` | DOUBLE | NOT NULL | Quantity assigned |
| `match_score` | DOUBLE | NOT NULL | Computed greedy utility score (0-100) |
| `status` | VARCHAR(50) | NOT NULL | `PROPOSED`, `ACCEPTED`, `COMPLETED` |

### `deliveries`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique delivery mission identifier |
| `allocation_id` | UUID | FK -> `allocations(id)` | Target allocation |
| `volunteer_id` | UUID | FK -> `volunteer_profiles(id)` | Transporting volunteer |
| `status` | VARCHAR(50) | NOT NULL | `ASSIGNED`, `ACCEPTED`, `PICKED_UP`, `DELIVERED` |
| `estimated_distance_km` | DOUBLE | NULL | Dijkstra shortest distance |
| `estimated_time_minutes` | DOUBLE | NULL | Traffic adjusted duration |

---

## 3. Database Indexes

- `idx_users_email` ON `users(email)`
- `idx_donations_status_expiry` ON `donations(status, expiry_time)`
- `idx_locations_coords` ON `locations(latitude, longitude)`
- `idx_allocations_donation` ON `allocations(donation_id)`
- `idx_deliveries_volunteer` ON `deliveries(volunteer_id)`

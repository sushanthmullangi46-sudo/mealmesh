# MealMesh – REST API Documentation

Base URL: `http://localhost:8080/api`

All protected endpoints require the Bearer JWT token header:
`Authorization: Bearer <token>`

---

## 1. Authentication Endpoints

### Login
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "donor.koramangala@mealmesh.org",
    "password": "demo123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiJ9...",
      "email": "donor.koramangala@mealmesh.org",
      "role": "DONOR",
      "fullName": "Chef Suresh Kumar",
      "userId": "11111111-1111-1111-1111-111111111101"
    }
  }
  ```

### Demo Login (1-Click Instant Token)
- **Endpoint:** `GET /api/auth/demo/{role}`
- **Path Parameter:** `role` = `DONOR`, `NGO`, `VOLUNTEER`, `ADMIN`

---

## 2. Food Donation Endpoints

### Post Surplus Food
- **Endpoint:** `POST /api/donor/donations`
- **Request Body:**
  ```json
  {
    "title": "Fresh Veg Pulao and Paneer Masala",
    "categoryName": "Cooked Meals",
    "foodType": "COOKED",
    "dietaryType": "VEG",
    "quantityKg": 35.0,
    "servings": 90,
    "hoursUntilExpiry": 4,
    "storageTemperatureCelsius": 65.0,
    "allergenInfo": "Contains Dairy",
    "pickupInstructions": "Rear kitchen dispatch counter",
    "addressLine": "80 Feet Rd, Koramangala 4th Block, Bengaluru"
  }
  ```

### Get Priority-Sorted Active Donations
- **Endpoint:** `GET /api/public/donations/active`
- **Description:** Returns donations ordered dynamically by the custom `MinHeap` based on hours remaining until expiry.

---

## 3. IoT Food Safety Monitoring

### Submit ESP32 Sensor Telemetry
- **Endpoint:** `POST /api/iot/telemetry`
- **Device Authentication:** `X-Device-Key: <MEALMESH_IOT_DEVICE_API_KEY>`
- **Request Body:**
  ```json
  {
    "sensorId": "esp32-kitchen-01",
    "donationId": "<donation UUID>",
    "temperatureCelsius": 4.2,
    "humidityPercent": 62.0,
    "gasPpm": 120.0
  }
  ```
- **Description:** Stores DHT22 temperature/humidity and MQ-series gas readings. Readings that exceed configured thresholds create notifications for the donor and administrators.
- **Threshold configuration:** `MEALMESH_IOT_TEMPERATURE_MAX_CELSIUS`, `MEALMESH_IOT_HUMIDITY_MAX_PERCENT`, and `MEALMESH_IOT_GAS_MAX_PPM`.

### Read Recent Sensor Telemetry (Admin)
- **Endpoint:** `GET /api/admin/food-safety/readings`
- **Description:** Returns the latest 100 readings for the admin sensor monitor.
- **Setup guide:** [IoT Food Safety Monitoring](IOT_FOOD_SAFETY.md). Thresholds are demo defaults and require calibration; MQ readings are environmental indicators, not food-safety certification.

---

## 4. Greedy Matching & Allocation Endpoints

### Run Greedy Match
- **Endpoint:** `POST /api/matching/match-donation/{donationId}`
- **Description:** Evaluates candidate NGOs using multi-criteria weighted scoring (proximity, storage capacity, dietary match, expiry urgency) and assigns quantities greedily.

---

## 5. Route Optimization Endpoints

### Compute Dijkstra Shortest Path
- **Endpoint:** `POST /api/routing/shortest-path`
- **Request Body:**
  ```json
  {
    "originId": "V_KORAMANGALA",
    "destinationId": "V_JAYANAGAR",
    "optimizationObjective": "distance"
  }
  ```

### Multi-Stop Delivery Tour
- **Endpoint:** `POST /api/routing/multi-stop`
- **Request Body:**
  ```json
  {
    "waypointIds": ["V_KORAMANGALA", "V_HSR", "V_ELECTRONIC_CITY"],
    "optimizationObjective": "time"
  }
  ```

---

## 6. Interactive DSA Laboratory Endpoint

### Execute Algorithm Step
- **Endpoint:** `POST /api/dsa-lab/execute`
- **Request Body:**
  ```json
  {
    "structure": "HEAP",
    "operation": "INSERT",
    "value": "Buffet Surplus (3h)",
    "priority": 3.0
  }
  ```
- **Supported Structures:** `GRAPH`, `HEAP`, `HASHTABLE`, `QUEUE`, `STACK`, `LINKEDLIST`, `TRIE`, `GREEDY`, `DSU`.

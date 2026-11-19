# MealMesh IoT Food Safety Monitoring

MealMesh accepts telemetry from an ESP32 device with a DHT22 temperature/humidity sensor and an MQ-series gas sensor. Each reading is linked to a donation batch, stored in `sensor_readings`, evaluated against configurable thresholds, and displayed in the Admin Dashboard under **Food Safety IoT**. A newly breached threshold creates an in-app notification for the donor and administrators; repeat readings for the same ongoing breach do not create duplicate notifications.

## Telemetry endpoint

`POST /api/iot/telemetry`

Headers:

```text
Content-Type: application/json
X-Device-Key: <MEALMESH_IOT_DEVICE_API_KEY>
```

Body:

```json
{
  "sensorId": "esp32-kitchen-01",
  "donationId": "<donation UUID>",
  "temperatureCelsius": 4.2,
  "humidityPercent": 62.0,
  "gasPpm": 120.0,
  "recordedAt": "2026-11-17T10:30:00"
}
```

`recordedAt` is optional; the server timestamp is used when omitted. The API validates plausible value ranges and returns the stored reading plus alert status.

## Threshold configuration

Set the device key on the backend as `MEALMESH_IOT_DEVICE_API_KEY`. The local development fallback is `mealmesh-dev-device-key`; replace it before exposing the service. Threshold defaults are configurable through:

- `MEALMESH_IOT_TEMPERATURE_MAX_CELSIUS` (default `8.0`)
- `MEALMESH_IOT_HUMIDITY_MAX_PERCENT` (default `75.0`)
- `MEALMESH_IOT_GAS_MAX_PPM` (default `300.0`)

The defaults are demo values, not universal food-safety limits. Configure limits for the food type, packaging, sensor placement, and applicable local rules. MQ-series sensors need calibration; their output should be treated as an environmental indicator, not proof that food is safe or spoiled.

Admin endpoints:

- `GET /api/admin/food-safety/readings` — latest 100 readings.
- `GET /api/admin/food-safety/donations/{donationId}` — latest 50 readings for one donation.

## ESP32 wiring and firmware

Example wiring for an ESP32 DevKit: DHT22 data to GPIO 4 (with a pull-up if the module does not include one), MQ analog output to an ADC-capable GPIO such as 34, and common ground. Power sensors according to their module specifications; many MQ boards use 5 V and their analog output can exceed ESP32 ADC input limits, so use a suitable voltage divider/level interface.

The firmware sketch is in `firmware/mealmesh_food_safety/mealmesh_food_safety.ino`. Configure Wi-Fi, the API base URL, device key, and donation UUID before flashing. Calibrate the MQ sensor and implement the sensor-specific conversion to ppm before relying on gas thresholds. For a production device, use TLS and provision a unique revocable key per device.

The admin API follows the existing application authorization conventions. Configure network access and authentication at the deployment boundary before exposing administrative data outside a trusted environment.

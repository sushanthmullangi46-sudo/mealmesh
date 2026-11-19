#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// Configure these values locally before flashing. Do not commit real credentials.
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_URL = "http://YOUR_MEALMESH_HOST:8080/api/iot/telemetry";
const char* DEVICE_KEY = "YOUR_MEALMESH_IOT_DEVICE_API_KEY";
const char* SENSOR_ID = "esp32-kitchen-01";
const char* DONATION_ID = "YOUR_DONATION_UUID";

#define DHT_PIN 4
#define DHT_TYPE DHT22
#define MQ_ANALOG_PIN 34
DHT dht(DHT_PIN, DHT_TYPE);

// Replace this sample conversion with a calibrated, sensor-specific MQ curve.
// It maps ADC fraction to an indicative scale and is NOT a validated ppm estimate.
float readGasPpmEstimate() {
  int raw = analogRead(MQ_ANALOG_PIN);
  return (raw / 4095.0f) * 1000.0f;
}

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) delay(500);
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  analogReadResolution(12);
  connectWifi();
}

void loop() {
  connectWifi();
  float temperatureC = dht.readTemperature();
  float humidity = dht.readHumidity();
  float gasEstimate = readGasPpmEstimate();

  if (WiFi.status() == WL_CONNECTED && !isnan(temperatureC) && !isnan(humidity)) {
    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Key", DEVICE_KEY);

    StaticJsonDocument<384> body;
    body["sensorId"] = SENSOR_ID;
    body["donationId"] = DONATION_ID;
    body["temperatureCelsius"] = temperatureC;
    body["humidityPercent"] = humidity;
    body["gasPpm"] = gasEstimate;
    String json;
    serializeJson(body, json);

    int responseCode = http.POST(json);
    Serial.printf("Telemetry POST status: %d\n", responseCode);
    http.end();
  } else {
    Serial.println("Sensor read or Wi-Fi unavailable; telemetry not sent.");
  }

  delay(60000); // Sample once per minute.
}

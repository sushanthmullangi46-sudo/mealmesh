CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY,
    donation_id UUID NOT NULL REFERENCES donations(id),
    sensor_id VARCHAR(120) NOT NULL,
    temperature_celsius DOUBLE PRECISION NOT NULL,
    humidity_percent DOUBLE PRECISION NOT NULL,
    gas_ppm DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMP NOT NULL,
    alert BOOLEAN NOT NULL DEFAULT FALSE,
    alert_message VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_donation_time
    ON sensor_readings(donation_id, recorded_at);

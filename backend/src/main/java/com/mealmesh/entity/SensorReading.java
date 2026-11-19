package com.mealmesh.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sensor_readings", indexes = {
        @Index(name = "idx_sensor_readings_donation_time", columnList = "donation_id, recorded_at")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SensorReading {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "donation_id", nullable = false)
    private Donation donation;

    @Column(name = "sensor_id", nullable = false, length = 120)
    private String sensorId;

    @Column(name = "temperature_celsius", nullable = false)
    private double temperatureCelsius;

    @Column(name = "humidity_percent", nullable = false)
    private double humidityPercent;

    @Column(name = "gas_ppm", nullable = false)
    private double gasPpm;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt = LocalDateTime.now();

    @Column(nullable = false)
    private boolean alert;

    @Column(name = "alert_message", length = 500)
    private String alertMessage;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Donation getDonation() { return donation; }
    public void setDonation(Donation donation) { this.donation = donation; }
    public String getSensorId() { return sensorId; }
    public void setSensorId(String sensorId) { this.sensorId = sensorId; }
    public double getTemperatureCelsius() { return temperatureCelsius; }
    public void setTemperatureCelsius(double value) { this.temperatureCelsius = value; }
    public double getHumidityPercent() { return humidityPercent; }
    public void setHumidityPercent(double value) { this.humidityPercent = value; }
    public double getGasPpm() { return gasPpm; }
    public void setGasPpm(double value) { this.gasPpm = value; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime value) { this.recordedAt = value; }
    public boolean isAlert() { return alert; }
    public void setAlert(boolean alert) { this.alert = alert; }
    public String getAlertMessage() { return alertMessage; }
    public void setAlertMessage(String value) { this.alertMessage = value; }
}

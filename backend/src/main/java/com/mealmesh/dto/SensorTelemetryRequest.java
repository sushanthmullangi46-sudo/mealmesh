package com.mealmesh.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class SensorTelemetryRequest {
    @NotBlank @Size(max = 120)
    private String sensorId;
    @NotNull
    private java.util.UUID donationId;
    @NotNull @DecimalMin("-40.0") @DecimalMax("100.0")
    private Double temperatureCelsius;
    @NotNull @DecimalMin("0.0") @DecimalMax("100.0")
    private Double humidityPercent;
    @NotNull @DecimalMin("0.0") @DecimalMax("100000.0")
    private Double gasPpm;
    private LocalDateTime recordedAt;

    public String getSensorId() { return sensorId; }
    public void setSensorId(String sensorId) { this.sensorId = sensorId; }
    public java.util.UUID getDonationId() { return donationId; }
    public void setDonationId(java.util.UUID donationId) { this.donationId = donationId; }
    public Double getTemperatureCelsius() { return temperatureCelsius; }
    public void setTemperatureCelsius(Double value) { this.temperatureCelsius = value; }
    public Double getHumidityPercent() { return humidityPercent; }
    public void setHumidityPercent(Double value) { this.humidityPercent = value; }
    public Double getGasPpm() { return gasPpm; }
    public void setGasPpm(Double value) { this.gasPpm = value; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime value) { this.recordedAt = value; }
}

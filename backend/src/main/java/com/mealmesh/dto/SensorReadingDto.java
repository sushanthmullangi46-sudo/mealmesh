package com.mealmesh.dto;

import com.mealmesh.entity.SensorReading;
import java.time.LocalDateTime;
import java.util.UUID;

public record SensorReadingDto(UUID id, UUID donationId, String donationTitle, String sensorId,
                               double temperatureCelsius, double humidityPercent, double gasPpm,
                               LocalDateTime recordedAt, boolean alert, String alertMessage) {
    public static SensorReadingDto from(SensorReading reading) {
        return new SensorReadingDto(reading.getId(), reading.getDonation().getId(),
                reading.getDonation().getTitle(), reading.getSensorId(), reading.getTemperatureCelsius(),
                reading.getHumidityPercent(), reading.getGasPpm(), reading.getRecordedAt(),
                reading.isAlert(), reading.getAlertMessage());
    }
}

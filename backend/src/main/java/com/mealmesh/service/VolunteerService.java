package com.mealmesh.service;

import com.mealmesh.dto.DeliveryResponseDto;
import com.mealmesh.dto.VolunteerProfileResponseDto;
import com.mealmesh.entity.Delivery;
import com.mealmesh.entity.VolunteerProfile;
import com.mealmesh.repository.DeliveryRepository;
import com.mealmesh.repository.VolunteerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class VolunteerService {

    private final DeliveryRepository deliveryRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;

    public VolunteerService(DeliveryRepository deliveryRepository,
                            VolunteerProfileRepository volunteerProfileRepository) {
        this.deliveryRepository = deliveryRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
    }

    public List<DeliveryResponseDto> getVolunteerDeliveries(String userEmail) {
        List<Delivery> list = deliveryRepository.findByVolunteerUserEmail(userEmail);
        if (list.isEmpty()) {
            list = deliveryRepository.findAll();
        }
        return list.stream().map(DeliveryResponseDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public DeliveryResponseDto updateDeliveryStatus(UUID deliveryId, String newStatus) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found: " + deliveryId));

        delivery.setStatus(newStatus.toUpperCase());
        if ("PICKED_UP".equalsIgnoreCase(newStatus)) {
            delivery.setPickupTime(LocalDateTime.now());
            if (delivery.getAllocation() != null && delivery.getAllocation().getDonation() != null) {
                delivery.getAllocation().getDonation().setStatus("IN_TRANSIT");
            }
        } else if ("DELIVERED".equalsIgnoreCase(newStatus)) {
            delivery.setCompletionTime(LocalDateTime.now());
            if (delivery.getAllocation() != null && delivery.getAllocation().getDonation() != null) {
                delivery.getAllocation().getDonation().setStatus("DELIVERED");
                delivery.getAllocation().setStatus("COMPLETED");
            }
            if (delivery.getVolunteer() != null) {
                delivery.getVolunteer().setDeliveriesCompleted(delivery.getVolunteer().getDeliveriesCompleted() + 1);
            }
        }

        Delivery saved = deliveryRepository.save(delivery);
        return DeliveryResponseDto.fromEntity(saved);
    }

    public VolunteerProfileResponseDto getVolunteerProfile(String userEmail) {
        VolunteerProfile profile = volunteerProfileRepository.findByUserEmail(userEmail)
                .orElseGet(() -> volunteerProfileRepository.findAll().stream().findFirst().orElse(null));
        return VolunteerProfileResponseDto.fromEntity(profile);
    }

    public List<VolunteerProfileResponseDto> getAllVolunteers() {
        return volunteerProfileRepository.findAll().stream()
                .map(VolunteerProfileResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
}

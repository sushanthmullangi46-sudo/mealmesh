package com.mealmesh.service;

import com.mealmesh.entity.Delivery;
import com.mealmesh.entity.VolunteerProfile;
import com.mealmesh.repository.DeliveryRepository;
import com.mealmesh.repository.VolunteerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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

    public List<Delivery> getVolunteerDeliveries(String userEmail) {
        List<Delivery> list = deliveryRepository.findByVolunteerUserEmail(userEmail);
        if (list.isEmpty()) {
            list = deliveryRepository.findAll();
        }
        return list;
    }

    @Transactional
    public Delivery updateDeliveryStatus(UUID deliveryId, String newStatus) {
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

        return deliveryRepository.save(delivery);
    }

    public VolunteerProfile getVolunteerProfile(String userEmail) {
        return volunteerProfileRepository.findByUserEmail(userEmail)
                .orElseGet(() -> volunteerProfileRepository.findAll().stream().findFirst().orElse(null));
    }
}

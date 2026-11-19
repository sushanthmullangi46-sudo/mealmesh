package com.mealmesh.service;

import com.mealmesh.dsa.routing.DisruptionReplanEngine;
import com.mealmesh.entity.*;
import com.mealmesh.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class DisruptionService {

    private final DeliveryRepository deliveryRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final LocationRepository locationRepository;
    private final NotificationRepository notificationRepository;

    public DisruptionService(DeliveryRepository deliveryRepository,
                             VolunteerProfileRepository volunteerProfileRepository,
                             LocationRepository locationRepository,
                             NotificationRepository notificationRepository) {
        this.deliveryRepository = deliveryRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.locationRepository = locationRepository;
        this.notificationRepository = notificationRepository;
    }

    public DisruptionReplanEngine.ReplanResult triggerDisruption(String deliveryIdStr, String disruptionType, String note) {
        Delivery delivery = null;
        try {
            if (deliveryIdStr != null && !deliveryIdStr.isBlank()) {
                delivery = deliveryRepository.findById(UUID.fromString(deliveryIdStr)).orElse(null);
            }
        } catch (Exception ignored) {}

        if (delivery == null) {
            delivery = deliveryRepository.findAll().stream().findFirst().orElse(null);
        }

        double pickupLat = delivery != null && delivery.getPickupLatitude() != 0 ? delivery.getPickupLatitude() : 12.9352;
        double pickupLon = delivery != null && delivery.getPickupLongitude() != 0 ? delivery.getPickupLongitude() : 77.6245;
        double dropoffLat = delivery != null && delivery.getDropoffLatitude() != 0 ? delivery.getDropoffLatitude() : 12.9121;
        double dropoffLon = delivery != null && delivery.getDropoffLongitude() != 0 ? delivery.getDropoffLongitude() : 77.6446;
        double requiredKg = delivery != null && delivery.getAllocation() != null ? delivery.getAllocation().getAllocatedQuantityKg() : 25.0;

        List<VolunteerProfile> volProfiles = volunteerProfileRepository.findAll();
        List<DisruptionReplanEngine.VolunteerCandidate> candidates = new ArrayList<>();
        for (VolunteerProfile vp : volProfiles) {
            Location loc = locationRepository.findFirstByUserIdAndIsPrimaryTrue(vp.getUser() != null ? vp.getUser().getId() : null).orElse(null);
            double vLat = loc != null ? loc.getLatitude() : 12.9300;
            double vLon = loc != null ? loc.getLongitude() : 77.6300;
            candidates.add(new DisruptionReplanEngine.VolunteerCandidate(
                    vp.getId().toString(),
                    vp.getUser() != null ? vp.getUser().getFullName() : "Volunteer " + vp.getVehicleType(),
                    vLat, vLon,
                    vp.getMaxCarryingCapacityKg() > 0 ? vp.getMaxCarryingCapacityKg() : 40.0
            ));
        }

        String dId = delivery != null ? delivery.getId().toString() : UUID.randomUUID().toString();
        DisruptionReplanEngine.DisruptionEvent event = new DisruptionReplanEngine.DisruptionEvent(
                UUID.randomUUID().toString(),
                disruptionType != null ? disruptionType.toUpperCase() : "ROAD_BLOCKED",
                dId,
                note != null ? note : "Dynamic route incident"
        );
        event.setBlockedRoadName("Hosur Main Road Underpass (Waterlogged)");
        event.setCancellingVolunteerName(delivery != null && delivery.getVolunteer() != null && delivery.getVolunteer().getUser() != null ?
                delivery.getVolunteer().getUser().getFullName() : "Rahul Verma");
        event.setMinutesRemainingToExpiry(45);

        DisruptionReplanEngine.ReplanResult result = DisruptionReplanEngine.replan(
                event, pickupLat, pickupLon, dropoffLat, dropoffLon, requiredKg, candidates);

        // Update delivery notes
        if (delivery != null) {
            delivery.setNotes(result.getExecutionSummary());
            if (result.getActiveVolunteer() != null) {
                // Find matching volunteer and reassign
                for (VolunteerProfile vp : volProfiles) {
                    if (vp.getUser() != null && vp.getUser().getFullName().equalsIgnoreCase(result.getActiveVolunteer())) {
                        delivery.setVolunteer(vp);
                        break;
                    }
                }
            }
            deliveryRepository.save(delivery);
        }

        return result;
    }
}

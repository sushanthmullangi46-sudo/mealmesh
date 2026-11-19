package com.mealmesh.service;

import com.mealmesh.dto.DeliveryResponseDto;
import com.mealmesh.dto.VolunteerProfileResponseDto;
import com.mealmesh.entity.Delivery;
import com.mealmesh.entity.VolunteerProfile;
import com.mealmesh.repository.AllocationRepository;
import com.mealmesh.repository.DeliveryRepository;
import com.mealmesh.repository.DonationRepository;
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
    private final AllocationRepository allocationRepository;
    private final DonationRepository donationRepository;

    public VolunteerService(DeliveryRepository deliveryRepository,
                            VolunteerProfileRepository volunteerProfileRepository,
                            AllocationRepository allocationRepository,
                            DonationRepository donationRepository) {
        this.deliveryRepository = deliveryRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.allocationRepository = allocationRepository;
        this.donationRepository = donationRepository;
    }

    public List<DeliveryResponseDto> getVolunteerDeliveries(String userEmail) {
        List<Delivery> list = deliveryRepository.findByVolunteerUserEmail(userEmail);
        if (list.isEmpty()) {
            list = deliveryRepository.findAll();
        }
        return list.stream()
                .filter(d -> {
                    if (d.getStatus() != null && ("QUARANTINED".equalsIgnoreCase(d.getStatus()) || "DIVERTED".equalsIgnoreCase(d.getStatus()))) {
                        return false;
                    }
                    if (d.getAllocation() != null && d.getAllocation().getDonation() != null) {
                        String donStatus = d.getAllocation().getDonation().getStatus();
                        if ("QUARANTINED".equalsIgnoreCase(donStatus) || "DIVERTED_TO_COMPOST".equalsIgnoreCase(donStatus)) {
                            return false;
                        }
                    }
                    return true;
                })
                .sorted((a, b) -> {
                    LocalDateTime ta = a.getCompletionTime() != null ? a.getCompletionTime() : a.getStartTime();
                    LocalDateTime tb = b.getCompletionTime() != null ? b.getCompletionTime() : b.getStartTime();
                    if (ta == null && tb == null) return 0;
                    if (ta == null) return 1;
                    if (tb == null) return -1;
                    return tb.compareTo(ta); // Newest / most recent first
                })
                .map(DeliveryResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryResponseDto updateDeliveryStatus(UUID deliveryId, String newStatus) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found: " + deliveryId));

        delivery.setStatus(newStatus.toUpperCase());
        if ("PICKED_UP".equalsIgnoreCase(newStatus)) {
            delivery.setPickupTime(LocalDateTime.now());
            if (delivery.getAllocation() != null) {
                if (delivery.getAllocation().getDonation() != null) {
                    delivery.getAllocation().getDonation().setStatus("IN_TRANSIT");
                    donationRepository.save(delivery.getAllocation().getDonation());
                }
                allocationRepository.save(delivery.getAllocation());
            }
        } else if ("DELIVERED".equalsIgnoreCase(newStatus)) {
            delivery.setCompletionTime(LocalDateTime.now());
            if (delivery.getAllocation() != null) {
                delivery.getAllocation().setStatus("COMPLETED");
                allocationRepository.save(delivery.getAllocation());
                if (delivery.getAllocation().getDonation() != null) {
                    delivery.getAllocation().getDonation().setStatus("DELIVERED");
                    donationRepository.save(delivery.getAllocation().getDonation());
                }
            }
            if (delivery.getVolunteer() != null) {
                delivery.getVolunteer().setDeliveriesCompleted(delivery.getVolunteer().getDeliveriesCompleted() + 1);
                volunteerProfileRepository.save(delivery.getVolunteer());
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

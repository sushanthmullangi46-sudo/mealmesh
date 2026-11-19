package com.mealmesh.service;

import com.mealmesh.dsa.greedy.GreedyAllocator;
import com.mealmesh.dto.DeliveryResponseDto;
import com.mealmesh.dto.VolunteerProfileResponseDto;
import com.mealmesh.entity.Allocation;
import com.mealmesh.entity.Delivery;
import com.mealmesh.entity.Donation;
import com.mealmesh.entity.Location;
import com.mealmesh.entity.NgoProfile;
import com.mealmesh.entity.VolunteerProfile;
import com.mealmesh.repository.AllocationRepository;
import com.mealmesh.repository.DeliveryRepository;
import com.mealmesh.repository.DonationRepository;
import com.mealmesh.repository.LocationRepository;
import com.mealmesh.repository.NgoProfileRepository;
import com.mealmesh.repository.VolunteerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
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
    private final NgoProfileRepository ngoProfileRepository;
    private final LocationRepository locationRepository;

    public VolunteerService(DeliveryRepository deliveryRepository,
                            VolunteerProfileRepository volunteerProfileRepository,
                            AllocationRepository allocationRepository,
                            DonationRepository donationRepository,
                            NgoProfileRepository ngoProfileRepository,
                            LocationRepository locationRepository) {
        this.deliveryRepository = deliveryRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.allocationRepository = allocationRepository;
        this.donationRepository = donationRepository;
        this.ngoProfileRepository = ngoProfileRepository;
        this.locationRepository = locationRepository;
    }

    @Transactional
    public void ensureDeliveriesForActiveDonations() {
        List<Donation> activeDonations = donationRepository.findAll().stream()
                .filter(d -> "AVAILABLE".equalsIgnoreCase(d.getStatus()) || "RESERVED".equalsIgnoreCase(d.getStatus()) || "MATCHED".equalsIgnoreCase(d.getStatus()))
                .filter(d -> d.getExpiryTime() == null || d.getExpiryTime().isAfter(LocalDateTime.now()))
                .collect(Collectors.toList());

        NgoProfile defaultNgo = ngoProfileRepository.findAll().stream().findFirst().orElse(null);
        VolunteerProfile defaultVol = volunteerProfileRepository.findAll().stream()
                .filter(VolunteerProfile::isAvailable)
                .findFirst()
                .orElseGet(() -> volunteerProfileRepository.findAll().stream().findFirst().orElse(null));

        for (Donation donation : activeDonations) {
            boolean hasDelivery = deliveryRepository.findAll().stream()
                    .anyMatch(d -> d.getAllocation() != null && d.getAllocation().getDonation() != null
                            && d.getAllocation().getDonation().getId().equals(donation.getId()));
            if (!hasDelivery && defaultNgo != null) {
                Allocation alloc = new Allocation();
                alloc.setDonation(donation);
                alloc.setNgo(defaultNgo);
                alloc.setAllocatedQuantityKg(donation.getQuantityKg());
                alloc.setStatus("ACCEPTED");
                alloc.setMatchScore(95.0);
                alloc.setMatchedAt(LocalDateTime.now());
                alloc = allocationRepository.save(alloc);

                double pLat = donation.getLocation() != null ? donation.getLocation().getLatitude() : 12.9352;
                double pLon = donation.getLocation() != null ? donation.getLocation().getLongitude() : 77.6245;

                Location ngoLoc = locationRepository.findFirstByUserIdAndIsPrimaryTrue(
                        defaultNgo.getUser() != null ? defaultNgo.getUser().getId() : null).orElse(null);
                double dLat = ngoLoc != null ? ngoLoc.getLatitude() : 12.9121;
                double dLon = ngoLoc != null ? ngoLoc.getLongitude() : 77.6446;

                VolunteerProfile vol = volunteerProfileRepository.findAll().stream()
                        .filter(VolunteerProfile::isAvailable)
                        .filter(v -> v.getCurrentLatitude() != null && v.getCurrentLongitude() != null)
                        .min(Comparator.comparingDouble(v -> GreedyAllocator.haversineDistance(pLat, pLon, v.getCurrentLatitude(), v.getCurrentLongitude())))
                        .orElse(defaultVol);

                Delivery delivery = new Delivery();
                delivery.setAllocation(alloc);
                delivery.setVolunteer(vol != null ? vol : defaultVol);
                delivery.setStatus("ASSIGNED");
                delivery.setPickupLatitude(pLat);
                delivery.setPickupLongitude(pLon);
                delivery.setDropoffLatitude(dLat);
                delivery.setDropoffLongitude(dLon);

                double distKm = Math.max(1.0, Math.round(GreedyAllocator.haversineDistance(pLat, pLon, dLat, dLon) * 10.0) / 10.0);
                delivery.setEstimatedDistanceKm(distKm);
                delivery.setEstimatedTimeMinutes(Math.max(5, Math.round(distKm * 3.2)));
                delivery.setStartTime(LocalDateTime.now());
                delivery.setNotes("Rescue Dispatch Mission: " + donation.getTitle() + " (" + donation.getQuantityKg() + " kg)");
                deliveryRepository.save(delivery);
            }
        }
    }

    @Transactional
    public List<DeliveryResponseDto> getVolunteerDeliveries(String userEmail) {
        ensureDeliveriesForActiveDonations();

        // Return all fleet deliveries so active missions across transporters are instantly visible
        List<Delivery> list = deliveryRepository.findAll();
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
                    // Active deliveries (ASSIGNED, ACCEPTED, PICKED_UP) come first
                    boolean aActive = !"DELIVERED".equalsIgnoreCase(a.getStatus()) && !"FAILED".equalsIgnoreCase(a.getStatus());
                    boolean bActive = !"DELIVERED".equalsIgnoreCase(b.getStatus()) && !"FAILED".equalsIgnoreCase(b.getStatus());
                    if (aActive && !bActive) return -1;
                    if (!aActive && bActive) return 1;

                    LocalDateTime ta = a.getStartTime() != null ? a.getStartTime() : a.getCompletionTime();
                    LocalDateTime tb = b.getStartTime() != null ? b.getStartTime() : b.getCompletionTime();
                    if (ta == null && tb == null) return 0;
                    if (ta == null) return 1;
                    if (tb == null) return -1;
                    return tb.compareTo(ta); // Newest first
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

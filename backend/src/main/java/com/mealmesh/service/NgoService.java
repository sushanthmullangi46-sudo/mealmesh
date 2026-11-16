package com.mealmesh.service;

import com.mealmesh.entity.Allocation;
import com.mealmesh.entity.NgoProfile;
import com.mealmesh.repository.AllocationRepository;
import com.mealmesh.repository.DonationRepository;
import com.mealmesh.repository.NgoProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class NgoService {

    private final NgoProfileRepository ngoProfileRepository;
    private final AllocationRepository allocationRepository;
    private final DonationRepository donationRepository;

    public NgoService(NgoProfileRepository ngoProfileRepository,
                      AllocationRepository allocationRepository,
                      DonationRepository donationRepository) {
        this.ngoProfileRepository = ngoProfileRepository;
        this.allocationRepository = allocationRepository;
        this.donationRepository = donationRepository;
    }

    public NgoProfile getNgoProfile(String userEmail) {
        return ngoProfileRepository.findByUserEmail(userEmail)
                .orElseGet(() -> ngoProfileRepository.findAll().stream().findFirst().orElse(null));
    }

    @Transactional
    public NgoProfile updateStorageCapacity(String userEmail, double currentKg, double maxKg) {
        NgoProfile ngo = getNgoProfile(userEmail);
        if (ngo != null) {
            ngo.setCurrentStorageCapacityKg(Math.max(0, currentKg));
            ngo.setMaxStorageCapacityKg(Math.max(10, maxKg));
            return ngoProfileRepository.save(ngo);
        }
        return null;
    }

    public List<Allocation> getAllocationsForNgo(String userEmail) {
        List<Allocation> list = allocationRepository.findByNgoUserId(
                getNgoProfile(userEmail) != null && getNgoProfile(userEmail).getUser() != null
                        ? getNgoProfile(userEmail).getUser().getId()
                        : null
        );
        if (list.isEmpty()) {
            list = allocationRepository.findAll();
        }
        return list;
    }
}

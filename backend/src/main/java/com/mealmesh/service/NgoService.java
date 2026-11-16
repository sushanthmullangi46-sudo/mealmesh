package com.mealmesh.service;

import com.mealmesh.dto.AllocationResponseDto;
import com.mealmesh.dto.NgoProfileResponseDto;
import com.mealmesh.entity.Allocation;
import com.mealmesh.entity.NgoProfile;
import com.mealmesh.repository.AllocationRepository;
import com.mealmesh.repository.DonationRepository;
import com.mealmesh.repository.NgoProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    public NgoProfileResponseDto getNgoProfile(String userEmail) {
        NgoProfile ngo = ngoProfileRepository.findByUserEmail(userEmail)
                .orElseGet(() -> ngoProfileRepository.findAll().stream().findFirst().orElse(null));
        return NgoProfileResponseDto.fromEntity(ngo);
    }

    @Transactional
    public NgoProfileResponseDto updateStorageCapacity(String userEmail, double currentKg, double maxKg) {
        NgoProfile ngo = ngoProfileRepository.findByUserEmail(userEmail)
                .orElseGet(() -> ngoProfileRepository.findAll().stream().findFirst().orElse(null));
        if (ngo != null) {
            ngo.setCurrentStorageCapacityKg(Math.max(0, currentKg));
            ngo.setMaxStorageCapacityKg(Math.max(10, maxKg));
            NgoProfile saved = ngoProfileRepository.save(ngo);
            return NgoProfileResponseDto.fromEntity(saved);
        }
        return null;
    }

    public List<AllocationResponseDto> getAllocationsForNgo(String userEmail) {
        NgoProfile ngo = ngoProfileRepository.findByUserEmail(userEmail)
                .orElseGet(() -> ngoProfileRepository.findAll().stream().findFirst().orElse(null));
        UUID userId = (ngo != null && ngo.getUser() != null) ? ngo.getUser().getId() : null;
        List<Allocation> list = allocationRepository.findByNgoUserId(userId);
        if (list.isEmpty()) {
            list = allocationRepository.findAll();
        }
        return list.stream().map(AllocationResponseDto::fromEntity).collect(Collectors.toList());
    }
}

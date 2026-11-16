package com.mealmesh.service;

import com.mealmesh.dto.AuthRequest;
import com.mealmesh.dto.AuthResponse;
import com.mealmesh.dto.RegisterRequest;
import com.mealmesh.entity.*;
import com.mealmesh.repository.*;
import com.mealmesh.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final DonorProfileRepository donorProfileRepository;
    private final NgoProfileRepository ngoProfileRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       LocationRepository locationRepository,
                       DonorProfileRepository donorProfileRepository,
                       NgoProfileRepository ngoProfileRepository,
                       VolunteerProfileRepository volunteerProfileRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.donorProfileRepository = donorProfileRepository;
        this.ngoProfileRepository = ngoProfileRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Allow demo login with any password or match BCrypt
        if (!request.getPassword().equals("demo123") && !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole(), user.getFullName(), user.getId().toString());
        return new AuthResponse(token, user.getEmail(), user.getRole(), user.getFullName(), user.getId().toString());
    }

    public AuthResponse demoLogin(String role) {
        String email = switch (role.toUpperCase()) {
            case "DONOR" -> "donor.koramangala@mealmesh.org";
            case "NGO" -> "ngo.akshayapatra@mealmesh.org";
            case "VOLUNTEER" -> "volunteer.rahul@mealmesh.org";
            default -> "admin@mealmesh.org";
        };

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.findAll().stream()
                        .filter(u -> u.getRole().equalsIgnoreCase(role))
                        .findFirst()
                        .orElseThrow(() -> new IllegalStateException("No demo user found for role " + role)));

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole(), user.getFullName(), user.getId().toString());
        return new AuthResponse(token, user.getEmail(), user.getRole(), user.getFullName(), user.getId().toString());
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered: " + email);
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setFullName(req.getFullName());
        user.setPhone(req.getPhone());
        user.setRole(req.getRole().toUpperCase());
        user.setVerified(true);
        user = userRepository.save(user);

        // Save location
        Location loc = new Location();
        loc.setUser(user);
        loc.setName(req.getFullName() + " Base");
        loc.setAddressLine(req.getAddress() != null ? req.getAddress() : "Bengaluru, Karnataka");
        loc.setCity("Bengaluru");
        loc.setPostalCode("560001");
        loc.setLatitude(req.getLatitude() != 0.0 ? req.getLatitude() : 12.9716);
        loc.setLongitude(req.getLongitude() != 0.0 ? req.getLongitude() : 77.5946);
        loc.setPrimary(true);
        locationRepository.save(loc);

        // Role-specific profile
        if ("DONOR".equalsIgnoreCase(req.getRole())) {
            DonorProfile donor = new DonorProfile();
            donor.setUser(user);
            donor.setOrganizationName(req.getOrganizationName() != null ? req.getOrganizationName() : req.getFullName());
            donor.setOrganizationType(req.getOrganizationType() != null ? req.getOrganizationType() : "RESTAURANT");
            donor.setContactPerson(req.getFullName());
            donor.setHygieneRating(4.8);
            donorProfileRepository.save(donor);
        } else if ("NGO".equalsIgnoreCase(req.getRole())) {
            NgoProfile ngo = new NgoProfile();
            ngo.setUser(user);
            ngo.setOrganizationName(req.getOrganizationName() != null ? req.getOrganizationName() : req.getFullName());
            ngo.setRegistrationNumber("NGO-REG-" + System.currentTimeMillis() % 100000);
            ngo.setBeneficiaryCount(150);
            ngo.setDailyFoodRequirementKg(60.0);
            ngo.setMaxStorageCapacityKg(250.0);
            ngo.setCurrentStorageCapacityKg(20.0);
            ngo.setVerified(true);
            ngoProfileRepository.save(ngo);
        } else if ("VOLUNTEER".equalsIgnoreCase(req.getRole())) {
            VolunteerProfile vol = new VolunteerProfile();
            vol.setUser(user);
            vol.setVehicleType(req.getVehicleType() != null ? req.getVehicleType() : "TWO_WHEELER");
            vol.setVehicleNumber(req.getVehicleNumber() != null ? req.getVehicleNumber() : "KA-01-EQ-1001");
            vol.setMaxCarryingCapacityKg(35.0);
            vol.setAvailable(true);
            vol.setCurrentLatitude(loc.getLatitude());
            vol.setCurrentLongitude(loc.getLongitude());
            volunteerProfileRepository.save(vol);
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole(), user.getFullName(), user.getId().toString());
        return new AuthResponse(token, user.getEmail(), user.getRole(), user.getFullName(), user.getId().toString());
    }
}

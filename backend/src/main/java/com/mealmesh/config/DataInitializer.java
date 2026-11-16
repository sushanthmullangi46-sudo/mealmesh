package com.mealmesh.config;

import com.mealmesh.entity.*;
import com.mealmesh.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final DonorProfileRepository donorProfileRepository;
    private final NgoProfileRepository ngoProfileRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final FoodCategoryRepository foodCategoryRepository;
    private final DonationRepository donationRepository;
    private final AllocationRepository allocationRepository;
    private final DeliveryRepository deliveryRepository;
    private final BeneficiaryDistributionRepository distributionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           LocationRepository locationRepository,
                           DonorProfileRepository donorProfileRepository,
                           NgoProfileRepository ngoProfileRepository,
                           VolunteerProfileRepository volunteerProfileRepository,
                           FoodCategoryRepository foodCategoryRepository,
                           DonationRepository donationRepository,
                           AllocationRepository allocationRepository,
                           DeliveryRepository deliveryRepository,
                           BeneficiaryDistributionRepository distributionRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.donorProfileRepository = donorProfileRepository;
        this.ngoProfileRepository = ngoProfileRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.foodCategoryRepository = foodCategoryRepository;
        this.donationRepository = donationRepository;
        this.allocationRepository = allocationRepository;
        this.deliveryRepository = deliveryRepository;
        this.distributionRepository = distributionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        String encodedPassword = passwordEncoder.encode("demo123");
        ensureAdditionalVolunteers(encodedPassword);
        ensureFreshSurplusDonations();

        if (userRepository.count() > 8) {
            return; // Already initialized
        }

        // 1. Admin
        User admin = new User(null, "admin@mealmesh.org", encodedPassword, "System Administrator", "+91 80 4000 0001", "ADMIN");
        admin.setVerified(true);
        admin = userRepository.save(admin);

        // 2. Donor 1 (Koramangala)
        User donorUser1 = new User(null, "donor.koramangala@mealmesh.org", encodedPassword, "Chef Suresh Kumar", "+91 98450 11001", "DONOR");
        donorUser1.setVerified(true);
        donorUser1 = userRepository.save(donorUser1);

        Location locDonor1 = new Location(null, donorUser1, "ITC Gardenia Kitchen", "80 Feet Rd, Koramangala 4th Block", "Bengaluru", "560034", 12.9352, 77.6245);
        locDonor1 = locationRepository.save(locDonor1);

        DonorProfile donorProf1 = new DonorProfile(null, donorUser1, "ITC Gardenia Kitchen", "HOTEL", "FSSAI-112233440011", "Chef Suresh Kumar", 4.9);
        donorProf1 = donorProfileRepository.save(donorProf1);

        // 3. Donor 2 (Indiranagar)
        User donorUser2 = new User(null, "donor.indiranagar@mealmesh.org", encodedPassword, "Ananya Rao", "+91 98450 11002", "DONOR");
        donorUser2.setVerified(true);
        donorUser2 = userRepository.save(donorUser2);

        Location locDonor2 = new Location(null, donorUser2, "Corner House Foods", "100ft Road, Indiranagar", "Bengaluru", "560038", 12.9784, 77.6408);
        locDonor2 = locationRepository.save(locDonor2);

        DonorProfile donorProf2 = new DonorProfile(null, donorUser2, "Corner House Foods", "BAKERY", "FSSAI-112233440022", "Ananya Rao", 4.8);
        donorProf2 = donorProfileRepository.save(donorProf2);

        // 4. NGO 1 (Akshaya Patra HSR)
        User ngoUser1 = new User(null, "ngo.akshayapatra@mealmesh.org", encodedPassword, "Ramesh Narayan", "+91 80 2345 6701", "NGO");
        ngoUser1.setVerified(true);
        ngoUser1 = userRepository.save(ngoUser1);

        Location locNgo1 = new Location(null, ngoUser1, "Akshaya Patra HSR Center", "Sector 2, HSR Layout", "Bengaluru", "560102", 12.9121, 77.6446);
        locNgo1 = locationRepository.save(locNgo1);

        NgoProfile ngoProf1 = new NgoProfile(null, ngoUser1, "Akshaya Patra Foundation", "NGO-KA-2015-0912", 250, 80.0, 35.0, 250.0, "06:00 - 21:00", "VEG,ALL", true);
        ngoProf1 = ngoProfileRepository.save(ngoProf1);

        // 5. NGO 2 (Jayanagar)
        User ngoUser2 = new User(null, "ngo.robinhood@mealmesh.org", encodedPassword, "Vikram Joshi", "+91 80 2345 6702", "NGO");
        ngoUser2.setVerified(true);
        ngoUser2 = userRepository.save(ngoUser2);

        Location locNgo2 = new Location(null, ngoUser2, "Robin Hood Army Jayanagar", "4th Block, Jayanagar", "Bengaluru", "560011", 12.9250, 77.5938);
        locNgo2 = locationRepository.save(locNgo2);

        NgoProfile ngoProf2 = new NgoProfile(null, ngoUser2, "Robin Hood Army Bengaluru", "NGO-KA-2018-4411", 180, 60.0, 20.0, 200.0, "07:00 - 22:00", "ALL", true);
        ngoProf2 = ngoProfileRepository.save(ngoProf2);

        // 6. Volunteer 1 (Rahul)
        User volUser1 = new User(null, "volunteer.rahul@mealmesh.org", encodedPassword, "Rahul Sharma", "+91 99000 22001", "VOLUNTEER");
        volUser1.setVerified(true);
        volUser1 = userRepository.save(volUser1);

        Location locVol1 = new Location(null, volUser1, "Rahul Sharma Base", "Koramangala 1st Block", "Bengaluru", "560034", 12.9300, 77.6200);
        locationRepository.save(locVol1);

        VolunteerProfile volProf1 = new VolunteerProfile(null, volUser1, "TWO_WHEELER", "KA-01-EQ-1001", 30.0, true, 12.9300, 77.6200, 18);
        volProf1 = volunteerProfileRepository.save(volProf1);

        // 7. Categories
        FoodCategory catCooked = foodCategoryRepository.save(new FoodCategory(null, "Cooked Meals", "Cooked meals, rice, curries", 4, "HIGH"));
        FoodCategory catBakery = foodCategoryRepository.save(new FoodCategory(null, "Bakery Items", "Breads, buns, dry baked goods", 12, "MEDIUM"));
        FoodCategory catGroceries = foodCategoryRepository.save(new FoodCategory(null, "Raw Groceries", "Uncooked vegetables and staples", 24, "LOW"));

        // 8. Donations
        Donation don1 = new Donation();
        don1.setDonor(donorProf1);
        don1.setCategory(catCooked);
        don1.setLocation(locDonor1);
        don1.setTitle("Basmati Veg Biryani with Paneer Butter Masala");
        don1.setDescription("Wholesome hot lunch buffet surplus, stored in insulated warm containers.");
        don1.setFoodType("COOKED");
        don1.setDietaryType("VEG");
        don1.setQuantityKg(35.0);
        don1.setServings(90);
        don1.setCookedTime(LocalDateTime.now().minusHours(1));
        don1.setExpiryTime(LocalDateTime.now().plusHours(3));
        don1.setUrgency("CRITICAL");
        don1.setStatus("AVAILABLE");
        don1.setStorageTemperatureCelsius(65.0);
        don1.setAllergenInfo("Contains Dairy, Nuts");
        don1.setPickupInstructions("Collect from kitchen rear dispatch counter");
        don1 = donationRepository.save(don1);

        Donation don2 = new Donation();
        don2.setDonor(donorProf2);
        don2.setCategory(catBakery);
        don2.setLocation(locDonor2);
        don2.setTitle("Fresh Multigrain Sourdough Loaves & Buns");
        don2.setDescription("Baked daily morning, sealed in hygienic food-grade paper packaging.");
        don2.setFoodType("PACKAGED");
        don2.setDietaryType("VEG");
        don2.setQuantityKg(20.0);
        don2.setServings(50);
        don2.setCookedTime(LocalDateTime.now().minusHours(2));
        don2.setExpiryTime(LocalDateTime.now().plusHours(6));
        don2.setUrgency("HIGH");
        don2.setStatus("AVAILABLE");
        don2.setStorageTemperatureCelsius(24.0);
        don2.setAllergenInfo("Contains Gluten");
        don2.setPickupInstructions("Collect from storefront bakery display counter");
        don2 = donationRepository.save(don2);

        Donation don3 = new Donation();
        don3.setDonor(donorProf1);
        don3.setCategory(catCooked);
        don3.setLocation(locDonor1);
        don3.setTitle("South Indian Sambar, Rice & Vegetable Poriyal");
        don3.setDescription("Freshly prepared morning corporate catering surplus.");
        don3.setFoodType("COOKED");
        don3.setDietaryType("VEG");
        don3.setQuantityKg(25.0);
        don3.setServings(65);
        don3.setCookedTime(LocalDateTime.now().minusHours(1));
        don3.setExpiryTime(LocalDateTime.now().plusHours(4));
        don3.setUrgency("CRITICAL");
        don3.setStatus("RESERVED");
        don3.setStorageTemperatureCelsius(68.0);
        don3.setAllergenInfo("None");
        don3 = donationRepository.save(don3);

        // 9. Allocation & Delivery for demonstration
        Allocation alloc1 = new Allocation();
        alloc1.setDonation(don3);
        alloc1.setNgo(ngoProf1);
        alloc1.setAllocatedQuantityKg(25.0);
        alloc1.setStatus("ACCEPTED");
        alloc1.setMatchScore(94.5);
        alloc1.setMatchedAt(LocalDateTime.now().minusMinutes(20));
        alloc1 = allocationRepository.save(alloc1);

        Delivery delivery1 = new Delivery();
        delivery1.setAllocation(alloc1);
        delivery1.setVolunteer(volProf1);
        delivery1.setStatus("ASSIGNED");
        delivery1.setPickupLatitude(locDonor1.getLatitude());
        delivery1.setPickupLongitude(locDonor1.getLongitude());
        delivery1.setDropoffLatitude(locNgo1.getLatitude());
        delivery1.setDropoffLongitude(locNgo1.getLongitude());
        delivery1.setEstimatedDistanceKm(4.8);
        delivery1.setEstimatedTimeMinutes(14.0);
        delivery1.setStartTime(LocalDateTime.now());
        deliveryRepository.save(delivery1);

        // 10. Completed Beneficiary Distributions for analytics
        BeneficiaryDistribution dist = new BeneficiaryDistribution();
        dist.setNgo(ngoProf1);
        dist.setDonation(don3);
        dist.setBeneficiaryGroup("Children Shelter & Slum Community");
        dist.setPeopleFedCount(1250);
        dist.setQuantityDistributedKg(520.0);
        dist.setDistributedAt(LocalDateTime.now().minusDays(1));
        distributionRepository.save(dist);
    }

    private void ensureAdditionalVolunteers(String encodedPassword) {
        // 1. Priya Sundaram
        if (!userRepository.existsByEmail("volunteer.priya@mealmesh.org")) {
            User u = new User(null, "volunteer.priya@mealmesh.org", encodedPassword, "Priya Sundaram", "+91 98453 44002", "VOLUNTEER");
            u.setVerified(true);
            u = userRepository.save(u);
            locationRepository.save(new Location(null, u, "Priya Hub Indiranagar", "100ft Road, Indiranagar", "Bengaluru", "560038", 12.9784, 77.6408));
            volunteerProfileRepository.save(new VolunteerProfile(null, u, "TWO_WHEELER", "KA-05-MR-4421", 35.0, true, 12.9784, 77.6408, 45));
        }

        // 2. Mohammed Farhan
        if (!userRepository.existsByEmail("volunteer.farhan@mealmesh.org")) {
            User u = new User(null, "volunteer.farhan@mealmesh.org", encodedPassword, "Mohammed Farhan", "+91 98453 44012", "VOLUNTEER");
            u.setVerified(true);
            u = userRepository.save(u);
            locationRepository.save(new Location(null, u, "Farhan Hub HSR", "27th Main, HSR Layout", "Bengaluru", "560102", 12.9121, 77.6446));
            volunteerProfileRepository.save(new VolunteerProfile(null, u, "TWO_WHEELER", "KA-03-JN-8832", 35.0, true, 12.9121, 77.6446, 62));
        }

        // 3. Ananya Deshmukh
        if (!userRepository.existsByEmail("volunteer.ananya@mealmesh.org")) {
            User u = new User(null, "volunteer.ananya@mealmesh.org", encodedPassword, "Ananya Deshmukh", "+91 98453 44004", "VOLUNTEER");
            u.setVerified(true);
            u = userRepository.save(u);
            locationRepository.save(new Location(null, u, "Ananya Hub BTM", "2nd Stage Ring Rd, BTM", "Bengaluru", "560076", 12.9182, 77.6145));
            volunteerProfileRepository.save(new VolunteerProfile(null, u, "TWO_WHEELER", "KA-04-EL-2094", 30.0, true, 12.9182, 77.6145, 38));
        }

        // 4. Karthik Venkatesh
        if (!userRepository.existsByEmail("volunteer.karthik@mealmesh.org")) {
            User u = new User(null, "volunteer.karthik@mealmesh.org", encodedPassword, "Karthik Venkatesh", "+91 98453 44003", "VOLUNTEER");
            u.setVerified(true);
            u = userRepository.save(u);
            locationRepository.save(new Location(null, u, "Karthik Hub Malleshwaram", "Sampige Road, Malleshwaram", "Bengaluru", "560003", 12.9982, 77.5714));
            volunteerProfileRepository.save(new VolunteerProfile(null, u, "TWO_WHEELER", "KA-02-AB-7719", 30.0, true, 12.9982, 77.5714, 54));
        }

        // 5. Vikramaditya Rao
        if (!userRepository.existsByEmail("volunteer.vikram@mealmesh.org")) {
            User u = new User(null, "volunteer.vikram@mealmesh.org", encodedPassword, "Vikramaditya Rao", "+91 98453 44015", "VOLUNTEER");
            u.setVerified(true);
            u = userRepository.save(u);
            locationRepository.save(new Location(null, u, "Vikram Logistics Hub", "Silk Board Corridor", "Bengaluru", "560068", 12.9175, 77.6230));
            volunteerProfileRepository.save(new VolunteerProfile(null, u, "FOUR_WHEELER", "KA-51-MD-9002", 450.0, true, 12.9175, 77.6230, 112));
        }

        // 6. Deepa R. Nair
        if (!userRepository.existsByEmail("volunteer.deepa@mealmesh.org")) {
            User u = new User(null, "volunteer.deepa@mealmesh.org", encodedPassword, "Deepa R. Nair", "+91 98453 44018", "VOLUNTEER");
            u.setVerified(true);
            u = userRepository.save(u);
            locationRepository.save(new Location(null, u, "Deepa Hub E-City", "Phase 1, Electronic City", "Bengaluru", "560100", 12.8452, 77.6602));
            volunteerProfileRepository.save(new VolunteerProfile(null, u, "TWO_WHEELER", "KA-01-HG-3301", 30.0, true, 12.8452, 77.6602, 29));
        }
    }

    private void ensureFreshSurplusDonations() {
        if (donationRepository.count() > 0 && donationRepository.findAvailableActiveDonations(LocalDateTime.now()).size() >= 3) {
            return;
        }

        DonorProfile donor1 = donorProfileRepository.findAll().stream().findFirst().orElse(null);
        if (donor1 == null) return;

        FoodCategory catCooked = foodCategoryRepository.findByNameIgnoreCase("Cooked Meals")
                .orElseGet(() -> foodCategoryRepository.findAll().stream().findFirst().orElse(null));
        FoodCategory catBakery = foodCategoryRepository.findByNameIgnoreCase("Bakery Items")
                .orElse(catCooked);

        Location loc1 = locationRepository.findAll().stream().findFirst().orElse(null);

        // 1. Basmati Veg Biryani
        Donation d1 = new Donation();
        d1.setDonor(donor1);
        d1.setCategory(catCooked);
        d1.setLocation(loc1);
        d1.setTitle("Basmati Veg Biryani with Paneer Butter Masala");
        d1.setDescription("Wholesome hot lunch buffet surplus, stored in insulated warm containers.");
        d1.setFoodType("COOKED");
        d1.setDietaryType("VEG");
        d1.setQuantityKg(35.0);
        d1.setServings(90);
        d1.setCookedTime(LocalDateTime.now().minusHours(1));
        d1.setExpiryTime(LocalDateTime.now().plusHours(4));
        d1.setUrgency("HIGH");
        d1.setStatus("AVAILABLE");
        d1.setStorageTemperatureCelsius(65.0);
        d1.setAllergenInfo("Contains Dairy, Nuts");
        d1.setPickupInstructions("Collect from kitchen rear dispatch counter");
        donationRepository.save(d1);

        // 2. South Indian Sambar & Rice
        Donation d2 = new Donation();
        d2.setDonor(donor1);
        d2.setCategory(catCooked);
        d2.setLocation(loc1);
        d2.setTitle("South Indian Sambar, Rice & Vegetable Poriyal");
        d2.setDescription("Freshly cooked meals packed in food-grade insulated vessels.");
        d2.setFoodType("COOKED");
        d2.setDietaryType("VEG");
        d2.setQuantityKg(25.0);
        d2.setServings(65);
        d2.setCookedTime(LocalDateTime.now().minusHours(1));
        d2.setExpiryTime(LocalDateTime.now().plusHours(2));
        d2.setUrgency("CRITICAL");
        d2.setStatus("AVAILABLE");
        d2.setStorageTemperatureCelsius(68.0);
        d2.setAllergenInfo("None");
        d2.setPickupInstructions("Collect from Gate 2 banquet ramp");
        donationRepository.save(d2);

        // 3. Fresh Artisanal Breads & Rolls
        Donation d3 = new Donation();
        d3.setDonor(donor1);
        d3.setCategory(catBakery);
        d3.setLocation(loc1);
        d3.setTitle("Fresh Multigrain Sourdough Loaves & Buns");
        d3.setDescription("Freshly baked bakery items in sealed hygienic packets.");
        d3.setFoodType("PACKAGED");
        d3.setDietaryType("VEG");
        d3.setQuantityKg(20.0);
        d3.setServings(50);
        d3.setCookedTime(LocalDateTime.now().minusHours(2));
        d3.setExpiryTime(LocalDateTime.now().plusHours(6));
        d3.setUrgency("HIGH");
        d3.setStatus("AVAILABLE");
        d3.setStorageTemperatureCelsius(24.0);
        d3.setAllergenInfo("Contains Gluten");
        d3.setPickupInstructions("Collect from storefront bakery display counter");
        donationRepository.save(d3);

        // 4. Chapathi with Dal Tadka
        Donation d4 = new Donation();
        d4.setDonor(donor1);
        d4.setCategory(catCooked);
        d4.setLocation(loc1);
        d4.setTitle("Soft Wheat Chapathi with Dal Tadka & Jeera Rice");
        d4.setDescription("Nutritious warm surplus, perfect for community shelter distribution.");
        d4.setFoodType("COOKED");
        d4.setDietaryType("VEG");
        d4.setQuantityKg(30.0);
        d4.setServings(75);
        d4.setCookedTime(LocalDateTime.now().minusMinutes(45));
        d4.setExpiryTime(LocalDateTime.now().plusHours(5));
        d4.setUrgency("HIGH");
        d4.setStatus("AVAILABLE");
        d4.setStorageTemperatureCelsius(62.0);
        d4.setAllergenInfo("Contains Gluten");
        d4.setPickupInstructions("Collect from central commissary loading dock");
        donationRepository.save(d4);

        // 5. Fresh Idli & Medu Vada
        Donation d5 = new Donation();
        d5.setDonor(donor1);
        d5.setCategory(catCooked);
        d5.setLocation(loc1);
        d5.setTitle("Hot Steamed Idli & Medu Vada with Coconut Chutney");
        d5.setDescription("Fresh breakfast batch, ready for immediate distribution.");
        d5.setFoodType("COOKED");
        d5.setDietaryType("VEG");
        d5.setQuantityKg(18.0);
        d5.setServings(50);
        d5.setCookedTime(LocalDateTime.now().minusMinutes(30));
        d5.setExpiryTime(LocalDateTime.now().plusHours(2));
        d5.setUrgency("CRITICAL");
        d5.setStatus("AVAILABLE");
        d5.setStorageTemperatureCelsius(66.0);
        d5.setAllergenInfo("Contains Dairy");
        d5.setPickupInstructions("Collect from quick-service dispatch counter");
        donationRepository.save(d5);

        // 6. Fragrant Vegetable Pulao
        Donation d6 = new Donation();
        d6.setDonor(donor1);
        d6.setCategory(catCooked);
        d6.setLocation(loc1);
        d6.setTitle("Fragrant Vegetable Pulao with Cucumber Raita");
        d6.setDescription("Mildly spiced wholesome rice dish suitable for all beneficiaries.");
        d6.setFoodType("COOKED");
        d6.setDietaryType("VEG");
        d6.setQuantityKg(40.0);
        d6.setServings(100);
        d6.setCookedTime(LocalDateTime.now().minusHours(1));
        d6.setExpiryTime(LocalDateTime.now().plusHours(4));
        d6.setUrgency("HIGH");
        d6.setStatus("AVAILABLE");
        d6.setStorageTemperatureCelsius(64.0);
        d6.setAllergenInfo("Contains Dairy");
        d6.setPickupInstructions("Collect from main kitchen dispatch counter");
        donationRepository.save(d6);
    }
}

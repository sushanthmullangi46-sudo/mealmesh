-- MealMesh Seed Data Migration V2
-- Comprehensive Realistic Demonstration Records

-- 1. Food Categories
INSERT INTO food_categories (id, name, description, ideal_storage_temp, is_perishable, shelf_life_hours) VALUES
(1, 'Cooked Meals', 'Freshly prepared rice, curries, chapati, dal, and warm meals', 'Above 60°C or Chilled Below 4°C', TRUE, 6),
(2, 'Bakery & Bread', 'Fresh loaves, buns, sandwich breads, pastries, and muffins', 'Room Temp 20-25°C', TRUE, 24),
(3, 'Packaged Dairy', 'Milk packets, curd, paneer, and cheese', 'Refrigerated 2-4°C', TRUE, 12),
(4, 'Fresh Produce', 'Seasonal raw vegetables, potatoes, onions, and fruits', 'Cool Dry Place 15°C', FALSE, 72),
(5, 'Dry Grains & Groceries', 'Uncooked rice, pulses, wheat flour, and edible oil', 'Dry Ambient Temp', FALSE, 720),
(6, 'Packaged Snacks', 'Biscuits, ready-to-eat pouches, energy bars, and juices', 'Ambient 25°C', FALSE, 168);

-- 2. Locations (Bengaluru City Real Coordinates for GIS & Route Optimization)
INSERT INTO locations (id, name, address, city, pincode, latitude, longitude, location_type) VALUES
-- Donor Locations
(1, 'ITC Gardenia Luxury Dining', '1, Residency Rd, Ashok Nagar', 'Bengaluru', '560025', 12.9667, 77.5960, 'DONOR'),
(2, 'The Leela Palace Kitchens', '23, HAL Old Airport Rd, Kodihalli', 'Bengaluru', '560008', 12.9606, 77.6484, 'DONOR'),
(3, 'Toit Craft Kitchen & Brewpub', '298, 100 Feet Rd, Indiranagar', 'Bengaluru', '560038', 12.9793, 77.6406, 'DONOR'),
(4, 'MTR Heritage Restaurant', '14, Lal Bagh Main Rd, Sudhama Nagar', 'Bengaluru', '560027', 12.9553, 77.5860, 'DONOR'),
(5, 'Paradise Food Court', 'CMH Road, Indiranagar', 'Bengaluru', '560038', 12.9780, 77.6380, 'DONOR'),
(6, 'Vidyarthi Bhavan South Tiffin', '32, Gandhi Bazaar Main Rd, Basavanagudi', 'Bengaluru', '560004', 12.9446, 77.5732, 'DONOR'),
(7, 'BigBasket Central Fulfillment Hub', 'Outer Ring Rd, Bellandur', 'Bengaluru', '560103', 12.9298, 77.6780, 'DONOR'),
(8, 'Infosys Employee Food Court', 'Electronics City Phase 1, Hosur Rd', 'Bengaluru', '560100', 12.8452, 77.6602, 'DONOR'),
(9, 'Taj West End Banquets', 'Race Course Rd, High Grounds', 'Bengaluru', '560001', 12.9850, 77.5828, 'DONOR'),
(10, 'Corner House Gourmet Bakery', 'Residency Rd, Shanthala Nagar', 'Bengaluru', '560025', 12.9680, 77.6010, 'DONOR'),
(11, 'Narayana Health Canteen', 'Bommasandra Industrial Area', 'Bengaluru', '560099', 12.8210, 77.6910, 'DONOR'),
(12, 'PES University Central Hostel', '100 Feet Ring Rd, Banashankari 3rd Stage', 'Bengaluru', '560085', 12.9344, 77.5345, 'DONOR'),
(13, 'Bikanervala Sweets & Savories', 'Koramangala 5th Block', 'Bengaluru', '560095', 12.9340, 77.6200, 'DONOR'),
(14, 'Metro Cash & Carry Wholesale', 'Yeshwanthpur Industrial Suburb', 'Bengaluru', '560022', 13.0210, 77.5500, 'DONOR'),
(15, 'Whitefield Marriott Event Ballroom', 'Plot No 75, EPIP Zone, Whitefield', 'Bengaluru', '560066', 12.9785, 77.7290, 'DONOR'),

-- NGO Dropoff Centers
(16, 'Akshaya Patra Megakitchen & Shelter', 'Hare Krishna Hill, Rajajinagar', 'Bengaluru', '560010', 13.0098, 77.5511, 'NGO'),
(17, 'Robin Hood Army East Hub', '12th Main Rd, HAL 2nd Stage, Indiranagar', 'Bengaluru', '560008', 12.9719, 77.6412, 'NGO'),
(18, 'Roti Bank Koramangala Relief Post', '80 Feet Rd, 4th Block, Koramangala', 'Bengaluru', '560034', 12.9360, 77.6270, 'NGO'),
(19, 'Hope For Humanity Orphanage', 'Richmond Town, Langford Gardens', 'Bengaluru', '560025', 12.9610, 77.6010, 'NGO'),
(20, 'Vatsalya Children Home & Shelter', 'JP Nagar 2nd Phase', 'Bengaluru', '560078', 12.9120, 77.5850, 'NGO'),
(21, 'Ananda Ashram Elder Care Trust', 'Jayanagar 4th Block', 'Bengaluru', '560011', 12.9280, 77.5830, 'NGO'),
(22, 'Asha Deepa Night Shelter', 'Krantivira Sangolli Rayanna Railway Station Area', 'Bengaluru', '560023', 12.9780, 77.5690, 'NGO'),
(23, 'Sankalp Slum Community Center', 'Shivajinagar Bus Depot Area', 'Bengaluru', '560051', 12.9860, 77.6030, 'NGO'),
(24, 'Sneha Sadan Destitute Home', 'Marathahalli Bridge Junction', 'Bengaluru', '560037', 12.9560, 77.7010, 'NGO'),
(25, 'Karuna Animal & Community Care', 'Hebbal Flyover Outer Ring Rd', 'Bengaluru', '560024', 13.0350, 77.5970, 'NGO');

-- 3. Users (Passwords: Admin@123, Password@123)
-- BCrypt: $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a (Admin@123)
-- BCrypt: $2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG (Password@123)
INSERT INTO users (id, username, email, password_hash, full_name, phone_number, role, is_active) VALUES
(1, 'admin', 'admin@mealmesh.org', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'MealMesh Chief Admin', '+91 98450 11001', 'ROLE_ADMIN', TRUE),

-- Donors (id: 2 to 16)
(2, 'donor_itc', 'manager@itcgardenia.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Rajesh Sharma', '+91 98451 22001', 'ROLE_DONOR', TRUE),
(3, 'donor_leela', 'banquets@theleela.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Kavita Menon', '+91 98451 22002', 'ROLE_DONOR', TRUE),
(4, 'donor_toit', 'kitchen@toitbrewpub.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Vikram Rao', '+91 98451 22003', 'ROLE_DONOR', TRUE),
(5, 'donor_mtr', 'orders@mtr1924.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Suresh Maiya', '+91 98451 22004', 'ROLE_DONOR', TRUE),
(6, 'donor_paradise', 'blrmanager@paradisefood.in', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Arun Kumar', '+91 98451 22005', 'ROLE_DONOR', TRUE),
(7, 'donor_vbhavan', 'contact@vidyarthibhavan.in', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Srinivas Adiga', '+91 98451 22006', 'ROLE_DONOR', TRUE),
(8, 'donor_bigbasket', 'csr@bigbasket.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Manoj Swaminathan', '+91 98451 22007', 'ROLE_DONOR', TRUE),
(9, 'donor_infosys', 'cafeteria@infosys.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Deepa Hegde', '+91 98451 22008', 'ROLE_DONOR', TRUE),
(10, 'donor_taj', 'westend@tajhotels.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Rohan Verghese', '+91 98451 22009', 'ROLE_DONOR', TRUE),
(11, 'donor_cornerhouse', 'admin@cornerhouseicecream.in', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Sunita Fernandes', '+91 98451 22010', 'ROLE_DONOR', TRUE),
(12, 'donor_narayana', 'foodservices@narayanahealth.org', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Dr. Arvind Sen', '+91 98451 22011', 'ROLE_DONOR', TRUE),
(13, 'donor_pes', 'hostelwarden@pes.edu', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Prof. B.N. Murthy', '+91 98451 22012', 'ROLE_DONOR', TRUE),
(14, 'donor_bikanervala', 'koramangala@bikanervala.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Gaurav Agarwal', '+91 98451 22013', 'ROLE_DONOR', TRUE),
(15, 'donor_metro', 'csr.india@metro.co.in', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Anita Deshmukh', '+91 98451 22014', 'ROLE_DONOR', TRUE),
(16, 'donor_marriott', 'banquets@marriottwhitefield.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Kunal Kapur', '+91 98451 22015', 'ROLE_DONOR', TRUE),

-- NGOs (id: 17 to 26)
(17, 'ngo_akshaya', 'director@akshayapatra.org', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Chanchalapathi Dasa', '+91 98452 33001', 'ROLE_NGO', TRUE),
(18, 'ngo_robinhood', 'bengaluru@robinhoodarmy.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Aarav Singhal', '+91 98452 33002', 'ROLE_NGO', TRUE),
(19, 'ngo_rotibank', 'help@rotibanktrust.org', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Mohan Das', '+91 98452 33003', 'ROLE_NGO', TRUE),
(20, 'ngo_hope', 'support@hopeforhumanity.in', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Sister Maria Goretti', '+91 98452 33004', 'ROLE_NGO', TRUE),
(21, 'ngo_vatsalya', 'trustee@vatsalyatrust.org', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Lakshmi Narayanan', '+91 98452 33005', 'ROLE_NGO', TRUE),
(22, 'ngo_ananda', 'seva@anandaashram.org', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Saraswathi Bai', '+91 98452 33006', 'ROLE_NGO', TRUE),
(23, 'ngo_ashadeepa', 'shelter@ashadeepa.in', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Dinesh Gowda', '+91 98452 33007', 'ROLE_NGO', TRUE),
(24, 'ngo_sankalp', 'care@sankalpcommunity.org', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Zoya Parveen', '+91 98452 33008', 'ROLE_NGO', TRUE),
(25, 'ngo_sneha', 'admin@snehasadan.org', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Father Joseph Kurian', '+91 98452 33009', 'ROLE_NGO', TRUE),
(26, 'ngo_karuna', 'info@karunacare.org', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Gautam Siddharth', '+91 98452 33010', 'ROLE_NGO', TRUE),

-- Volunteers (id: 27 to 38)
(27, 'vol_rahul', 'rahul.v@gmail.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Rahul Verma', '+91 98453 44001', 'ROLE_VOLUNTEER', TRUE),
(28, 'vol_priya', 'priya.nair@gmail.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Priya Nair', '+91 98453 44002', 'ROLE_VOLUNTEER', TRUE),
(29, 'vol_karthik', 'karthik.r@gmail.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Karthik Reddy', '+91 98453 44003', 'ROLE_VOLUNTEER', TRUE),
(30, 'vol_ananya', 'ananya.iyer@gmail.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Ananya Iyer', '+91 98453 44004', 'ROLE_VOLUNTEER', TRUE),
(31, 'vol_syed', 'syed.rehman@gmail.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Syed Rehman', '+91 98453 44005', 'ROLE_VOLUNTEER', TRUE),
(32, 'vol_pooja', 'pooja.sharma@gmail.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Pooja Sharma', '+91 98453 44006', 'ROLE_VOLUNTEER', TRUE),
(33, 'vol_amit', 'amit.patel@gmail.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Amit Patel', '+91 98453 44007', 'ROLE_VOLUNTEER', TRUE),
(34, 'vol_sneha', 'sneha.kulkarni@gmail.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Sneha Kulkarni', '+91 98453 44008', 'ROLE_VOLUNTEER', TRUE),
(35, 'vol_tarun', 'tarun.b@gmail.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Tarun Bhatia', '+91 98453 44009', 'ROLE_VOLUNTEER', TRUE),
(36, 'vol_divya', 'divya.menon@gmail.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Divya Menon', '+91 98453 44010', 'ROLE_VOLUNTEER', TRUE),
(37, 'vol_harish', 'harish.gowda@gmail.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Harish Gowda', '+91 98453 44011', 'ROLE_VOLUNTEER', TRUE),
(38, 'vol_farhan', 'farhan.ali@gmail.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGPEWi9GQOmGmwGAG', 'Farhan Ali', '+91 98453 44012', 'ROLE_VOLUNTEER', TRUE);

-- 4. Donor Profiles
INSERT INTO donor_profiles (id, user_id, organization_name, organization_type, fssai_license_number, contact_person, location_id) VALUES
(1, 2, 'ITC Gardenia Five Star Dining', 'HOTEL', '11220334000101', 'Chef Rajesh Sharma', 1),
(2, 3, 'The Leela Palace Royal Kitchen', 'HOTEL', '11220334000102', 'Kavita Menon', 2),
(3, 4, 'Toit Craft Gastropub', 'RESTAURANT', '11220334000103', 'Vikram Rao', 3),
(4, 5, 'Mavalli Tiffin Room (MTR)', 'RESTAURANT', '11220334000104', 'Suresh Maiya', 4),
(5, 6, 'Paradise Biryani Express', 'RESTAURANT', '11220334000105', 'Arun Kumar', 5),
(6, 7, 'Vidyarthi Bhavan Tiffin Services', 'RESTAURANT', '11220334000106', 'Srinivas Adiga', 6),
(7, 8, 'BigBasket Perishables Depot', 'SUPERMARKET', '11220334000107', 'Manoj Swaminathan', 7),
(8, 9, 'Infosys Food Court Complex', 'HOSTEL', '11220334000108', 'Deepa Hegde', 8),
(9, 10, 'Taj West End Convention Center', 'EVENT', '11220334000109', 'Rohan Verghese', 9),
(10, 11, 'Corner House Artisanal Bakehouse', 'RESTAURANT', '11220334000110', 'Sunita Fernandes', 10),
(11, 12, 'Narayana Health Hospital Canteen', 'HOSTEL', '11220334000111', 'Dr. Arvind Sen', 11),
(12, 13, 'PES University Central Mess', 'HOSTEL', '11220334000112', 'Prof. B.N. Murthy', 12),
(13, 14, 'Bikanervala Sweets & Fast Food', 'RESTAURANT', '11220334000113', 'Gaurav Agarwal', 13),
(14, 15, 'Metro Cash & Carry Wholesale', 'SUPERMARKET', '11220334000114', 'Anita Deshmukh', 14),
(15, 16, 'Whitefield Marriott Grand Ballroom', 'EVENT', '11220334000115', 'Kunal Kapur', 15);

-- 5. NGO Profiles
INSERT INTO ngo_profiles (id, user_id, organization_name, registration_number, verification_status, max_capacity_kg, current_capacity_kg, beneficiary_count, location_id, verified_at) VALUES
(1, 17, 'Akshaya Patra Foundation', 'KA/2000/004521', 'VERIFIED', 2000.0, 1850.0, 1500, 16, CURRENT_TIMESTAMP),
(2, 18, 'Robin Hood Army Bengaluru Chapter', 'KA/2015/009812', 'VERIFIED', 800.0, 720.0, 600, 17, CURRENT_TIMESTAMP),
(3, 19, 'Bengaluru Roti Bank Trust', 'KA/2018/012431', 'VERIFIED', 1000.0, 910.0, 750, 18, CURRENT_TIMESTAMP),
(4, 20, 'Hope For Humanity Children Home', 'KA/2012/006541', 'VERIFIED', 400.0, 360.0, 250, 19, CURRENT_TIMESTAMP),
(5, 21, 'Vatsalya Destitute Child Trust', 'KA/2016/008743', 'VERIFIED', 350.0, 300.0, 180, 20, CURRENT_TIMESTAMP),
(6, 22, 'Ananda Ashram Senior Care', 'KA/2011/003412', 'VERIFIED', 300.0, 240.0, 120, 21, CURRENT_TIMESTAMP),
(7, 23, 'Asha Deepa City Night Shelter', 'KA/2019/014521', 'VERIFIED', 600.0, 520.0, 400, 22, CURRENT_TIMESTAMP),
(8, 24, 'Sankalp Slum Nutrition Initiative', 'KA/2021/018742', 'VERIFIED', 500.0, 410.0, 320, 23, CURRENT_TIMESTAMP),
(9, 25, 'Sneha Sadan Rehabilitation Post', 'KA/2014/007651', 'VERIFIED', 450.0, 380.0, 220, 24, CURRENT_TIMESTAMP),
(10, 26, 'Karuna Animal & Community Trust', 'KA/2022/020111', 'PENDING', 250.0, 250.0, 100, 25, NULL);

-- 6. Volunteer Profiles
INSERT INTO volunteer_profiles (id, user_id, transport_type, vehicle_number, max_load_capacity_kg, is_available, current_location_id, total_deliveries_completed) VALUES
(1, 27, 'VAN', 'KA-01-MJ-4512', 400.0, TRUE, 1, 48),
(2, 28, 'SCOOTER', 'KA-03-EX-8821', 40.0, TRUE, 3, 35),
(3, 29, 'CAR', 'KA-05-NB-1029', 150.0, TRUE, 2, 62),
(4, 30, 'BIKE', 'KA-04-HY-9921', 35.0, TRUE, 4, 28),
(5, 31, 'MINI_TRUCK', 'KA-51-TR-7711', 800.0, TRUE, 7, 74),
(6, 32, 'SCOOTER', 'KA-02-KL-3412', 45.0, TRUE, 5, 41),
(7, 33, 'VAN', 'KA-01-PQ-5523', 450.0, TRUE, 9, 53),
(8, 34, 'BIKE', 'KA-03-AB-6612', 30.0, TRUE, 10, 22),
(9, 35, 'CAR', 'KA-04-CD-7744', 160.0, TRUE, 8, 39),
(10, 36, 'SCOOTER', 'KA-05-EF-8899', 40.0, TRUE, 13, 31),
(11, 37, 'MINI_TRUCK', 'KA-53-GH-9900', 900.0, TRUE, 14, 86),
(12, 38, 'BIKE', 'KA-02-JK-1122', 35.0, TRUE, 15, 19);

-- 7. Surplus Food Donations (30 realistic records across Bengaluru)
INSERT INTO donations (id, donor_id, category_id, food_name, description, quantity_kg, remaining_quantity_kg, servings_count, dietary_type, allergen_info, preparation_time, expiry_time, urgency_level, pickup_address, pickup_latitude, pickup_longitude, status) VALUES
(1, 1, 1, 'Vegetable Biryani & Mirchi Ka Salan', 'Freshly prepared aromatic basmati rice with mixed vegetables and rich gravy from wedding banquet', 45.0, 45.0, 90, 'VEG', 'Contains Cashews, Dairy', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP + INTERVAL '4 hours', 'CRITICAL', '1, Residency Rd, Ashok Nagar, Bengaluru', 12.9667, 77.5960, 'AVAILABLE'),
(2, 2, 1, 'Paneer Butter Masala & Roti', 'North Indian style fresh cottage cheese curry with 120 butter rotis in thermal insulated containers', 35.0, 35.0, 70, 'VEG', 'Contains Dairy, Gluten', CURRENT_TIMESTAMP - INTERVAL '1 hours', CURRENT_TIMESTAMP + INTERVAL '5 hours', 'HIGH', '23, HAL Old Airport Rd, Kodihalli, Bengaluru', 12.9606, 77.6484, 'AVAILABLE'),
(3, 3, 2, 'Assorted Artisan Breads & Sourdough', 'Whole wheat sourdough boules, focaccia, and dinner rolls baked this morning', 25.0, 25.0, 80, 'VEGAN', 'Gluten', CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP + INTERVAL '18 hours', 'MEDIUM', '298, 100 Feet Rd, Indiranagar, Bengaluru', 12.9793, 77.6406, 'AVAILABLE'),
(4, 4, 1, 'Bisi Bele Bath & Boondi', 'Traditional Karnataka lentil rice dish prepared with pure ghee and crisp boondi packets', 50.0, 0.0, 120, 'VEG', 'Contains Peanuts, Dairy', CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP + INTERVAL '3 hours', 'CRITICAL', '14, Lal Bagh Main Rd, Sudhama Nagar, Bengaluru', 12.9553, 77.5860, 'DELIVERED'),
(5, 5, 1, 'Hyderabadi Chicken Biryani', 'Mildly spiced dum cooked chicken biryani in sealed food-grade steel vessels', 60.0, 60.0, 100, 'NON_VEG', 'Dairy', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP + INTERVAL '4 hours', 'CRITICAL', 'CMH Road, Indiranagar, Bengaluru', 12.9780, 77.6380, 'AVAILABLE'),
(6, 6, 1, 'Masala Dosa Batter & Sambar', 'Freshly fermented urad dal batter and piping hot vegetable sambar', 40.0, 40.0, 85, 'VEG', 'Mustard seeds', CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP + INTERVAL '12 hours', 'MEDIUM', '32, Gandhi Bazaar Main Rd, Basavanagudi, Bengaluru', 12.9446, 77.5732, 'AVAILABLE'),
(7, 7, 4, 'Assorted Fresh Apples & Oranges', 'Surplus crate of farm fresh grade-A apples and sweet oranges suitable for distribution', 120.0, 120.0, 250, 'VEGAN', 'None', CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP + INTERVAL '48 hours', 'LOW', 'Outer Ring Rd, Bellandur, Bengaluru', 12.9298, 77.6780, 'AVAILABLE'),
(8, 8, 1, 'South Indian Meal Trays (Rice, Sambar, Poriyal)', 'Individually packed hygienic lunch trays from corporate tech park cafeteria', 80.0, 80.0, 160, 'VEG', 'None', CURRENT_TIMESTAMP - INTERVAL '1 hours', CURRENT_TIMESTAMP + INTERVAL '4 hours', 'HIGH', 'Electronics City Phase 1, Hosur Rd, Bengaluru', 12.8452, 77.6602, 'AVAILABLE'),
(9, 9, 1, 'Dal Makhani & Jeera Rice', 'Slow cooked black lentils with cream and butter accompanied by fragrant cumin rice', 55.0, 55.0, 110, 'VEG', 'Dairy', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP + INTERVAL '5 hours', 'HIGH', 'Race Course Rd, High Grounds, Bengaluru', 12.9850, 77.5828, 'AVAILABLE'),
(10, 10, 2, 'Gourmet Pastries & Banana Tea Cakes', 'Eggless dark chocolate pastries and freshly sliced banana walnut tea cakes', 30.0, 30.0, 90, 'VEG', 'Gluten, Walnuts', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP + INTERVAL '20 hours', 'MEDIUM', 'Residency Rd, Shanthala Nagar, Bengaluru', 12.9680, 77.6010, 'AVAILABLE'),
(11, 11, 1, 'Steamed Idli with Coconut Chutney', 'Soft steamed rice cakes packed in thermal boxes with freshly ground chutney', 40.0, 0.0, 100, 'VEG', 'Coconut', CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP + INTERVAL '2 hours', 'CRITICAL', 'Bommasandra Industrial Area, Bengaluru', 12.8210, 77.6910, 'DELIVERED'),
(12, 12, 1, 'Rajma Chawal Combo Meal', 'Punjabi style red kidney bean curry with steamed basmati rice from student hostel mess', 65.0, 65.0, 130, 'VEG', 'None', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP + INTERVAL '4 hours', 'HIGH', '100 Feet Ring Rd, Banashankari 3rd Stage, Bengaluru', 12.9344, 77.5345, 'AVAILABLE'),
(13, 13, 6, 'Assorted Mathri, Namkeen & Samosa', 'Crisp savory snack boxes in hygienic airtight packs', 35.0, 35.0, 110, 'VEG', 'Gluten', CURRENT_TIMESTAMP - INTERVAL '10 hours', CURRENT_TIMESTAMP + INTERVAL '72 hours', 'LOW', 'Koramangala 5th Block, Bengaluru', 12.9340, 77.6200, 'AVAILABLE'),
(14, 14, 5, 'Sona Masoori Rice & Toor Dal Sacks', 'Wholesale surplus staple grains in 25kg sealed jute bags', 200.0, 200.0, 450, 'VEGAN', 'None', CURRENT_TIMESTAMP - INTERVAL '12 hours', CURRENT_TIMESTAMP + INTERVAL '300 hours', 'LOW', 'Yeshwanthpur Industrial Suburb, Bengaluru', 13.0210, 77.5500, 'AVAILABLE'),
(15, 15, 1, 'Continental Pasta Arrabiata & Garlic Bread', 'Penne pasta in rich tomato basil sauce with oven toasted herb garlic baguettes', 40.0, 40.0, 75, 'VEG', 'Gluten, Garlic', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP + INTERVAL '4 hours', 'HIGH', 'Plot No 75, EPIP Zone, Whitefield, Bengaluru', 12.9785, 77.7290, 'AVAILABLE'),
(16, 1, 3, 'Pasteurized Toned Milk Pouches', '500ml fresh milk pouches from breakfast service refrigerated at 3°C', 30.0, 30.0, 60, 'VEG', 'Dairy', CURRENT_TIMESTAMP - INTERVAL '1 hours', CURRENT_TIMESTAMP + INTERVAL '10 hours', 'HIGH', '1, Residency Rd, Ashok Nagar, Bengaluru', 12.9667, 77.5960, 'AVAILABLE'),
(17, 2, 1, 'Grilled Chicken Breast with Steamed Veggies', 'Herb roasted chicken breast fillets with carrots, broccoli, and mashed potatoes', 28.0, 28.0, 50, 'NON_VEG', 'Dairy', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP + INTERVAL '4 hours', 'CRITICAL', '23, HAL Old Airport Rd, Kodihalli, Bengaluru', 12.9606, 77.6484, 'AVAILABLE'),
(18, 3, 2, 'Multigrain Sandwich Loaves', 'Freshly sliced multigrain bakery loaves packed in paper bags', 20.0, 20.0, 60, 'VEGAN', 'Gluten, Seeds', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP + INTERVAL '24 hours', 'MEDIUM', '298, 100 Feet Rd, Indiranagar, Bengaluru', 12.9793, 77.6406, 'AVAILABLE'),
(19, 4, 1, 'Vegetable Pulao & Raita', 'Mild fragrant rice prepared with seasonal vegetables and cumin yogurt', 42.0, 0.0, 80, 'VEG', 'Dairy', CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP + INTERVAL '2 hours', 'CRITICAL', '14, Lal Bagh Main Rd, Sudhama Nagar, Bengaluru', 12.9553, 77.5860, 'DELIVERED'),
(20, 5, 1, 'Mutton Biryani & Boondi Raita', 'Special Hyderabadi mutton biryani portions in hot case insulated canisters', 48.0, 48.0, 80, 'NON_VEG', 'Dairy', CURRENT_TIMESTAMP - INTERVAL '1 hours', CURRENT_TIMESTAMP + INTERVAL '4 hours', 'CRITICAL', 'CMH Road, Indiranagar, Bengaluru', 12.9780, 77.6380, 'AVAILABLE'),
(21, 6, 1, 'Upma & Kesari Bath (Chow Chow Bath)', 'Classic roasted semolina upma with saffron semolina sweet pudding', 30.0, 30.0, 70, 'VEG', 'Gluten, Cashews', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP + INTERVAL '5 hours', 'HIGH', '32, Gandhi Bazaar Main Rd, Basavanagudi, Bengaluru', 12.9446, 77.5732, 'AVAILABLE'),
(22, 7, 4, 'Fresh Bananas & Guavas', 'Ripe Cavendish bananas and organic pink guavas ready to eat', 75.0, 75.0, 150, 'VEGAN', 'None', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP + INTERVAL '36 hours', 'LOW', 'Outer Ring Rd, Bellandur, Bengaluru', 12.9298, 77.6780, 'AVAILABLE'),
(23, 8, 1, 'Kadhi Pakoda & Steamed Rice', 'Gram flour yogurt kadhi with dumplings and steamed rice', 50.0, 50.0, 100, 'VEG', 'Dairy', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP + INTERVAL '4 hours', 'HIGH', 'Electronics City Phase 1, Hosur Rd, Bengaluru', 12.8452, 77.6602, 'AVAILABLE'),
(24, 9, 1, 'Methi Malai Matar & Naan', 'Creamy fenugreek and green pea curry with clay oven tandoori naans', 38.0, 38.0, 75, 'VEG', 'Dairy, Gluten', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP + INTERVAL '4 hours', 'CRITICAL', 'Race Course Rd, High Grounds, Bengaluru', 12.9850, 77.5828, 'AVAILABLE'),
(25, 10, 2, 'Croissants & Danish Pastries', 'Flaky butter croissants and vanilla cream filled danish pastries', 22.0, 22.0, 65, 'VEG', 'Gluten, Dairy', CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP + INTERVAL '18 hours', 'MEDIUM', 'Residency Rd, Shanthala Nagar, Bengaluru', 12.9680, 77.6010, 'AVAILABLE'),
(26, 11, 1, 'Khichdi with Ghee & Pickle', 'Nutritious yellow moong dal and rice khichdi prepared under clinical hygiene', 45.0, 45.0, 90, 'VEG', 'Dairy', CURRENT_TIMESTAMP - INTERVAL '1 hours', CURRENT_TIMESTAMP + INTERVAL '5 hours', 'HIGH', 'Bommasandra Industrial Area, Bengaluru', 12.8210, 77.6910, 'AVAILABLE'),
(27, 12, 1, 'Chole Bhature Lunch Packs', 'Spicy chickpea masala with puffy deep-fried leavened bread', 55.0, 55.0, 95, 'VEG', 'Gluten', CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP + INTERVAL '4 hours', 'HIGH', '100 Feet Ring Rd, Banashankari 3rd Stage, Bengaluru', 12.9344, 77.5345, 'AVAILABLE'),
(28, 13, 6, 'Kaju Katli & Dry Fruit Ladoos', 'Gourmet Indian sweets rich in dry fruits and cardamom in sealed festive gift boxes', 25.0, 25.0, 100, 'VEG', 'Cashews, Almonds', CURRENT_TIMESTAMP - INTERVAL '12 hours', CURRENT_TIMESTAMP + INTERVAL '120 hours', 'LOW', 'Koramangala 5th Block, Bengaluru', 12.9340, 77.6200, 'AVAILABLE'),
(29, 14, 5, 'Wheat Flour & Sugar Packs', 'Chakki fresh whole wheat flour 10kg bags and crystal sugar bags', 150.0, 150.0, 300, 'VEGAN', 'Gluten', CURRENT_TIMESTAMP - INTERVAL '24 hours', CURRENT_TIMESTAMP + INTERVAL '400 hours', 'LOW', 'Yeshwanthpur Industrial Suburb, Bengaluru', 13.0210, 77.5500, 'AVAILABLE'),
(30, 15, 1, 'Mixed Vegetable Hakka Noodles & Manchurian', 'Wok tossed vegetables noodles with crispy vegetable balls in tangy ginger-garlic gravy', 40.0, 40.0, 80, 'VEGAN', 'Gluten, Soy', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP + INTERVAL '4 hours', 'CRITICAL', 'Plot No 75, EPIP Zone, Whitefield, Bengaluru', 12.9785, 77.7290, 'AVAILABLE');

-- 8. NGO Food Requests (20 records)
INSERT INTO ngo_requests (id, ngo_id, requested_quantity_kg, target_servings, preferred_category_id, dietary_preference, urgency_level, status) VALUES
(1, 1, 150.0, 300, 1, 'VEG', 'HIGH', 'PENDING'),
(2, 2, 60.0, 120, 1, 'ANY', 'CRITICAL', 'PENDING'),
(3, 3, 50.0, 100, 1, 'VEG', 'HIGH', 'PENDING'),
(4, 4, 30.0, 60, 1, 'VEG', 'MEDIUM', 'PENDING'),
(5, 5, 25.0, 50, 1, 'VEG', 'HIGH', 'PENDING'),
(6, 6, 20.0, 40, 1, 'VEG', 'MEDIUM', 'PENDING'),
(7, 7, 70.0, 140, 1, 'ANY', 'CRITICAL', 'PENDING'),
(8, 8, 45.0, 90, 1, 'VEG', 'HIGH', 'PENDING'),
(9, 9, 35.0, 70, 1, 'ANY', 'MEDIUM', 'PENDING'),
(10, 1, 80.0, 160, 2, 'VEGAN', 'LOW', 'PENDING'),
(11, 2, 40.0, 80, 2, 'VEG', 'MEDIUM', 'PENDING'),
(12, 3, 60.0, 120, 4, 'VEGAN', 'LOW', 'PENDING'),
(13, 4, 25.0, 50, 3, 'VEG', 'HIGH', 'PENDING'),
(14, 5, 20.0, 40, 4, 'VEGAN', 'LOW', 'PENDING'),
(15, 6, 15.0, 30, 3, 'VEG', 'MEDIUM', 'PENDING'),
(16, 7, 80.0, 160, 1, 'ANY', 'CRITICAL', 'PENDING'),
(17, 8, 30.0, 60, 2, 'VEG', 'LOW', 'PENDING'),
(18, 9, 40.0, 80, 1, 'VEG', 'HIGH', 'PENDING'),
(19, 1, 100.0, 200, 5, 'VEGAN', 'LOW', 'PENDING'),
(20, 3, 35.0, 70, 6, 'VEG', 'LOW', 'PENDING');

-- 9. Completed & In-Flight Allocations and Deliveries (15 records)
INSERT INTO allocations (id, donation_id, ngo_id, request_id, allocated_quantity_kg, matching_score, allocation_reason, status) VALUES
(1, 4, 3, 3, 50.0, 94.5, 'Optimal proximity to Sudhama Nagar (3.8 km), high urgency match, full capacity available', 'COMPLETED'),
(2, 11, 4, 4, 40.0, 91.2, 'Nearest children shelter to Bommasandra corridor with active breakfast demand', 'COMPLETED'),
(3, 19, 6, 6, 42.0, 88.7, 'Senior citizen dietary compatibility (low spice veg pulao), distance 4.2 km', 'COMPLETED');

INSERT INTO deliveries (id, allocation_id, volunteer_id, pickup_location_id, dropoff_location_id, estimated_distance_km, estimated_duration_minutes, actual_distance_km, actual_duration_minutes, status, pickup_time, delivery_time, notes) VALUES
(1, 1, 1, 4, 18, 3.8, 14.0, 3.9, 15.0, 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours', 'Delivered safely in thermal containers, signed by Roti Bank coordinator'),
(2, 2, 5, 11, 19, 14.2, 32.0, 14.5, 35.0, 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours', 'Delivered to Hope orphanage mess committee'),
(3, 3, 2, 4, 21, 4.2, 16.0, 4.1, 15.0, 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '3 hours', 'Delivered to Ananda Ashram elder care center');

-- 10. Beneficiary Distribution Records
INSERT INTO beneficiary_distributions (id, ngo_id, delivery_id, food_category, quantity_distributed_kg, beneficiaries_served, distribution_center_name, distribution_date, notes) VALUES
(1, 3, 1, 'Cooked Meals', 50.0, 120, 'Koramangala Community Slum Post', CURRENT_TIMESTAMP - INTERVAL '2 hours', 'Served hot meals to daily wage worker families'),
(2, 4, 2, 'Cooked Meals', 40.0, 100, 'Richmond Town Orphanage Dining Hall', CURRENT_TIMESTAMP - INTERVAL '2 hours', 'Breakfast distribution for residential children'),
(3, 6, 3, 'Cooked Meals', 42.0, 80, 'Jayanagar Senior Citizens Care Center', CURRENT_TIMESTAMP - INTERVAL '3 hours', 'Nutritious lunch meal served to elderly residents');

-- 11. Initial Notifications
INSERT INTO notifications (user_id, title, message, notification_type, is_read) VALUES
(2, 'Donation Verified', 'Your donation of 45kg Vegetable Biryani has been verified and posted to the real-time rescue network.', 'DONATION_ALERT', FALSE),
(17, 'Critical Food Alert', '45kg of Vegetable Biryani is available 3.2km away expiring in 4 hours. Tap to review matching score.', 'EXPIRY_WARNING', FALSE),
(27, 'Delivery Assigned', 'New rescue assignment: 50kg Bisi Bele Bath from MTR Heritage to Roti Bank Koramangala.', 'DELIVERY_UPDATE', TRUE);

-- 12. Initial Audit Logs
INSERT INTO audit_logs (user_id, action, entity_name, entity_id, old_value, new_value, ip_address) VALUES
(1, 'SYSTEM_INITIALIZATION', 'SYSTEM', 0, NULL, 'MealMesh production seed dataset loaded with 15 donors, 10 NGOs, 12 volunteers, 30 donations', '127.0.0.1'),
(1, 'NGO_VERIFICATION', 'NGO_PROFILE', 1, 'PENDING', 'VERIFIED', '127.0.0.1'),
(1, 'NGO_VERIFICATION', 'NGO_PROFILE', 2, 'PENDING', 'VERIFIED', '127.0.0.1'),
(1, 'ALLOCATION_CREATED', 'ALLOCATION', 1, NULL, 'Allocated 50kg donation #4 to NGO #3 via Greedy Matching Engine (Score: 94.5)', '127.0.0.1');

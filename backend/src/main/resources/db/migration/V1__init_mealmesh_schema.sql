-- MealMesh PostgreSQL Schema Migration V1
-- Enterprise Food Rescue & Redistribution System

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'ROLE_DONOR', 'ROLE_NGO', 'ROLE_VOLUNTEER', 'ROLE_ADMIN'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(80) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_type VARCHAR(50) NOT NULL, -- 'DONOR', 'NGO', 'WAREHOUSE', 'DISTRIBUTION_POINT'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donor_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    organization_name VARCHAR(150) NOT NULL,
    organization_type VARCHAR(50) NOT NULL, -- 'RESTAURANT', 'HOTEL', 'SUPERMARKET', 'HOSTEL', 'EVENT'
    fssai_license_number VARCHAR(50),
    contact_person VARCHAR(100) NOT NULL,
    location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ngo_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    organization_name VARCHAR(150) NOT NULL,
    registration_number VARCHAR(80) NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED'
    max_capacity_kg DOUBLE PRECISION NOT NULL DEFAULT 500.0,
    current_capacity_kg DOUBLE PRECISION NOT NULL DEFAULT 500.0,
    beneficiary_count INT NOT NULL DEFAULT 100,
    location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS volunteer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    transport_type VARCHAR(50) NOT NULL, -- 'BIKE', 'SCOOTER', 'CAR', 'VAN', 'MINI_TRUCK'
    vehicle_number VARCHAR(30),
    max_load_capacity_kg DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    current_location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    total_deliveries_completed INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS food_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    description TEXT,
    ideal_storage_temp VARCHAR(50),
    is_perishable BOOLEAN NOT NULL DEFAULT TRUE,
    shelf_life_hours INT NOT NULL DEFAULT 6
);

CREATE TABLE IF NOT EXISTS donations (
    id BIGSERIAL PRIMARY KEY,
    donor_id BIGINT NOT NULL REFERENCES donor_profiles(id) ON DELETE RESTRICT,
    category_id BIGINT NOT NULL REFERENCES food_categories(id) ON DELETE RESTRICT,
    food_name VARCHAR(150) NOT NULL,
    description TEXT,
    quantity_kg DOUBLE PRECISION NOT NULL,
    remaining_quantity_kg DOUBLE PRECISION NOT NULL,
    servings_count INT NOT NULL,
    dietary_type VARCHAR(30) NOT NULL DEFAULT 'VEG', -- 'VEG', 'NON_VEG', 'VEGAN', 'JAIN'
    allergen_info VARCHAR(255),
    preparation_time TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    urgency_level VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    pickup_address TEXT NOT NULL,
    pickup_latitude DOUBLE PRECISION NOT NULL,
    pickup_longitude DOUBLE PRECISION NOT NULL,
    image_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'RESERVED', 'PICKED_UP', 'DELIVERED', 'EXPIRED', 'CANCELLED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ngo_requests (
    id BIGSERIAL PRIMARY KEY,
    ngo_id BIGINT NOT NULL REFERENCES ngo_profiles(id) ON DELETE CASCADE,
    requested_quantity_kg DOUBLE PRECISION NOT NULL,
    target_servings INT NOT NULL,
    preferred_category_id BIGINT REFERENCES food_categories(id) ON DELETE SET NULL,
    dietary_preference VARCHAR(30) DEFAULT 'ANY',
    urgency_level VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'FULFILLED', 'PARTIALLY_FULFILLED', 'CANCELLED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS allocations (
    id BIGSERIAL PRIMARY KEY,
    donation_id BIGINT NOT NULL REFERENCES donations(id) ON DELETE RESTRICT,
    ngo_id BIGINT NOT NULL REFERENCES ngo_profiles(id) ON DELETE RESTRICT,
    request_id BIGINT REFERENCES ngo_requests(id) ON DELETE SET NULL,
    allocated_quantity_kg DOUBLE PRECISION NOT NULL,
    matching_score DOUBLE PRECISION NOT NULL,
    allocation_reason TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'REVOKED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deliveries (
    id BIGSERIAL PRIMARY KEY,
    allocation_id BIGINT NOT NULL REFERENCES allocations(id) ON DELETE RESTRICT,
    volunteer_id BIGINT REFERENCES volunteer_profiles(id) ON DELETE SET NULL,
    pickup_location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    dropoff_location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    estimated_distance_km DOUBLE PRECISION NOT NULL,
    estimated_duration_minutes DOUBLE PRECISION NOT NULL,
    actual_distance_km DOUBLE PRECISION,
    actual_duration_minutes DOUBLE PRECISION,
    status VARCHAR(30) NOT NULL DEFAULT 'ASSIGNED', -- 'ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'FAILED'
    pickup_time TIMESTAMP WITH TIME ZONE,
    delivery_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_stops (
    id BIGSERIAL PRIMARY KEY,
    delivery_id BIGINT NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    stop_order INT NOT NULL,
    location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    stop_type VARCHAR(30) NOT NULL, -- 'PICKUP', 'DROPOFF', 'WAYPOINT'
    arrival_time TIMESTAMP WITH TIME ZONE,
    departure_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS beneficiary_distributions (
    id BIGSERIAL PRIMARY KEY,
    ngo_id BIGINT NOT NULL REFERENCES ngo_profiles(id) ON DELETE RESTRICT,
    delivery_id BIGINT REFERENCES deliveries(id) ON DELETE SET NULL,
    food_category VARCHAR(80) NOT NULL,
    quantity_distributed_kg DOUBLE PRECISION NOT NULL,
    beneficiaries_served INT NOT NULL,
    distribution_center_name VARCHAR(150) NOT NULL,
    distribution_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'DONATION_ALERT', 'ALLOCATION_CONFIRMED', 'DELIVERY_UPDATE', 'EXPIRY_WARNING'
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    delivery_id BIGINT NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    reviewer_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewed_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(80) NOT NULL,
    entity_id BIGINT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Essential Performance Indexes
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_expiry ON donations(expiry_time);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_ngo_requests_status ON ngo_requests(status);
CREATE INDEX IF NOT EXISTS idx_allocations_donation ON allocations(donation_id);
CREATE INDEX IF NOT EXISTS idx_allocations_ngo ON allocations(ngo_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_volunteer ON deliveries(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

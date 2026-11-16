package com.mealmesh.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "donor_profiles")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DonorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "organization_name", nullable = false)
    private String organizationName;

    @Column(name = "organization_type", nullable = false)
    private String organizationType; // "RESTAURANT", "HOTEL", "SUPERMARKET", "HOSTEL", "CATERER"

    @Column(name = "fssai_license")
    private String fssaiLicense;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "hygiene_rating")
    private double hygieneRating = 4.5;

    public DonorProfile() {}

    public DonorProfile(UUID id, User user, String organizationName, String organizationType, String fssaiLicense, String contactPerson, double hygieneRating) {
        this.id = id;
        this.user = user;
        this.organizationName = organizationName;
        this.organizationType = organizationType;
        this.fssaiLicense = fssaiLicense;
        this.contactPerson = contactPerson;
        this.hygieneRating = hygieneRating;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getOrganizationType() { return organizationType; }
    public void setOrganizationType(String organizationType) { this.organizationType = organizationType; }

    public String getFssaiLicense() { return fssaiLicense; }
    public void setFssaiLicense(String fssaiLicense) { this.fssaiLicense = fssaiLicense; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public double getHygieneRating() { return hygieneRating; }
    public void setHygieneRating(double hygieneRating) { this.hygieneRating = hygieneRating; }
}

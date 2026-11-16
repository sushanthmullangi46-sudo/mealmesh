package com.mealmesh.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "food_categories")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FoodCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(name = "shelf_life_hours_default")
    private int shelfLifeHoursDefault = 6;

    @Column(nullable = false)
    private String perishability = "HIGH"; // "VERY_HIGH", "HIGH", "MEDIUM", "LOW"

    public FoodCategory() {}

    public FoodCategory(UUID id, String name, String description, int shelfLifeHoursDefault, String perishability) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.shelfLifeHoursDefault = shelfLifeHoursDefault;
        this.perishability = perishability;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getShelfLifeHoursDefault() { return shelfLifeHoursDefault; }
    public void setShelfLifeHoursDefault(int shelfLifeHoursDefault) { this.shelfLifeHoursDefault = shelfLifeHoursDefault; }

    public String getPerishability() { return perishability; }
    public void setPerishability(String perishability) { this.perishability = perishability; }
}

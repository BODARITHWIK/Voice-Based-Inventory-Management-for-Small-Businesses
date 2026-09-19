package com.swaranidhi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false)
    private String name;

    private String description;

    public Category() {}

    public Category(Business business, String name) {
        this.business = business;
        this.name = name;
    }

    public Category(Business business, String name, String description) {
        this.business = business;
        this.name = name;
        this.description = description;
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Business getBusiness() { return business; }
    public void setBusiness(Business business) { this.business = business; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

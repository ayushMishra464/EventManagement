package com.eventmanagement.entity;

// ============================================
// Member 2: Venue entity - venue & resource management
// ============================================

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "venues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;

    private String city;

    private String state;

    private String zipCode;

    private Integer capacity;

    @Column(length = 1000)
    private String amenities;

    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Event> events = new ArrayList<>();
}

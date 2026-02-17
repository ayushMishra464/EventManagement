package com.eventmanagement.repository;

// ============================================
// Member 3: Venue repository - data access layer
// ============================================

import com.eventmanagement.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VenueRepository extends JpaRepository<Venue, Long> {

    List<Venue> findByIsActiveTrue();

    List<Venue> findByCity(String city);

    List<Venue> findByNameContainingIgnoreCase(String name);
}

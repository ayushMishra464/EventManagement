package com.eventmanagement.service;

// ============================================
// Member 4: Venue service - business logic with RBAC
// ============================================

import com.eventmanagement.dto.VenueDTO;
import com.eventmanagement.entity.User;
import com.eventmanagement.entity.Venue;
import com.eventmanagement.repository.VenueRepository;
import com.eventmanagement.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VenueService {

    private final VenueRepository venueRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<VenueDTO> findAll() {
        return venueRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VenueDTO> findActiveVenues() {
        return venueRepository.findByIsActiveTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VenueDTO findById(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found with id: " + id));
        return toDTO(venue);
    }

    @Transactional
    public VenueDTO create(VenueDTO dto) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }
        // Only ADMIN can create venues
        if (!securityUtils.isAdmin()) {
            throw new RuntimeException("Only administrators can create venues");
        }
        Venue venue = toEntity(dto);
        venue.setCreatedBy(currentUser);
        venue = venueRepository.save(venue);
        return toDTO(venue);
    }

    @Transactional
    public VenueDTO update(Long id, VenueDTO dto) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }
        // Only ADMIN can update venues
        if (!securityUtils.isAdmin()) {
            throw new RuntimeException("Only administrators can update venues");
        }
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found with id: " + id));
        venue.setName(dto.getName());
        venue.setAddress(dto.getAddress());
        venue.setCity(dto.getCity());
        venue.setState(dto.getState());
        venue.setZipCode(dto.getZipCode());
        venue.setCapacity(dto.getCapacity());
        venue.setAmenities(dto.getAmenities());
        venue.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        venue = venueRepository.save(venue);
        return toDTO(venue);
    }

    @Transactional
    public void deleteById(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }
        // Only ADMIN can delete venues
        if (!securityUtils.isAdmin()) {
            throw new RuntimeException("Only administrators can delete venues");
        }
        if (!venueRepository.existsById(id)) {
            throw new RuntimeException("Venue not found with id: " + id);
        }
        venueRepository.deleteById(id);
    }

    private VenueDTO toDTO(Venue venue) {
        return VenueDTO.builder()
                .id(venue.getId())
                .name(venue.getName())
                .address(venue.getAddress())
                .city(venue.getCity())
                .state(venue.getState())
                .zipCode(venue.getZipCode())
                .capacity(venue.getCapacity())
                .amenities(venue.getAmenities())
                .isActive(venue.getIsActive())
                .build();
    }

    private Venue toEntity(VenueDTO dto) {
        return Venue.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .zipCode(dto.getZipCode())
                .capacity(dto.getCapacity())
                .amenities(dto.getAmenities())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
    }
}

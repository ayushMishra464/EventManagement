package com.eventmanagement.controller;

// ============================================
// Member 5: Venue REST controller - API endpoints
// ============================================

import com.eventmanagement.dto.VenueDTO;
import com.eventmanagement.service.VenueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/venues")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class VenueController {

    private final VenueService venueService;

    @GetMapping
    public ResponseEntity<List<VenueDTO>> getAllVenues(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        List<VenueDTO> venues = activeOnly
                ? venueService.findActiveVenues()
                : venueService.findAll();
        return ResponseEntity.ok(venues);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VenueDTO> getVenueById(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.findById(id));
    }

    @PostMapping
    public ResponseEntity<VenueDTO> createVenue(@Valid @RequestBody VenueDTO venueDTO) {
        VenueDTO created = venueService.create(venueDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VenueDTO> updateVenue(
            @PathVariable Long id,
            @Valid @RequestBody VenueDTO venueDTO) {
        return ResponseEntity.ok(venueService.update(id, venueDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
        venueService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

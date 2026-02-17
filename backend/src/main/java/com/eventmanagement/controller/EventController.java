package com.eventmanagement.controller;

// ============================================
// Member 5: Event REST controller - API endpoints
// ============================================

import com.eventmanagement.dto.EventDTO;
import com.eventmanagement.entity.Event.EventStatus;
import com.eventmanagement.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventDTO>> getAllEvents(
            @RequestParam(required = false) EventStatus status,
            @RequestParam(required = false) String search) {
        List<EventDTO> events;
        if (search != null && !search.isBlank()) {
            events = eventService.searchByName(search.trim());
            if (status != null) {
                events = events.stream()
                        .filter(e -> e.getStatus() == status)
                        .toList();
            }
        } else if (status != null) {
            events = eventService.findByStatus(status);
        } else {
            events = eventService.findAll();
        }
        return ResponseEntity.ok(events);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<EventDTO>> getUpcoming(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(eventService.findUpcoming(Math.min(limit, 20)));
    }

    @GetMapping("/my-events")
    public ResponseEntity<List<EventDTO>> getMyEvents() {
        return ResponseEntity.ok(eventService.findByOrganizer(null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.findById(id));
    }

    @PostMapping
    public ResponseEntity<EventDTO> createEvent(@Valid @RequestBody EventDTO eventDTO) {
        EventDTO created = eventService.create(eventDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventDTO> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventDTO eventDTO) {
        return ResponseEntity.ok(eventService.update(id, eventDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

package com.eventmanagement.service;

// ============================================
// Member 4: Event service - business logic with RBAC
// ============================================

import com.eventmanagement.dto.EventDTO;
import com.eventmanagement.entity.Event;
import com.eventmanagement.entity.Event.EventStatus;
import com.eventmanagement.entity.User;
import com.eventmanagement.entity.Venue;
import com.eventmanagement.entity.Ticket;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.TicketRepository;
import com.eventmanagement.repository.VenueRepository;
import com.eventmanagement.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final TicketRepository ticketRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<EventDTO> findAll() {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }
        // ADMIN sees all, ORGANIZER sees their own + all published, ATTENDEE sees only published
        if (securityUtils.isAdmin()) {
            return eventRepository.findAll().stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else if (securityUtils.isOrganizer()) {
            List<Event> allEvents = eventRepository.findAll();
            return allEvents.stream()
                    .filter(e -> e.getOrganizer().getId().equals(currentUser.getId()) || e.getStatus() == EventStatus.PUBLISHED)
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else {
            return eventRepository.findByStatus(EventStatus.PUBLISHED).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }
    }

    @Transactional(readOnly = true)
    public List<EventDTO> findByOrganizer(Long organizerId) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }
        // If organizerId is null, use current user's ID (for "my events")
        Long targetOrganizerId = organizerId != null ? organizerId : currentUser.getId();
        // Only ADMIN or the organizer themselves can view organizer's events
        if (!securityUtils.isAdmin() && !currentUser.getId().equals(targetOrganizerId)) {
            throw new RuntimeException("Access denied");
        }
        return eventRepository.findByOrganizerId(targetOrganizerId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventDTO findById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        return toDTO(event);
    }

    @Transactional(readOnly = true)
    public List<EventDTO> findByStatus(EventStatus status) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }
        List<Event> events = eventRepository.findByStatus(status);
        // ADMIN sees all, ORGANIZER sees their own + published, ATTENDEE sees only published
        if (securityUtils.isAdmin()) {
            return events.stream().map(this::toDTO).collect(Collectors.toList());
        } else if (securityUtils.isOrganizer()) {
            return events.stream()
                    .filter(e -> e.getOrganizer().getId().equals(currentUser.getId()) || e.getStatus() == EventStatus.PUBLISHED)
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else {
            // ATTENDEE - only published
            return events.stream()
                    .filter(e -> e.getStatus() == EventStatus.PUBLISHED)
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }
    }

    @Transactional(readOnly = true)
    public List<EventDTO> findUpcoming(int limit) {
        return eventRepository.findUpcomingPublished(LocalDateTime.now(), PageRequest.of(0, limit))
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventDTO> searchByName(String name) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }
        List<Event> events = eventRepository.findByNameContainingIgnoreCase(name);
        // Apply role-based filtering
        if (securityUtils.isAdmin()) {
            return events.stream().map(this::toDTO).collect(Collectors.toList());
        } else if (securityUtils.isOrganizer()) {
            return events.stream()
                    .filter(e -> e.getOrganizer().getId().equals(currentUser.getId()) || e.getStatus() == EventStatus.PUBLISHED)
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } else {
            return events.stream()
                    .filter(e -> e.getStatus() == EventStatus.PUBLISHED)
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }
    }

    @Transactional
    public EventDTO create(EventDTO dto) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }
        // Only ORGANIZER and ADMIN can create events
        if (!securityUtils.isOrganizer() && !securityUtils.isAdmin()) {
            throw new RuntimeException("Only organizers can create events");
        }
        
        Event event = toEntity(dto);
        event.setOrganizer(currentUser);
        
        if (dto.getVenueId() != null) {
            Venue venue = venueRepository.findById(dto.getVenueId())
                    .orElseThrow(() -> new RuntimeException("Venue not found: " + dto.getVenueId()));
            event.setVenue(venue);
            
            // Auto-populate location and maxAttendees from venue
            if (venue.getAddress() != null && venue.getCity() != null) {
                event.setLocation(venue.getAddress() + ", " + venue.getCity() + 
                    (venue.getState() != null ? ", " + venue.getState() : ""));
            }
            if (venue.getCapacity() != null) {
                event.setMaxAttendees(venue.getCapacity());
            }
            
            // Check for double booking (overlapping events at same venue)
            List<Event> overlapping = eventRepository.findOverlappingEvents(
                    venue.getId(), event.getStartDate(), event.getEndDate());
            if (!overlapping.isEmpty()) {
                throw new RuntimeException("Venue is already booked for this time period");
            }
        }
        
        event = eventRepository.save(event);
        createOrUpdateTicket(event);
        return toDTO(event);
    }

    @Transactional
    public EventDTO update(Long id, EventDTO dto) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        
        // Only ADMIN or the organizer can update
        if (!securityUtils.isAdmin() && !event.getOrganizer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied. You can only update your own events");
        }
        
        event.setName(dto.getName());
        event.setDescription(dto.getDescription());
        event.setStartDate(dto.getStartDate());
        event.setEndDate(dto.getEndDate());
        event.setStatus(dto.getStatus() != null ? dto.getStatus() : event.getStatus());
        event.setTicketPrice(dto.getTicketPrice());
        
        // If venue changes, auto-populate location and capacity, and check double booking
        if (dto.getVenueId() != null && 
            (event.getVenue() == null || !event.getVenue().getId().equals(dto.getVenueId()))) {
            Venue venue = venueRepository.findById(dto.getVenueId())
                    .orElseThrow(() -> new RuntimeException("Venue not found: " + dto.getVenueId()));
            event.setVenue(venue);
            
            // Auto-populate from venue
            if (venue.getAddress() != null && venue.getCity() != null) {
                event.setLocation(venue.getAddress() + ", " + venue.getCity() + 
                    (venue.getState() != null ? ", " + venue.getState() : ""));
            }
            if (venue.getCapacity() != null) {
                event.setMaxAttendees(venue.getCapacity());
            }
            
            // Check double booking (excluding current event)
            final Long eventId = event.getId();
            List<Event> overlapping = eventRepository.findOverlappingEvents(
                    venue.getId(), event.getStartDate(), event.getEndDate());
            overlapping = overlapping.stream()
                    .filter(e -> !e.getId().equals(eventId))
                    .toList();
            if (!overlapping.isEmpty()) {
                throw new RuntimeException("Venue is already booked for this time period");
            }
        } else if (event.getVenue() != null && event.getVenue().getCapacity() != null) {
            // Ensure maxAttendees matches venue capacity
            event.setMaxAttendees(event.getVenue().getCapacity());
        }
        
        event = eventRepository.save(event);
        createOrUpdateTicket(event);
        return toDTO(event);
    }

    @Transactional
    public void deleteById(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        
        // Only ADMIN or the organizer can delete
        if (!securityUtils.isAdmin() && !event.getOrganizer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied. You can only delete your own events");
        }
        
        ticketRepository.findByEventId(id).ifPresent(ticketRepository::delete);
        eventRepository.deleteById(id);
    }

    private void createOrUpdateTicket(Event event) {
        int max = event.getMaxAttendees() != null ? event.getMaxAttendees() : 0;
        String name = event.getName();
        ticketRepository.findByEventId(event.getId()).ifPresentOrElse(
                ticket -> {
                    ticket.setEventName(name);
                    ticket.setMaxTickets(max);
                    ticket.setTicketsLeft(Math.min(ticket.getTicketsLeft(), max));
                    ticketRepository.save(ticket);
                },
                () -> ticketRepository.save(Ticket.builder()
                        .event(event)
                        .eventName(name)
                        .maxTickets(max)
                        .ticketsLeft(max)
                        .build())
        );
    }

    private EventDTO toDTO(Event event) {
        Integer ticketsLeft = ticketRepository.findByEventId(event.getId())
                .map(Ticket::getTicketsLeft)
                .orElse(null);
        return EventDTO.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .location(event.getLocation())
                .status(event.getStatus())
                .maxAttendees(event.getMaxAttendees())
                .ticketsLeft(ticketsLeft)
                .ticketPrice(event.getTicketPrice())
                .venueId(event.getVenue() != null ? event.getVenue().getId() : null)
                .venueName(event.getVenue() != null ? event.getVenue().getName() : null)
                .organizerId(event.getOrganizer() != null ? event.getOrganizer().getId() : null)
                .organizerName(event.getOrganizer() != null ? 
                    event.getOrganizer().getFirstName() + " " + event.getOrganizer().getLastName() : null)
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }

    private Event toEntity(EventDTO dto) {
        return Event.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .location(dto.getLocation())
                .status(dto.getStatus() != null ? dto.getStatus() : EventStatus.DRAFT)
                .maxAttendees(dto.getMaxAttendees())
                .ticketPrice(dto.getTicketPrice())
                .build();
    }
}

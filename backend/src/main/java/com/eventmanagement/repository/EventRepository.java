package com.eventmanagement.repository;

// ============================================
// Member 3: Event repository - data access layer
// ============================================

import com.eventmanagement.entity.Event;
import com.eventmanagement.entity.Event.EventStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByStatus(EventStatus status);

    List<Event> findByNameContainingIgnoreCase(String name);

    @Query("SELECT e FROM Event e WHERE e.startDate BETWEEN :start AND :end ORDER BY e.startDate")
    List<Event> findEventsBetweenDates(LocalDateTime start, LocalDateTime end);

    @Query("SELECT e FROM Event e WHERE e.startDate >= :from AND e.status = 'PUBLISHED' ORDER BY e.startDate ASC")
    List<Event> findUpcomingPublished(LocalDateTime from, Pageable pageable);

    List<Event> findByVenueId(Long venueId);

    List<Event> findByOrganizerId(Long organizerId);

    @Query("SELECT e FROM Event e WHERE e.venue.id = :venueId " +
           "AND e.status != 'CANCELLED' " +
           "AND ((e.startDate <= :endDate AND e.endDate >= :startDate))")
    List<Event> findOverlappingEvents(Long venueId, LocalDateTime startDate, LocalDateTime endDate);

    long countByStatus(EventStatus status);
}

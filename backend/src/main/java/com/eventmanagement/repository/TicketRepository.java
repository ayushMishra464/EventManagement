package com.eventmanagement.repository;

// ============================================
// Ticket repository - data access for ticket inventory
// ============================================

import com.eventmanagement.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByEventId(Long eventId);

    @Modifying
    @Query("UPDATE Ticket t SET t.ticketsLeft = t.ticketsLeft - :count WHERE t.event.id = :eventId AND t.ticketsLeft >= :count")
    int decrementTickets(@Param("eventId") Long eventId, @Param("count") int count);
}

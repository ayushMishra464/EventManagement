package com.eventmanagement.repository;

// ============================================
// Member 3: Registration repository - data access layer
// ============================================

import com.eventmanagement.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    List<Registration> findByEventId(Long eventId);

    List<Registration> findByUserId(Long userId);

    Optional<Registration> findByEventIdAndUserId(Long eventId, Long userId);

    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    Optional<Registration> findByTicketCode(String ticketCode);

    int countByEventId(Long eventId);
}

package com.eventmanagement.service;

import com.eventmanagement.dto.DashboardStatsDTO;
import com.eventmanagement.entity.Event.EventStatus;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.UserRepository;
import com.eventmanagement.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDTO getStats() {
        return DashboardStatsDTO.builder()
                .eventCount(eventRepository.count())
                .venueCount(venueRepository.count())
                .userCount(userRepository.count())
                .publishedEventCount(eventRepository.countByStatus(EventStatus.PUBLISHED))
                .build();
    }
}

package com.eventmanagement.dto;

// ============================================
// Member 5: Event DTOs - API request/response models
// ============================================

import com.eventmanagement.entity.Event.EventStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDTO {

    private Long id;

    @NotBlank(message = "Event name is required")
    private String name;

    private String description;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    private String location;

    private EventStatus status;

    private Integer maxAttendees;

    /** Number of tickets still available (from Ticket table). */
    private Integer ticketsLeft;

    private Double ticketPrice;

    private Long venueId;

    private String venueName;

    private Long organizerId;

    private String organizerName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

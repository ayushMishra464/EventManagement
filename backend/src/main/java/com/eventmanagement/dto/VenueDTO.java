package com.eventmanagement.dto;

// ============================================
// Member 5: Venue DTOs - API request/response models
// ============================================

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueDTO {

    private Long id;

    @NotBlank(message = "Venue name is required")
    private String name;

    private String address;

    private String city;

    private String state;

    private String zipCode;

    private Integer capacity;

    private String amenities;

    private Boolean isActive;
}

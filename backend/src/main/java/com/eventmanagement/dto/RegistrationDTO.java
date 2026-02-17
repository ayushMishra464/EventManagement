package com.eventmanagement.dto;

import com.eventmanagement.entity.Registration.PaymentStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationDTO {

    private Long id;
    private Long eventId;
    private String eventName;
    private String eventLocation;
    private LocalDateTime eventStartDate;
    private LocalDateTime eventEndDate;
    private Double ticketPrice;
    private Integer numberOfTickets;
    private PaymentStatus paymentStatus;
    private String ticketCode;
    private LocalDateTime registeredAt;
    private Long userId;
    private String userFirstName;
    private String userLastName;
    private String userEmail;
}

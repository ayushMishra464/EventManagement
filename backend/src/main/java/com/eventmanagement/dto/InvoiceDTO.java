package com.eventmanagement.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDTO {

    private String invoiceNumber;
    private LocalDateTime issueDate;
    private String ticketCode;
    private String eventName;
    private LocalDateTime eventDate;
    private String eventLocation;
    private String attendeeName;
    private String attendeeEmail;
    private Integer numberOfTickets;
    private Double unitPrice;
    private Double totalAmount;
    private String paymentStatus;
}

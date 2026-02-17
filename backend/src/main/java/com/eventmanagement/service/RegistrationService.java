package com.eventmanagement.service;

import com.eventmanagement.dto.BookRequest;
import com.eventmanagement.dto.InvoiceDTO;
import com.eventmanagement.dto.RegistrationDTO;
import com.eventmanagement.entity.Event;
import com.eventmanagement.entity.Registration;
import com.eventmanagement.entity.Ticket;
import com.eventmanagement.entity.User;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.RegistrationRepository;
import com.eventmanagement.repository.TicketRepository;
import com.eventmanagement.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final SecurityUtils securityUtils;

    @Transactional
    public RegistrationDTO book(BookRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }
        if (!securityUtils.isAttendee() && !securityUtils.isAdmin()) {
            throw new RuntimeException("Only attendees can book events");
        }

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (event.getStatus() != Event.EventStatus.PUBLISHED) {
            throw new RuntimeException("Event is not available for booking");
        }
        if (event.getStartDate().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Event has already started");
        }

        if (registrationRepository.existsByEventIdAndUserId(event.getId(), currentUser.getId())) {
            throw new RuntimeException("You have already booked this event");
        }

        Ticket ticket = ticketRepository.findByEventId(event.getId()).orElseGet(() -> {
            int max = event.getMaxAttendees() != null ? event.getMaxAttendees() : 0;
            int booked = registrationRepository.countByEventId(event.getId());
            Ticket newTicket = Ticket.builder()
                    .event(event)
                    .eventName(event.getName())
                    .maxTickets(max)
                    .ticketsLeft(Math.max(0, max - booked))
                    .build();
            return ticketRepository.save(newTicket);
        });
        if (ticket.getTicketsLeft() < request.getNumberOfTickets()) {
            throw new RuntimeException("Not enough tickets available. Only " + ticket.getTicketsLeft() + " left.");
        }

        int updated = ticketRepository.decrementTickets(event.getId(), request.getNumberOfTickets());
        if (updated == 0) {
            throw new RuntimeException("Not enough tickets available. Booking failed.");
        }

        String ticketCode = "EVT-" + event.getId() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Registration reg = Registration.builder()
                .event(event)
                .user(currentUser)
                .numberOfTickets(request.getNumberOfTickets())
                .ticketCode(ticketCode)
                .paymentStatus(Registration.PaymentStatus.COMPLETED)
                .build();
        reg = registrationRepository.save(reg);
        return toDTO(reg);
    }

    @Transactional(readOnly = true)
    public List<RegistrationDTO> getMyBookings() {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }
        return registrationRepository.findByUserId(currentUser.getId()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceDTO getInvoice(Long registrationId) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }
        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!reg.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        Event e = reg.getEvent();
        double total = (e.getTicketPrice() != null ? e.getTicketPrice() : 0) * reg.getNumberOfTickets();
        String invoiceNum = "INV-" + reg.getId() + "-" + reg.getRegisteredAt().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        return InvoiceDTO.builder()
                .invoiceNumber(invoiceNum)
                .issueDate(reg.getRegisteredAt())
                .ticketCode(reg.getTicketCode())
                .eventName(e.getName())
                .eventDate(e.getStartDate())
                .eventLocation(e.getLocation())
                .attendeeName(currentUser.getFirstName() + " " + currentUser.getLastName())
                .attendeeEmail(currentUser.getEmail())
                .numberOfTickets(reg.getNumberOfTickets())
                .unitPrice(e.getTicketPrice() != null ? e.getTicketPrice() : 0)
                .totalAmount(total)
                .paymentStatus(reg.getPaymentStatus().name())
                .build();
    }

    @Transactional(readOnly = true)
    public boolean hasBooked(Long eventId) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) return false;
        return registrationRepository.existsByEventIdAndUserId(eventId, currentUser.getId());
    }

    private RegistrationDTO toDTO(Registration reg) {
        Event e = reg.getEvent();
        User u = reg.getUser();
        return RegistrationDTO.builder()
                .id(reg.getId())
                .eventId(e.getId())
                .eventName(e.getName())
                .eventLocation(e.getLocation())
                .eventStartDate(e.getStartDate())
                .eventEndDate(e.getEndDate())
                .ticketPrice(e.getTicketPrice())
                .numberOfTickets(reg.getNumberOfTickets())
                .paymentStatus(reg.getPaymentStatus())
                .ticketCode(reg.getTicketCode())
                .registeredAt(reg.getRegisteredAt())
                .userId(u.getId())
                .userFirstName(u.getFirstName())
                .userLastName(u.getLastName())
                .userEmail(u.getEmail())
                .build();
    }
}

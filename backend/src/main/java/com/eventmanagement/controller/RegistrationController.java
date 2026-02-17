package com.eventmanagement.controller;

import com.eventmanagement.dto.BookRequest;
import com.eventmanagement.dto.InvoiceDTO;
import com.eventmanagement.dto.RegistrationDTO;
import com.eventmanagement.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/registrations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    public ResponseEntity<RegistrationDTO> book(@Valid @RequestBody BookRequest request) {
        RegistrationDTO created = registrationService.book(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<RegistrationDTO>> getMyBookings() {
        return ResponseEntity.ok(registrationService.getMyBookings());
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<InvoiceDTO> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(registrationService.getInvoice(id));
    }

    @GetMapping("/has-booked/{eventId}")
    public ResponseEntity<Boolean> hasBooked(@PathVariable Long eventId) {
        return ResponseEntity.ok(registrationService.hasBooked(eventId));
    }
}

package com.eventmanagement.entity;

// ============================================
// Ticket entity - event ticket inventory (eventName, maxTickets, ticketsLeft)
// ============================================

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false, unique = true)
    private Event event;

    @Column(name = "event_name", nullable = false)
    private String eventName;

    @Column(name = "max_tickets", nullable = false)
    private Integer maxTickets;

    @Column(name = "tickets_left", nullable = false)
    private Integer ticketsLeft;
}

package com.eventmanagement.config;

import com.eventmanagement.entity.Event;
import com.eventmanagement.entity.Ticket;
import com.eventmanagement.entity.User;
import com.eventmanagement.entity.Venue;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.TicketRepository;
import com.eventmanagement.repository.UserRepository;
import com.eventmanagement.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds the database with sample venues, users, and events when empty.
 * Runs only if event count is zero (so it doesn't duplicate on every restart).
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (eventRepository.count() > 0) {
            log.debug("Seed data already present, skipping.");
            return;
        }
        log.info("Seeding database with sample data...");

        List<User> users = seedUsers();
        List<Venue> venues = seedVenues();
        seedEvents(venues, users);

        log.info("Seed data created: {} venues, {} users, {} events.",
                venues.size(), users.size(), eventRepository.count());
    }

    private List<Venue> seedVenues() {
        // Get admin user for createdBy (will be set after users are created)
        User admin = userRepository.findByEmail("admin@eventhub.com").orElse(null);
        Venue v1 = Venue.builder()
                .name("Grand Convention Hall")
                .address("123 Main Street")
                .city("Mumbai")
                .state("Maharashtra")
                .zipCode("400001")
                .capacity(500)
                .amenities("Stage, PA System, Parking, Catering")
                .isActive(true)
                .createdBy(admin)
                .build();
        Venue v2 = Venue.builder()
                .name("Tech Park Auditorium")
                .address("45 IT Park Road")
                .city("Bangalore")
                .state("Karnataka")
                .zipCode("560066")
                .capacity(200)
                .amenities("Projector, WiFi, Whiteboards, Breakout rooms")
                .isActive(true)
                .createdBy(admin)
                .build();
        Venue v3 = Venue.builder()
                .name("Riverside Garden")
                .address("Riverside Drive")
                .city("Pune")
                .state("Maharashtra")
                .zipCode("411001")
                .capacity(150)
                .amenities("Outdoor, Marquee, Parking")
                .isActive(true)
                .createdBy(admin)
                .build();
        return venueRepository.saveAll(List.of(v1, v2, v3));
    }

    private List<User> seedUsers() {
        User admin = User.builder()
                .firstName("Admin")
                .lastName("User")
                .email("admin@eventhub.com")
                .password(passwordEncoder.encode("Admin123"))
                .phone("+91 9876543210")
                .role(User.UserRole.ADMIN)
                .build();
        User organizer = User.builder()
                .firstName("Riya")
                .lastName("Sharma")
                .email("organizer@eventhub.com")
                .password(passwordEncoder.encode("Organizer123"))
                .phone("+91 9876543211")
                .role(User.UserRole.ORGANIZER)
                .build();
        User attendee = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .password(passwordEncoder.encode("User123"))
                .phone("+91 9876543212")
                .role(User.UserRole.ATTENDEE)
                .build();
        List<User> savedUsers = userRepository.saveAll(List.of(admin, organizer, attendee));
        // Update venues with createdBy after users are saved
        List<Venue> venues = venueRepository.findAll();
        for (Venue venue : venues) {
            venue.setCreatedBy(admin);
        }
        venueRepository.saveAll(venues);
        return savedUsers;
    }

    private void seedEvents(List<Venue> venues, List<User> users) {
        LocalDateTime now = LocalDateTime.now();
        Venue v1 = venues.get(0);
        Venue v2 = venues.get(1);
        Venue v3 = venues.get(2);
        User organizer = users.stream()
                .filter(u -> u.getRole() == User.UserRole.ORGANIZER)
                .findFirst()
                .orElse(users.get(0));

        List<Event> events = List.of(
                Event.builder()
                        .name("Annual Tech Summit 2025")
                        .description("Join industry leaders for keynotes, workshops, and networking. Topics include AI, cloud, and product design.")
                        .startDate(now.plusDays(14).withHour(9).withMinute(0).withSecond(0))
                        .endDate(now.plusDays(14).withHour(18).withSecond(0))
                        .location(v1.getAddress() + ", " + v1.getCity() + ", " + v1.getState())
                        .status(Event.EventStatus.PUBLISHED)
                        .maxAttendees(v1.getCapacity())
                        .ticketPrice(1499.0)
                        .venue(v1)
                        .organizer(organizer)
                        .build(),
                Event.builder()
                        .name("Startup Pitch Night")
                        .description("Pitch your startup to investors. Top 5 get mentoring and potential funding.")
                        .startDate(now.plusDays(7).withHour(18).withMinute(30).withSecond(0))
                        .endDate(now.plusDays(7).withHour(21).withSecond(0))
                        .location(v2.getAddress() + ", " + v2.getCity() + ", " + v2.getState())
                        .status(Event.EventStatus.PUBLISHED)
                        .maxAttendees(v2.getCapacity())
                        .ticketPrice(499.0)
                        .venue(v2)
                        .organizer(organizer)
                        .build(),
                Event.builder()
                        .name("Summer Music Festival")
                        .description("Live bands, food stalls, and fun for all ages. Bring your friends and family.")
                        .startDate(now.plusDays(30).withHour(16).withMinute(0).withSecond(0))
                        .endDate(now.plusDays(30).withHour(23).withSecond(0))
                        .location(v3.getAddress() + ", " + v3.getCity() + ", " + v3.getState())
                        .status(Event.EventStatus.PUBLISHED)
                        .maxAttendees(v3.getCapacity())
                        .ticketPrice(799.0)
                        .venue(v3)
                        .organizer(organizer)
                        .build(),
                Event.builder()
                        .name("DevOps Workshop")
                        .description("Hands-on CI/CD, Docker, and Kubernetes. Laptop required.")
                        .startDate(now.plusDays(3).withHour(10).withMinute(0).withSecond(0))
                        .endDate(now.plusDays(3).withHour(17).withSecond(0))
                        .location(v2.getAddress() + ", " + v2.getCity() + ", " + v2.getState())
                        .status(Event.EventStatus.PUBLISHED)
                        .maxAttendees(v2.getCapacity())
                        .ticketPrice(999.0)
                        .venue(v2)
                        .organizer(organizer)
                        .build(),
                Event.builder()
                        .name("Corporate Leadership Meet 2025")
                        .description("Draft agenda: leadership talks and panel discussion. Venue TBC.")
                        .startDate(now.plusMonths(2).withHour(9).withMinute(0).withSecond(0))
                        .endDate(now.plusMonths(2).withHour(17).withSecond(0))
                        .location("TBC")
                        .status(Event.EventStatus.DRAFT)
                        .maxAttendees(100)
                        .ticketPrice(0.0)
                        .venue(null)
                        .organizer(organizer)
                        .build(),
                Event.builder()
                        .name("Product Launch – Q1 2025")
                        .description("Completed product launch event. Thank you to all attendees.")
                        .startDate(now.minusDays(10).withHour(14).withMinute(0).withSecond(0))
                        .endDate(now.minusDays(10).withHour(16).withSecond(0))
                        .location(v1.getAddress() + ", " + v1.getCity() + ", " + v1.getState())
                        .status(Event.EventStatus.COMPLETED)
                        .maxAttendees(v1.getCapacity())
                        .ticketPrice(0.0)
                        .venue(v1)
                        .organizer(organizer)
                        .build()
        );
        List<Event> savedEvents = eventRepository.saveAll(events);
        for (Event e : savedEvents) {
            int max = e.getMaxAttendees() != null ? e.getMaxAttendees() : 0;
            ticketRepository.save(Ticket.builder()
                    .event(e)
                    .eventName(e.getName())
                    .maxTickets(max)
                    .ticketsLeft(max)
                    .build());
        }
    }
}

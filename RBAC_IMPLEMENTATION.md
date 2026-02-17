# Role-Based Access Control (RBAC) Implementation Summary

## Overview
This document outlines the comprehensive RBAC implementation for the Event Management System, ensuring proper segregation between ADMIN, ORGANIZER, and ATTENDEE roles at both backend and frontend levels.

---

## Backend Changes

### 1. **Database Schema Updates**

#### User Entity (`User.java`)
- **Changed:** `UserRole` enum from `ORGANIZER, VENDOR, PARTICIPANT, ADMIN` to `ADMIN, ORGANIZER, ATTENDEE`
- **Changed:** Default role from `PARTICIPANT` to `ATTENDEE`
- **Added:** Relationships:
  - `organizedEvents` (OneToMany with Event)
  - `createdVenues` (OneToMany with Venue)

#### Event Entity (`Event.java`)
- **Added:** `organizer` field (ManyToOne with User, nullable=false)
  - Links each event to its creator/organizer
  - Required for all events

#### Venue Entity (`Venue.java`)
- **Added:** `createdBy` field (ManyToOne with User)
  - Tracks which admin created the venue

---

### 2. **JWT & Security Updates**

#### JwtUtil (`JwtUtil.java`)
- **Modified:** `generateToken()` now includes role claim in JWT
- **Added:** `getRoleFromToken()` method to extract role from JWT

#### JwtAuthFilter (`JwtAuthFilter.java`)
- **Modified:** Extracts role from JWT and sets Spring Security authorities as `ROLE_ADMIN`, `ROLE_ORGANIZER`, or `ROLE_ATTENDEE`
- **Added:** UserRepository dependency to validate user exists and role matches

#### SecurityUtils (`SecurityUtils.java`) - NEW
- Utility class for role checks:
  - `getCurrentUser()` - Gets authenticated user
  - `hasRole(role)` - Checks if user has specific role
  - `isAdmin()`, `isOrganizer()`, `isAttendee()` - Convenience methods

---

### 3. **Registration & Authentication**

#### RegisterRequest (`RegisterRequest.java`)
- **Added:** `role` field (required, validated)
- **Validation:** Backend rejects ADMIN role during registration

#### AuthService (`AuthService.java`)
- **Modified:** `register()`:
  - Validates role is ORGANIZER or ATTENDEE (rejects ADMIN)
  - Throws error if ADMIN role attempted
  - Includes role in JWT token generation
- **Modified:** `login()`:
  - Includes role in JWT token generation

---

### 4. **Event Service - Role-Based Access**

#### EventService (`EventService.java`)
- **Modified:** `findAll()`:
  - ADMIN: Sees all events
  - ORGANIZER: Sees own events + all published events
  - ATTENDEE: Sees only published events

- **Modified:** `create()`:
  - Only ORGANIZER and ADMIN can create events
  - Sets `organizer` to current user automatically
  - **Auto-populates** `location` and `maxAttendees` from selected venue:
    - Location = venue.address + ", " + venue.city + ", " + venue.state
    - MaxAttendees = venue.capacity
  - **Double-booking validation**: Checks for overlapping events at same venue (excludes CANCELLED events)
  - Throws error if venue is already booked

- **Modified:** `update()`:
  - Only ADMIN or event organizer can update
  - If venue changes, auto-populates location/capacity and checks double-booking
  - Ensures maxAttendees always matches venue capacity

- **Modified:** `deleteById()`:
  - Only ADMIN or event organizer can delete

- **Added:** `findByOrganizer()`:
  - Returns events for specific organizer
  - If organizerId is null, returns current user's events
  - Only ADMIN or organizer themselves can access

- **Modified:** `findByStatus()` and `searchByName()`:
  - Apply same role-based filtering as `findAll()`

---

### 5. **Venue Service - Role-Based Access**

#### VenueService (`VenueService.java`)
- **Modified:** All CRUD operations:
  - Only ADMIN can create, update, or delete venues
  - `create()` sets `createdBy` to current admin user
  - Throws "Only administrators can..." error for non-admins

---

### 6. **User Service - Role-Based Access**

#### UserService (`UserService.java`)
- **Modified:** All operations:
  - Only ADMIN can view all users, create, update, or delete users
  - Used for manual ADMIN user creation
  - Changed default role from PARTICIPANT to ATTENDEE

---

### 7. **Repository Updates**

#### EventRepository (`EventRepository.java`)
- **Added:** `findByOrganizerId(Long organizerId)` - Find events by organizer
- **Added:** `findOverlappingEvents(Long venueId, LocalDateTime startDate, LocalDateTime endDate)`:
  - Checks for events at same venue with overlapping time periods
  - Excludes CANCELLED events from check

---

### 8. **DTO Updates**

#### EventDTO (`EventDTO.java`)
- **Added:** `organizerId` and `organizerName` fields
- Used to display organizer information in frontend

---

### 9. **Data Seeder Updates**

#### DataSeeder (`DataSeeder.java`)
- **Changed:** User role from `PARTICIPANT` to `ATTENDEE`
- **Modified:** Venue seeding to set `createdBy` to admin user
- **Modified:** Event seeding to:
  - Set `organizer` to organizer user
  - Auto-populate location from venue
  - Set maxAttendees from venue capacity

---

## Frontend Changes

### 1. **Type Updates**

#### Types (`types/index.ts`)
- **Changed:** `UserRole` from `'ORGANIZER' | 'VENDOR' | 'PARTICIPANT' | 'ADMIN'` to `'ADMIN' | 'ORGANIZER' | 'ATTENDEE'`
- **Added:** `organizerId` and `organizerName` to Event interface

---

### 2. **Authentication & Registration**

#### RegisterPage (`RegisterPage.tsx`)
- **Added:** Role selection dropdown:
  - Options: "Attend events" (ATTENDEE) or "Organize events" (ORGANIZER)
  - ADMIN option not available
  - Shows description for each role
- **Modified:** `handleSubmit()`:
  - Sends selected role to backend
  - Redirects based on role after registration:
    - ORGANIZER → `/organizer/dashboard`
    - ATTENDEE → `/attendee/dashboard`

#### LoginPage (`LoginPage.tsx`)
- **Modified:** `handleSubmit()`:
  - After login, redirects based on user role:
    - ADMIN → `/admin/dashboard`
    - ORGANIZER → `/organizer/dashboard`
    - ATTENDEE → `/attendee/dashboard`

#### AuthContext (`AuthContext.tsx`)
- **Modified:** `register()` function signature to accept role parameter
- Passes role to API

#### API Client (`services/api.ts`)
- **Modified:** `authApi.register()` to include role in request body

---

### 3. **Dashboard Pages**

#### AdminDashboard (`AdminDashboard.tsx`) - NEW
- Shows stats: Total events, Venues, Users, Published events
- Lists recent events, users, and venues
- Quick links to manage events, venues, users
- Only accessible to ADMIN role

#### OrganizerDashboard (`OrganizerDashboard.tsx`) - NEW
- Shows stats: My events count, Published count, Drafts count
- Lists organizer's own events
- "Create Event" button
- Only accessible to ORGANIZER role

#### AttendeeDashboard (`AttendeeDashboard.tsx`) - NEW
- Shows upcoming published events
- "My Bookings" section (placeholder for future booking feature)
- Browse events functionality
- Only accessible to ATTENDEE role

---

### 4. **Event Management**

#### EventsPage (`EventsPage.tsx`)
- **Added:** Role-based UI:
  - "Add event" button only visible to ORGANIZER and ADMIN
  - ATTENDEE cannot see create button
- **Modified:** Create event form:
  - Venue selection is **required**
  - **Auto-populates** location and maxAttendees when venue is selected:
    - Shows preview: "Location will be: [venue address, city, state]"
    - Shows preview: "Max attendees will be set to: [venue capacity]"
  - Removed manual location and maxAttendees inputs (auto-populated from venue)
  - Backend handles auto-population and validation

---

### 5. **Venue Management**

#### VenuesPage (`VenuesPage.tsx`)
- **Added:** Role-based UI:
  - "Add venue" button only visible to ADMIN
  - ORGANIZER and ATTENDEE cannot create venues

---

### 6. **Navigation & Layout**

#### Layout (`Layout.tsx`)
- **Modified:** Dynamic navigation based on role:
  - ADMIN: Home, Events, Venues, Users, Dashboard
  - ORGANIZER: Home, Events, Venues, Dashboard
  - ATTENDEE: Home, Events, Dashboard
  - Guest: Home, Events, Venues
- Uses `useMemo` to compute nav items based on user role

#### HomePage (`HomePage.tsx`)
- **Modified:** Auto-redirects authenticated users to role-specific dashboard:
  - ADMIN → `/admin/dashboard`
  - ORGANIZER → `/organizer/dashboard`
  - ATTENDEE → `/attendee/dashboard`

---

### 7. **Routing**

#### App (`App.tsx`)
- **Added:** Routes for dashboards:
  - `/admin/dashboard` → AdminDashboard (protected)
  - `/organizer/dashboard` → OrganizerDashboard (protected)
  - `/attendee/dashboard` → AttendeeDashboard (protected)

---

## Security Features Implemented

### Backend Security
1. **JWT with Role Claims**: Role stored in JWT token and validated on each request
2. **Method-Level Authorization**: Services check user role before operations
3. **Resource Ownership**: Organizers can only modify their own events
4. **Role-Based Data Filtering**: Users only see data they're authorized to view
5. **Double-Booking Prevention**: Venue cannot host overlapping events
6. **ADMIN Protection**: ADMIN role cannot be selected during registration

### Frontend Security
1. **Role-Based UI Rendering**: Buttons/features hidden based on role
2. **Protected Routes**: Dashboards check role before rendering
3. **Navigation Filtering**: Menu items filtered by role
4. **Auto-Redirect**: Users redirected to appropriate dashboard after login

---

## Validation Rules

### Event Creation/Update
1. Venue selection required (for auto-population)
2. Location auto-populated from venue (address + city + state)
3. MaxAttendees auto-set to venue capacity (cannot be manually changed)
4. Double-booking check: No overlapping events at same venue
5. Organizer automatically set to current user

### Registration
1. Role must be ORGANIZER or ATTENDEE (ADMIN rejected)
2. Password minimum 6 characters
3. Email must be unique

### Access Control
- **ADMIN**: Full access to all resources
- **ORGANIZER**: Can create/manage own events, view published events, cannot manage venues/users
- **ATTENDEE**: Can only view published events, cannot create events or venues

---

## Testing Checklist

### Backend
- [ ] ADMIN cannot register via API (should return error)
- [ ] ORGANIZER can create events (with organizer set automatically)
- [ ] ATTENDEE cannot create events (should return 403/error)
- [ ] Event location/capacity auto-populated from venue
- [ ] Double-booking validation works (overlapping events rejected)
- [ ] Organizers can only update/delete their own events
- [ ] Only ADMIN can create/update/delete venues
- [ ] Only ADMIN can manage users
- [ ] Role-based event filtering works (ADMIN sees all, ORGANIZER sees own+published, ATTENDEE sees only published)

### Frontend
- [ ] Registration form only shows ORGANIZER/ATTENDEE options
- [ ] Login redirects to correct dashboard based on role
- [ ] Admin dashboard shows all stats and management options
- [ ] Organizer dashboard shows own events and create button
- [ ] Attendee dashboard shows upcoming events, no create buttons
- [ ] "Add event" button hidden for ATTENDEE
- [ ] "Add venue" button hidden for non-ADMIN
- [ ] Venue selection auto-populates location/capacity in event form
- [ ] Navigation menu filtered by role

---

## Database Migration Notes

When running this update on existing database:
1. Existing users with `PARTICIPANT` role need to be updated to `ATTENDEE`
2. Existing events need `organizer_id` set (can be set to a default organizer or admin)
3. Existing venues need `created_by` set (can be set to admin user)
4. Run migration script or update manually:
   ```sql
   UPDATE users SET role = 'ATTENDEE' WHERE role = 'PARTICIPANT';
   UPDATE events SET organizer_id = (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1) WHERE organizer_id IS NULL;
   UPDATE venues SET created_by = (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1) WHERE created_by IS NULL;
   ```

---

## Files Modified

### Backend
- `entity/User.java`
- `entity/Event.java`
- `entity/Venue.java`
- `security/JwtUtil.java`
- `security/JwtAuthFilter.java`
- `security/SecurityUtils.java` (NEW)
- `security/RequiresRole.java` (NEW)
- `dto/RegisterRequest.java`
- `dto/EventDTO.java`
- `service/AuthService.java`
- `service/EventService.java`
- `service/VenueService.java`
- `service/UserService.java`
- `repository/EventRepository.java`
- `controller/EventController.java`
- `config/DataSeeder.java`

### Frontend
- `types/index.ts`
- `contexts/AuthContext.tsx`
- `pages/RegisterPage.tsx`
- `pages/LoginPage.tsx`
- `pages/HomePage.tsx`
- `pages/EventsPage.tsx`
- `pages/VenuesPage.tsx`
- `pages/AdminDashboard.tsx` (NEW)
- `pages/OrganizerDashboard.tsx` (NEW)
- `pages/AttendeeDashboard.tsx` (NEW)
- `components/layout/Layout.tsx`
- `services/api.ts`
- `App.tsx`

---

## Summary

This implementation provides:
✅ Complete role-based access control at backend and frontend
✅ Secure registration (ADMIN cannot be selected)
✅ Role-based login redirects to appropriate dashboards
✅ Backend API authorization enforced via services
✅ Auto-population of event location/capacity from venue
✅ Double-booking prevention for venues
✅ Dynamic UI based on user role
✅ Proper data filtering (users only see authorized data)
✅ Production-ready security with JWT role claims

All changes maintain backward compatibility where possible and follow Spring Boot and React best practices.

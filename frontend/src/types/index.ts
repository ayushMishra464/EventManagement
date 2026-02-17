// ============================================
// Member 6: TypeScript types for API models
// ============================================

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
export type UserRole = 'ADMIN' | 'ORGANIZER' | 'ATTENDEE'

export interface Event {
  id: number
  name: string
  description?: string
  startDate: string
  endDate: string
  location?: string
  status: EventStatus
  maxAttendees?: number
  /** Number of tickets still available (from Ticket table) */
  ticketsLeft?: number
  ticketPrice?: number
  venueId?: number
  venueName?: string
  organizerId?: number
  organizerName?: string
  createdAt?: string
  updatedAt?: string
}

export interface Venue {
  id: number
  name: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  capacity?: number
  amenities?: string
  isActive?: boolean
}

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'FAILED'

export interface Booking {
  id: number
  eventId: number
  eventName: string
  eventLocation?: string
  eventStartDate: string
  eventEndDate: string
  ticketPrice?: number
  numberOfTickets: number
  paymentStatus: PaymentStatus
  ticketCode: string
  registeredAt: string
}

export interface Invoice {
  invoiceNumber: string
  issueDate: string
  ticketCode: string
  eventName: string
  eventDate: string
  eventLocation?: string
  attendeeName: string
  attendeeEmail: string
  numberOfTickets: number
  unitPrice: number
  totalAmount: number
  paymentStatus: string
}

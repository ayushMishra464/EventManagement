// ============================================
// Member 6: API client for backend
// ============================================

import { API_BASE } from '@/lib/utils'
import type { Event, Venue, User, Booking, Invoice } from '@/types'

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('eventhub_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...getAuthHeaders(), ...options?.headers } as HeadersInit,
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || res.statusText || 'Request failed')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const eventsApi = {
  getAll: (opts?: { status?: string; search?: string }) => {
    const params = new URLSearchParams()
    if (opts?.status) params.set('status', opts.status)
    if (opts?.search?.trim()) params.set('search', opts.search.trim())
    const q = params.toString()
    return request<Event[]>(q ? `/events?${q}` : '/events')
  },
  getUpcoming: (limit = 5) =>
    request<Event[]>(`/events/upcoming?limit=${limit}`),
  getById: (id: number) => request<Event>(`/events/${id}`),
  create: (body: Partial<Event>) =>
    request<Event>('/events', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Partial<Event>) =>
    request<Event>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) =>
    request<void>(`/events/${id}`, { method: 'DELETE' }),
}

export interface DashboardStats {
  eventCount: number
  venueCount: number
  userCount: number
  publishedEventCount: number
}

export const dashboardApi = {
  getStats: () => request<DashboardStats>('/dashboard/stats'),
}

export const venuesApi = {
  getAll: (activeOnly?: boolean) =>
    request<Venue[]>(`/venues${activeOnly ? '?activeOnly=true' : ''}`),
  getById: (id: number) => request<Venue>(`/venues/${id}`),
  create: (body: Partial<Venue>) =>
    request<Venue>('/venues', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Partial<Venue>) =>
    request<Venue>(`/venues/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) =>
    request<void>(`/venues/${id}`, { method: 'DELETE' }),
}

export const usersApi = {
  getAll: () => request<User[]>('/users'),
  getById: (id: number) => request<User>(`/users/${id}`),
  create: (body: Partial<User>) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Partial<User>) =>
    request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) =>
    request<void>(`/users/${id}`, { method: 'DELETE' }),
}

export interface AuthResponse {
  token: string
  user: User
}

export const registrationsApi = {
  book: (eventId: number, numberOfTickets: number) =>
    request<Booking>('/registrations', {
      method: 'POST',
      body: JSON.stringify({ eventId, numberOfTickets }),
    }),
  getMyBookings: () => request<Booking[]>('/registrations/my-bookings'),
  getInvoice: (id: number) => request<Invoice>(`/registrations/${id}/invoice`),
  hasBooked: (eventId: number) =>
    request<boolean>(`/registrations/has-booked/${eventId}`),
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (firstName: string, lastName: string, email: string, password: string, role: 'ORGANIZER' | 'ATTENDEE') =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password, role }),
    }),
}

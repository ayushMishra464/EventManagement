// ============================================
// Member 6: Events list – search, filter, create, link to detail
// ============================================

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, DollarSign, Search, Plus, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { eventsApi, venuesApi } from '@/services/api'
import type { Event, Venue } from '@/types'
import type { EventStatus } from '@/types'
import { formatDate } from '@/lib/utils'

const STATUS_OPTIONS: { value: '' | EventStatus; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
]

export function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | EventStatus>('')
  const [showCreate, setShowCreate] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', startDate: '', endDate: '',
    status: 'DRAFT' as EventStatus, ticketPrice: '', venueId: '',
  })
  const [autoLocation, setAutoLocation] = useState('')
  const [autoCapacity, setAutoCapacity] = useState<number | null>(null)
  
  const canCreateEvents = user?.role === 'ORGANIZER' || user?.role === 'ADMIN'
  
  const handleVenueChange = (venueId: string) => {
    setForm((f) => ({ ...f, venueId }))
    if (venueId) {
      const venue = venues.find((v) => v.id === Number(venueId))
      if (venue) {
        const locationParts = [venue.address, venue.city, venue.state].filter(Boolean)
        setAutoLocation(locationParts.join(', ') || '')
        setAutoCapacity(venue.capacity || null)
      }
    } else {
      setAutoLocation('')
      setAutoCapacity(null)
    }
  }

  const fetchEvents = useCallback(() => {
    setLoading(true)
    eventsApi.getAll({
      search: search || undefined,
      status: statusFilter || undefined,
    })
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [search, statusFilter])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    venuesApi.getAll().then(setVenues).catch(() => {})
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mb-4" />
        <p className="text-muted-foreground">Loading events…</p>
      </div>
    )
  }
  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm">
        Error: {error}
      </div>
    )
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    setCreateLoading(true)
    try {
      await eventsApi.create({
        name: form.name,
        description: form.description || undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        status: form.status,
        ticketPrice: form.ticketPrice ? Number(form.ticketPrice) : undefined,
        venueId: form.venueId ? Number(form.venueId) : undefined,
        // Location and maxAttendees auto-populated by backend from venue
      })
      setForm({ name: '', description: '', startDate: '', endDate: '', status: 'DRAFT', ticketPrice: '', venueId: '' })
      setAutoLocation('')
      setAutoCapacity(null)
      setShowCreate(false)
      toast.success('Event created successfully!')
      fetchEvents()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Events</h1>
        {canCreateEvents && (
          <Button onClick={() => setShowCreate((v) => !v)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add event
          </Button>
        )}
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | EventStatus)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>New event</CardTitle>
            <CardDescription>Fill in the details below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as EventStatus }))}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start date *</Label>
                  <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>End date *</Label>
                  <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Venue *</Label>
                <select
                  value={form.venueId}
                  onChange={(e) => handleVenueChange(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select a venue</option>
                  {venues.filter((v) => v.isActive !== false).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.capacity && `(${v.capacity} capacity)`}
                    </option>
                  ))}
                </select>
                {autoLocation && (
                  <p className="text-xs text-muted-foreground">
                    Location will be: {autoLocation}
                  </p>
                )}
                {autoCapacity != null && (
                  <p className="text-xs text-muted-foreground">
                    Max attendees will be set to: {autoCapacity} (from venue capacity)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Ticket price (Rs)</Label>
                <Input type="number" min={0} step={0.01} value={form.ticketPrice} onChange={(e) => setForm((f) => ({ ...f, ticketPrice: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createLoading}>{createLoading ? 'Creating…' : 'Create event'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {events.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-muted-foreground">
            No events match your filters. Try changing search or status, or create one.
          </div>
        ) : (
          events.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`}>
              <Card className="border-border/60 shadow-soft hover:shadow-glow/30 transition-shadow h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{event.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{event.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    {formatDate(event.startDate)} – {formatDate(event.endDate)}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                  {event.ticketPrice != null && event.ticketPrice > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 shrink-0" />
                      Rs {event.ticketPrice}
                    </div>
                  )}
                  {event.ticketsLeft != null && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Ticket className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className={event.ticketsLeft === 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                        {event.ticketsLeft === 0 ? 'Sold out' : `${event.ticketsLeft} left`}
                      </span>
                    </div>
                  )}
                  <div className="pt-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {event.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

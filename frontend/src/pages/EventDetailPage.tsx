// Event detail page

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, DollarSign, Building2, ArrowLeft, Ticket, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { eventsApi, registrationsApi } from '@/services/api'
import type { Event , Invoice } from '@/types'
import { formatDate } from '@/lib/utils'
import { BookEventModal } from '@/components/booking/BookEventModal'
import { InvoiceDialog } from '@/components/booking/InvoiceDialog'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBookModal, setShowBookModal] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [hasBooked, setHasBooked] = useState(false)

  useEffect(() => {
    if (!id) return
    eventsApi.getById(Number(id))
      .then(setEvent)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id || !user) return
    registrationsApi.hasBooked(Number(id))
      .then(setHasBooked)
      .catch(() => {})
  }, [id, user])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mb-4" />
        <p className="text-muted-foreground">Loading event...</p>
      </div>
    )
  }
  if (error || !event) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/events" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to events
          </Link>
        </Button>
        <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3">
          {error || 'Event not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" asChild>
        <Link to="/events" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>
      </Button>
      <Card className="border-border/60 shadow-soft overflow-hidden">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
              {event.status}
            </span>
            {event.venueName && (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                {event.venueName}
              </span>
            )}
          </div>
          <CardTitle className="text-2xl sm:text-3xl">{event.name}</CardTitle>
          {event.description && (
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{formatDate(event.startDate)} to {formatDate(event.endDate)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            {event.maxAttendees != null && (
              <p className="text-sm">
                <span className="text-muted-foreground">Max capacity: </span>
                <span className="font-medium">{event.maxAttendees}</span>
              </p>
            )}
            {event.ticketsLeft != null && (
              <p className="text-sm flex items-center gap-1">
                <Ticket className="h-4 w-4" />
                <span className={event.ticketsLeft === 0 ? 'font-medium text-destructive' : 'font-medium'}>
                  {event.ticketsLeft === 0 ? 'Sold out' : `${event.ticketsLeft} tickets left`}
                </span>
              </p>
            )}
            {event.ticketPrice != null && event.ticketPrice > 0 && (
              <p className="text-sm flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">Rs {event.ticketPrice}</span>
              </p>
            )}
            {(user?.role === 'ATTENDEE' || user?.role === 'ADMIN') && event.status === 'PUBLISHED' && (
              <div className="ml-auto">
                {hasBooked ? (
                  <Button variant="outline" disabled className="gap-2">
                    <Check className="h-4 w-4" />
                    Already Booked
                  </Button>
                ) : event.ticketsLeft !== undefined && event.ticketsLeft === 0 ? (
                  <Button variant="outline" disabled className="gap-2">
                    <Ticket className="h-4 w-4" />
                    Sold Out
                  </Button>
                ) : (
                  <Button onClick={() => setShowBookModal(true)} className="gap-2">
                    <Ticket className="h-4 w-4" />
                    Book Now
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {event && (
        <BookEventModal
          eventName={event.name}
          ticketPrice={event.ticketPrice}
          maxAvailable={event.ticketsLeft != null ? event.ticketsLeft : (event.maxAttendees ?? 999)}
          open={showBookModal}
          onClose={() => setShowBookModal(false)}
          onConfirm={async (quantity) => {
            const booking = await registrationsApi.book(event.id, quantity)
            setHasBooked(true)
            toast.success(`Booking confirmed! ${quantity} ticket(s) for ${event.name}.`)
            const inv = await registrationsApi.getInvoice(booking.id)
            setInvoice(inv)
            setShowInvoice(true)
            eventsApi.getById(event.id).then(setEvent)
          }}
        />
      )}

      <InvoiceDialog
        invoice={invoice}
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
      />
    </div>
  )
}

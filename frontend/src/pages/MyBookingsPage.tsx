// My Bookings page - list bookings and view invoices

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Ticket, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { registrationsApi } from '@/services/api'
import type { Booking } from '@/types'
import { formatDate } from '@/lib/utils'
import { InvoiceDialog } from '@/components/booking/InvoiceDialog'

export function MyBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [invoiceBookingId, setInvoiceBookingId] = useState<number | null>(null)
  const [invoice, setInvoice] = useState<Parameters<typeof InvoiceDialog>[0]['invoice'] | null>(null)

  useEffect(() => {
    registrationsApi.getMyBookings()
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleViewInvoice = async (id: number) => {
    try {
      const inv = await registrationsApi.getInvoice(id)
      setInvoice(inv)
      setInvoiceBookingId(id)
    } catch {
      // ignore
    }
  }

  const canViewBookings = user?.role === 'ATTENDEE' || user?.role === 'ADMIN'

  if (!canViewBookings) {
    return <div className="text-destructive">Access denied. Attendees only.</div>
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Bookings</h1>
        <p className="text-muted-foreground mt-1">
          View your event registrations and download invoices
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
              <Ticket className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
              Browse events and book tickets to see them here. Your invoices will be available for download.
            </p>
            <Button asChild>
              <Link to="/events">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="border-border/60 shadow-soft hover:shadow-glow/20 transition-shadow overflow-hidden"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-1">{booking.eventName}</CardTitle>
                  <span
                    className={
                      booking.paymentStatus === 'COMPLETED'
                        ? 'shrink-0 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400'
                        : 'shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium'
                    }
                  >
                    {booking.paymentStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  {formatDate(booking.eventStartDate)}
                </div>
                {booking.eventLocation && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground line-clamp-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {booking.eventLocation}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tickets</span>
                  <span className="font-medium">{booking.numberOfTickets}</span>
                </div>
                {booking.ticketPrice != null && booking.ticketPrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">
                      Rs {((booking.ticketPrice ?? 0) * booking.numberOfTickets).toFixed(2)}
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground font-mono">{booking.ticketCode}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => handleViewInvoice(booking.id)}
                >
                  <FileText className="h-4 w-4" />
                  View Invoice
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <InvoiceDialog
        invoice={invoice}
        open={!!invoiceBookingId}
        onClose={() => {
          setInvoiceBookingId(null)
          setInvoice(null)
        }}
      />
    </div>
  )
}

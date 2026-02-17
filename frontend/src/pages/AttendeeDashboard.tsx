// ============================================
// Member 6: Attendee Dashboard – browse events, view bookings
// ============================================

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { eventsApi } from '@/services/api'
import type { Event } from '@/types'
import { formatDate } from '@/lib/utils'

export function AttendeeDashboard() {
  const { user } = useAuth()
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    eventsApi.getUpcoming(10)
      .then(setUpcomingEvents)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (user?.role !== 'ATTENDEE') {
    return <div className="text-destructive">Access denied. Attendee only.</div>
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Attendee Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome, {user.firstName} {user.lastName}</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/events">Browse All Events</Link>
        </Button>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            My Bookings
          </CardTitle>
          <CardDescription>View and manage your event registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/bookings">View My Bookings</Link>
          </Button>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/events">View all</Link>
          </Button>
        </div>
        {loading ? (
          <div className="text-muted-foreground">Loading events...</div>
        ) : upcomingEvents.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No upcoming events available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="border-border/60 shadow-soft hover:shadow-glow/30 transition-shadow h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-1">{event.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {event.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">
                        {formatDate(event.startDate)} – {formatDate(event.endDate)}
                      </span>
                    </div>
                    {event.location && (
                      <p className="text-muted-foreground text-xs line-clamp-1">{event.location}</p>
                    )}
                    {event.ticketPrice != null && event.ticketPrice > 0 && (
                      <p className="font-medium">Rs {event.ticketPrice}</p>
                    )}
                    {event.ticketsLeft != null && (
                      <p className={`text-xs flex items-center gap-1 ${event.ticketsLeft === 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        <Ticket className="h-3.5 w-3.5 shrink-0" />
                        {event.ticketsLeft === 0 ? 'Sold out' : `${event.ticketsLeft} tickets left`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

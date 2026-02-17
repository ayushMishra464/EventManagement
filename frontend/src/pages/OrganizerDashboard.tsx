// ============================================
// Member 6: Organizer Dashboard – manage own events
// ============================================

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/utils'
import { eventsApi } from '@/services/api'
import type { Event } from '@/types'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function OrganizerDashboard() {
  const { user } = useAuth()
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    eventsApi.getAll()
      .then((events) => {
        // Filter to show only organizer's events + all published
        const filtered = events.filter((e) => 
          e.organizerId === user?.id || e.status === 'PUBLISHED'
        )
        setMyEvents(filtered)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (user?.role !== 'ORGANIZER') {
    return <div className="text-destructive">Access denied. Organizer only.</div>
  }

  const myOwnEvents = myEvents.filter((e) => e.organizerId === user.id)
  const publishedCount = myOwnEvents.filter((e) => e.status === 'PUBLISHED').length
  const draftCount = myOwnEvents.filter((e) => e.status === 'DRAFT').length

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Organizer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome, {user.firstName} {user.lastName}</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/events">
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-border/60 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Events</CardTitle>
            <p className="text-2xl font-bold">{myOwnEvents.length}</p>
          </CardHeader>
        </Card>
        <Card className="border-border/60 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
            <p className="text-2xl font-bold text-primary">{publishedCount}</p>
          </CardHeader>
        </Card>
        <Card className="border-border/60 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
            <p className="text-2xl font-bold">{draftCount}</p>
          </CardHeader>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Events</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/events">View all</Link>
          </Button>
        </div>
        {loading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : myOwnEvents.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">You haven't created any events yet</p>
              <Button asChild>
                <Link to="/events">Create your first event</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {myOwnEvents.slice(0, 6).map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="border-border/60 shadow-soft hover:shadow-glow/30 transition-shadow h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-1">{event.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {formatDate(event.startDate)}
                      {event.venueName && ` · ${event.venueName}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {event.status}
                    </span>
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

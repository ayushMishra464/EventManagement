// ============================================
// Member 6: Admin Dashboard – manage users, venues, view all events
// ============================================

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardApi, eventsApi, usersApi, venuesApi, type DashboardStats } from '@/services/api'
import type { Event, User, Venue } from '@/types'
import { Calendar, MapPin, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentEvents, setRecentEvents] = useState<Event[]>([])
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [recentVenues, setRecentVenues] = useState<Venue[]>([])

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      eventsApi.getAll(),
      usersApi.getAll(),
      venuesApi.getAll(),
    ])
      .then(([s, e, u, v]) => {
        setStats(s)
        setRecentEvents(e.slice(0, 5))
        setRecentUsers(u.slice(0, 5))
        setRecentVenues(v.slice(0, 5))
      })
      .catch(() => {})
  }, [])

  if (user?.role !== 'ADMIN') {
    return <div className="text-destructive">Access denied. Admin only.</div>
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome, {user.firstName} {user.lastName}</p>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/60 shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Total Events
              </CardTitle>
              <p className="text-2xl font-bold">{stats.eventCount}</p>
            </CardHeader>
          </Card>
          <Card className="border-border/60 shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Venues
              </CardTitle>
              <p className="text-2xl font-bold">{stats.venueCount}</p>
            </CardHeader>
          </Card>
          <Card className="border-border/60 shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </CardTitle>
              <p className="text-2xl font-bold">{stats.userCount}</p>
            </CardHeader>
          </Card>
          <Card className="border-border/60 shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Published
              </CardTitle>
              <p className="text-2xl font-bold text-primary">{stats.publishedEventCount}</p>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Events</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/events">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events yet</p>
            ) : (
              <div className="space-y-2">
                {recentEvents.map((e) => (
                  <Link key={e.id} to={`/events/${e.id}`}>
                    <div className="text-sm hover:text-primary transition-colors">
                      <p className="font-medium">{e.name}</p>
                      <p className="text-muted-foreground text-xs">{e.status}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Users</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/users">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet</p>
            ) : (
              <div className="space-y-2">
                {recentUsers.map((u) => (
                  <div key={u.id} className="text-sm">
                    <p className="font-medium">{u.firstName} {u.lastName}</p>
                    <p className="text-muted-foreground text-xs">{u.email} · {u.role}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Venues</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/venues">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentVenues.length === 0 ? (
              <p className="text-sm text-muted-foreground">No venues yet</p>
            ) : (
              <div className="space-y-2">
                {recentVenues.map((v) => (
                  <Link key={v.id} to={`/venues/${v.id}`}>
                    <div className="text-sm hover:text-primary transition-colors">
                      <p className="font-medium">{v.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {v.city && v.state ? `${v.city}, ${v.state}` : 'No location'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button asChild>
          <Link to="/events">Manage Events</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/venues">Manage Venues</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/users">Manage Users</Link>
        </Button>
      </div>
    </div>
  )
}

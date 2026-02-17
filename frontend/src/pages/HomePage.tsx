// ============================================
// Home Page – Role Based (Admin / Organizer / Attendee)
// ============================================

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Ticket,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { useAuth } from "@/contexts/AuthContext"
import { dashboardApi } from "@/services/api"
import { eventsApi } from "@/services/api"

import type { DashboardStats } from "@/services/api"
import type { Event } from "@/types"
import { formatDate } from "@/lib/utils"

export function HomePage() {
  const { isAuthenticated, user } = useAuth()
  const role = user?.role

  const isAdmin = role === "ADMIN"
  const isOrganizer = role === "ORGANIZER"
  const isAttendee = role === "ATTENDEE"

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [upcoming, setUpcoming] = useState<Event[]>([])

  useEffect(() => {
    if (!isAuthenticated) return

    if (isAdmin || isOrganizer) {
      Promise.all([dashboardApi.getStats(), eventsApi.getUpcoming(5)])
        .then(([s, e]) => {
          setStats(s)
          setUpcoming(e)
        })
        .catch(() => {})
    }

    if (isAttendee) {
      eventsApi
        .getUpcoming(5) // Ideally this should be getMyRegisteredEvents()
        .then((e) => setUpcoming(e))
        .catch(() => {})
    }
  }, [isAuthenticated, role])

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* ================= HERO ================= */}
      <section className="relative text-center space-y-6 py-10 sm:py-14 md:py-18 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 pointer-events-none" />
        <div className="relative space-y-4 max-w-3xl mx-auto px-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Plan, host & discover events
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Event Management
            <span className="block text-primary mt-1">Made Simple</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Plan, schedule, and manage events with venues, registrations, and
            reporting—all in one place.
          </p>

          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center flex-wrap pt-2">
            <Button asChild size="lg" className="h-11 px-6 text-base shadow-soft">
              <Link to="/events">
                Browse Events <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            {(isAdmin || isOrganizer) && (
              <Button asChild variant="outline" size="lg">
                <Link to="/events/create">Create Event</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ================= ROLE BASED DASHBOARD ================= */}

      {isAuthenticated && isAdmin && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Admin Dashboard
          </h2>

          {stats && (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Events" value={stats.eventCount} />
              <StatCard title="Published" value={stats.publishedEventCount} />
              <StatCard title="Venues" value={stats.venueCount} />
              <StatCard title="Users" value={stats.userCount} />
            </div>
          )}

          <UpcomingEvents upcoming={upcoming} />
        </section>
      )}

      {isAuthenticated && isOrganizer && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">My Events Dashboard</h2>

          {stats && (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
              <StatCard title="My Events" value={stats.eventCount} />
              <StatCard title="Published" value={stats.publishedEventCount} />
            </div>
          )}

          <UpcomingEvents upcoming={upcoming} />
        </section>
      )}
{/* 
      {isAuthenticated && isAttendee && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">My Upcoming Events</h2>

          {upcoming.length > 0 ? (
            <UpcomingEvents upcoming={upcoming} />
          ) : (
            <p className="text-muted-foreground">
              You haven’t registered for any events yet.
            </p>
          )}
        </section>
      )} */}

      {/* ================= FEATURE CARDS ================= */}

      <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {(isAdmin || isOrganizer) && (
          <FeatureCard
            icon={<Calendar className="h-6 w-6" />}
            title="Events"
            description="Create and manage events."
            link="/events"
          />
        )}

        {isAdmin && (
          <FeatureCard
            icon={<MapPin className="h-6 w-6" />}
            title="Venues"
            description="Manage venues and capacity."
            link="/venues"
          />
        )}

        {isAdmin && (
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Users"
            description="Manage platform users."
            link="/users"
          />
        )}

        {/* {isAttendee && (
          <FeatureCard
            icon={<Calendar className="h-6 w-6" />}
            title="Browse Events"
            description="Discover and register for events."
            link="/events"
          />
        )} */}
      </section>
    </div>
  )
}

/* ================= REUSABLE COMPONENTS ================= */

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="border-border/60 shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <p className="text-2xl font-bold">{value}</p>
      </CardHeader>
    </Card>
  )
}

function UpcomingEvents({ upcoming }: { upcoming: Event[] }) {
  if (upcoming.length === 0) return null

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Upcoming Events</h3>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {upcoming.slice(0, 6).map((event) => (
          <Link key={event.id} to={`/events/${event.id}`}>
            <Card className="border-border/60 shadow-soft hover:shadow-glow/30 transition-shadow h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base line-clamp-1">
                  {event.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {formatDate(event.startDate)}
                  {event.venueName && ` · ${event.venueName}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {event.ticketsLeft != null && (
                  <p className={`text-xs ${event.ticketsLeft === 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    <Ticket className="h-3.5 w-3.5 inline mr-1" />
                    {event.ticketsLeft === 0 ? 'Sold out' : `${event.ticketsLeft} tickets left`}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  link,
}: {
  icon: React.ReactNode
  title: string
  description: string
  link: string
}) {
  return (
    <Card className="border-border/60 shadow-soft hover:shadow-glow/50 transition-shadow duration-300 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="secondary" className="w-full sm:w-auto">
          <Link to={link}>Go</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

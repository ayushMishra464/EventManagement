// ============================================
// Member 6: Venue detail page
// ============================================

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Users, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { venuesApi } from '@/services/api'
import type { Venue } from '@/types'

export function VenueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    venuesApi
      .getById(Number(id))
      .then(setVenue)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mb-4" />
        <p className="text-muted-foreground">Loading venue…</p>
      </div>
    )
  }
  if (error || !venue) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/venues" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to venues
          </Link>
        </Button>
        <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3">
          {error || 'Venue not found'}
        </div>
      </div>
    )
  }

  const location = [venue.city, venue.state].filter(Boolean).join(', ') || 'No location'

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" asChild>
        <Link to="/venues" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to venues
        </Link>
      </Button>
      <Card className="border-border/60 shadow-soft overflow-hidden">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            {venue.isActive === false && (
              <span className="text-destructive text-sm font-medium">Inactive</span>
            )}
          </div>
          <CardTitle className="text-2xl sm:text-3xl">{venue.name}</CardTitle>
          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            {location}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {venue.address && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Address: </span>
              {venue.address}
              {venue.zipCode && ` ${venue.zipCode}`}
            </p>
          )}
          {venue.capacity != null && (
            <p className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">Capacity: {venue.capacity}</span>
            </p>
          )}
          {venue.amenities && (
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Amenities</p>
              <p className="text-sm text-muted-foreground">{venue.amenities}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

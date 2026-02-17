// ============================================
// Member 6: Venues list – create venue, link to detail
// ============================================

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { venuesApi } from '@/services/api'
import type { Venue } from '@/types'

export function VenuesPage() {
  const { user } = useAuth()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', address: '', city: '', state: '', zipCode: '', capacity: '', amenities: '',
  })
  
  const canCreateVenues = user?.role === 'ADMIN'

  const fetchVenues = () => {
    setLoading(true)
    venuesApi.getAll()
      .then(setVenues)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchVenues()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mb-4" />
        <p className="text-muted-foreground">Loading venues…</p>
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
      await venuesApi.create({
        name: form.name,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        zipCode: form.zipCode || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        amenities: form.amenities || undefined,
        isActive: true,
      })
      setForm({ name: '', address: '', city: '', state: '', zipCode: '', capacity: '', amenities: '' })
      setShowCreate(false)
      toast.success('Venue created successfully!')
      fetchVenues()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Venues</h1>
        {canCreateVenues && (
          <Button onClick={() => setShowCreate((v) => !v)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add venue
          </Button>
        )}
      </div>

      {showCreate && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>New venue</CardTitle>
            <CardDescription>Fill in the details below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              {createError && <p className="text-sm text-destructive">{createError}</p>}
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>ZIP code</Label>
                  <Input value={form.zipCode} onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input type="number" min={1} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Amenities</Label>
                <Input value={form.amenities} onChange={(e) => setForm((f) => ({ ...f, amenities: e.target.value }))} placeholder="e.g. Parking, WiFi" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createLoading}>{createLoading ? 'Creating…' : 'Create venue'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {venues.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-muted-foreground">
            No venues yet. Add one using the button above.
          </div>
        ) : (
          venues.map((venue) => (
            <Link key={venue.id} to={`/venues/${venue.id}`}>
              <Card className="border-border/60 shadow-soft hover:shadow-glow/30 transition-shadow h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{venue.name}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    {[venue.city, venue.state].filter(Boolean).join(', ') || 'No location'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {venue.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{venue.address}</span>
                    </div>
                  )}
                  {venue.capacity != null && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0" />
                      Capacity: {venue.capacity}
                    </div>
                  )}
                  {venue.amenities && (
                    <p className="text-xs pt-1 line-clamp-2">{venue.amenities}</p>
                  )}
                  {venue.isActive === false && (
                    <span className="text-destructive text-xs font-medium">Inactive</span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

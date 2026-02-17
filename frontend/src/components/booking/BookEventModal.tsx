// Book event modal - select quantity and confirm booking

import { useState } from 'react'
import { Ticket, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface BookEventModalProps {
  eventName: string
  ticketPrice?: number
  maxAvailable: number
  open: boolean
  onClose: () => void
  onConfirm: (quantity: number) => Promise<void>
}

export function BookEventModal({
  eventName,
  ticketPrice,
  maxAvailable,
  open,
  onClose,
  onConfirm,
}: BookEventModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (quantity < 1 || quantity > maxAvailable) {
      setError(maxAvailable === 0 ? 'No tickets available for this event.' : `Please enter 1–${maxAvailable} tickets`)
      return
    }
    setLoading(true)
    try {
      await onConfirm(quantity)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  const total = ticketPrice != null ? ticketPrice * quantity : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md bg-background rounded-xl shadow-2xl border border-border p-6">
        <h2 className="text-xl font-bold mb-2">Book Tickets</h2>
        <p className="text-muted-foreground text-sm mb-4">{eventName}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 text-destructive text-sm px-3 py-2">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="quantity">Number of tickets</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={maxAvailable}
              value={quantity}
              disabled={maxAvailable === 0}
              onChange={(e) => setQuantity(Math.max(1, Math.min(maxAvailable, parseInt(e.target.value) || 1)))}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              {maxAvailable === 0 ? 'No tickets available' : `${maxAvailable} ticket${maxAvailable === 1 ? '' : 's'} available`}
            </p>
          </div>
          {ticketPrice != null && ticketPrice > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-bold text-lg">Rs {total.toFixed(2)}</span>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={loading || maxAvailable === 0}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ticket className="h-4 w-4" />
              )}
              Confirm Booking
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

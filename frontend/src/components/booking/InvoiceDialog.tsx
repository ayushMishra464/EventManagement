// Invoice dialog - printable invoice view for bookings

import { Calendar, MapPin, Ticket, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Invoice } from '@/types'
import { formatDate, formatDateShort } from '@/lib/utils'

interface InvoiceDialogProps {
  invoice: Invoice | null
  open: boolean
  onClose: () => void
}

export function InvoiceDialog({ invoice, open, onClose }: InvoiceDialogProps) {
  if (!open) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:block">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm print:bg-transparent print:backdrop-blur-none"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-xl shadow-2xl border border-border print:max-h-none print:shadow-none print:border-0 print:bg-white"
        id="invoice-content"
      >
        <div className="p-6 sm:p-8 print:p-8">
          <div className="flex justify-between items-start mb-6 print:mb-4">
            <div>
              <h2 className="text-2xl font-bold text-primary">EventHub</h2>
              <p className="text-sm text-muted-foreground">Event Management System</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 print:hidden"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {invoice && (
            <>
              <div className="border-b border-border pb-4 mb-6">
                <h1 className="text-xl font-bold mb-1">Invoice</h1>
                <p className="text-sm text-muted-foreground">
                  Invoice # {invoice.invoiceNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Date: {formatDateShort(invoice.issueDate)}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Event Details
                  </h3>
                  <p className="font-medium">{invoice.eventName}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    {formatDate(invoice.eventDate)}
                  </div>
                  {invoice.eventLocation && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {invoice.eventLocation}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Attendee
                  </h3>
                  <p className="font-medium">{invoice.attendeeName}</p>
                  <p className="text-sm text-muted-foreground">{invoice.attendeeEmail}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-right p-3 font-medium">Qty</th>
                      <th className="text-right p-3 font-medium">Unit Price</th>
                      <th className="text-right p-3 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-primary" />
                          Event Ticket — {invoice.eventName}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ticket Code: {invoice.ticketCode}
                        </p>
                      </td>
                      <td className="p-3 text-right">{invoice.numberOfTickets}</td>
                      <td className="p-3 text-right">Rs {invoice.unitPrice.toFixed(2)}</td>
                      <td className="p-3 text-right font-medium">
                        Rs {(invoice.unitPrice * invoice.numberOfTickets).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-6">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">
                    Rs {invoice.totalAmount.toFixed(2)}
                  </p>
                  <span
                    className={
                      invoice.paymentStatus === 'COMPLETED'
                        ? 'inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-400'
                        : 'inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium'
                    }
                  >
                    {invoice.paymentStatus}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center print:block">
                Thank you for booking with EventHub. Present this ticket at the venue.
              </p>
            </>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-border bg-muted/30 print:hidden">
          <Button onClick={handlePrint} className="flex-1">
            Print / Save PDF
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

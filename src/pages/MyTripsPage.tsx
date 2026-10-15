import {
  Calendar,
  Copy,
  MapPin,
  Plus,
  Printer,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatUsd, itineraryTotal } from '../lib/budgetCalculator'
import { destinationCopy } from '../data/places'
import { BUDGET_LABELS } from '../types'

export function MyTripsPage() {
  const { trips, openTrip, deleteTrip, duplicateTrip, setCurrentItinerary } = useApp()
  const navigate = useNavigate()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState('')

  const handleDuplicate = (id: string) => {
    const copy = duplicateTrip(id)
    if (copy) {
      setToastMessage(`Duplicated as "${copy.title}"`)
      setTimeout(() => setToastMessage(''), 3000)
    }
  }

  const confirmDelete = () => {
    if (deletingId) {
      deleteTrip(deletingId)
      setDeletingId(null)
      setToastMessage('Trip deleted.')
      setTimeout(() => setToastMessage(''), 3000)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-moss">Trip Archive</p>
          <h1 className="mt-2 font-display text-5xl text-ivory">Saved Journeys</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone">
            All your generated itineraries persist locally on this browser. Open any trip to reorder
            activities, adjust budgets, or export clean printable PDFs.
          </p>
        </div>

        {trips.length > 0 && (
          <button
            type="button"
            onClick={() => navigate('/plan')}
            className="inline-flex items-center gap-2 rounded bg-moss px-5 py-2.5 text-xs font-semibold text-ink shadow transition hover:bg-olive"
          >
            <Plus size={14} /> Plan New Trip
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="mt-4 rounded border border-moss/30 bg-moss/10 px-4 py-2 text-xs font-medium text-moss">
          {toastMessage}
        </div>
      )}

      {trips.length === 0 ? (
        <div className="mt-14 rounded-sm border border-line bg-panel p-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-moss/20 text-moss">
            <Calendar size={28} />
          </div>
          <h2 className="mt-4 font-display text-3xl text-ivory">No saved itineraries yet.</h2>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-stone">
            Choose a city, duration, and rhythm. Obscura will construct a custom itinerary
            tailored to your interests.
          </p>
          <button
            type="button"
            onClick={() => navigate('/plan')}
            className="mt-6 rounded bg-moss px-6 py-3 text-xs font-semibold text-ink transition hover:bg-olive"
          >
            Plan Your First Trip
          </button>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {trips.map((trip) => {
            const copy = destinationCopy[trip.destination]
            const total = itineraryTotal(trip)
            const stopCount = trip.days.reduce((acc, d) => acc + d.activities.length, 0)

            return (
              <article
                key={trip.id}
                className="group flex flex-col justify-between overflow-hidden rounded-sm border border-line bg-panel transition hover:border-moss/40 hover:shadow-xl"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-charcoal">
                    <img
                      src={copy.imageUrl}
                      alt={trip.destination}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/30 to-transparent" />
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <span className="rounded-sm bg-ink/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-moss backdrop-blur-sm">
                        {trip.destination}
                      </span>
                      <span className="rounded-sm bg-ink/80 px-2 py-1 text-[11px] text-stone backdrop-blur-sm">
                        {trip.preferences.durationDays} {trip.preferences.durationDays === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-display text-3xl text-ivory transition group-hover:text-moss">
                      {trip.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-stone">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-moss" /> {stopCount} stops scheduled
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-medium text-ivory">
                        <Wallet size={12} className="text-moss" /> {formatUsd(total)} est.
                      </span>
                      <span>·</span>
                      <span>{trip.preferences.travelers} {trip.preferences.travelers === 1 ? 'traveler' : 'travelers'}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-stone-muted">
                      <span className="rounded bg-charcoal px-2 py-0.5">
                        {BUDGET_LABELS[trip.preferences.budget]}
                      </span>
                      <span className="rounded bg-charcoal px-2 py-0.5 capitalize">
                        {trip.preferences.pace} pace
                      </span>
                      <span className="rounded bg-charcoal px-2 py-0.5">
                        Updated {new Date(trip.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-line bg-charcoal/50 p-4">
                  <button
                    type="button"
                    onClick={() => {
                      openTrip(trip.id)
                      navigate('/itinerary')
                    }}
                    className="flex-1 rounded bg-moss py-2 text-center text-xs font-semibold text-ink transition hover:bg-olive"
                  >
                    Open & Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentItinerary(trip)
                      navigate('/itinerary')
                      window.setTimeout(() => window.print(), 350)
                    }}
                    className="inline-flex items-center gap-1.5 rounded border border-line px-3.5 py-2 text-xs font-medium text-stone transition hover:border-moss hover:text-ivory"
                    title="Print or export to PDF"
                  >
                    <Printer size={13} /> Print
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(trip.id)}
                    className="inline-flex items-center gap-1.5 rounded border border-line px-3 py-2 text-xs text-stone transition hover:border-moss hover:text-ivory"
                    title="Duplicate itinerary"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(trip.id)}
                    className="rounded border border-line p-2 text-stone transition hover:border-rose-400 hover:text-rose-400"
                    title="Delete saved trip"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded border border-line bg-charcoal p-6 shadow-2xl">
            <h4 className="font-display text-2xl text-ivory">Delete this itinerary?</h4>
            <p className="mt-2 text-xs leading-relaxed text-stone">
              This will permanently remove this journey from your browser’s local storage. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded border border-line px-4 py-2 text-xs text-stone hover:text-ivory"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded bg-rose-500/80 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

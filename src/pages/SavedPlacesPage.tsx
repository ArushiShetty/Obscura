import { Bookmark, Calendar, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlaceCard } from '../components/PlaceCard'
import { PlaceDetails } from '../components/PlaceDetails'
import { useApp } from '../context/AppContext'
import { getPlaceById } from '../data/places'
import type { Destination, Place } from '../types'
import { DESTINATIONS } from '../types'

export function SavedPlacesPage() {
  const navigate = useNavigate()
  const { bookmarks, clearBookmarks, addActivityToDay, currentItinerary } = useApp()
  const [selected, setSelected] = useState<Place | null>(null)
  const [activeCity, setActiveCity] = useState<Destination | 'all'>('all')
  const [confirmClear, setConfirmClear] = useState(false)

  const saved = bookmarks
    .map((id) => getPlaceById(id))
    .filter((place): place is Place => Boolean(place))

  const filtered = activeCity === 'all'
    ? saved
    : saved.filter((p) => p.destination === activeCity)

  // Find most bookmarked city for quick trip planner shortcut
  const cityCounts = saved.reduce((acc, p) => {
    acc[p.destination] = (acc[p.destination] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topCity = (Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as Destination) || 'Kyoto'

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-moss">Private Bookmarks</p>
          <h1 className="mt-2 font-display text-5xl text-ivory">Saved Places</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone">
            Gems you pinned while exploring. Bookmarks persist in your browser’s localStorage
            and can be scheduled into itineraries at any time.
          </p>
        </div>

        {saved.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/plan?destination=${activeCity === 'all' ? topCity : activeCity}`)}
              className="inline-flex items-center gap-2 rounded bg-moss px-4 py-2.5 text-xs font-semibold text-ink shadow transition hover:bg-olive"
            >
              <Calendar size={14} /> Plan Trip Around These
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 rounded border border-line px-3 py-2.5 text-xs text-stone transition hover:border-rose-400 hover:text-rose-400"
            >
              <Trash2 size={13} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* City Tabs */}
      {saved.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-line pb-4 text-xs">
          <span className="text-stone-muted mr-1">Filter City:</span>
          <button
            type="button"
            onClick={() => setActiveCity('all')}
            className={`rounded px-3 py-1.5 font-medium transition ${
              activeCity === 'all'
                ? 'bg-moss text-ink shadow'
                : 'border border-line bg-panel text-stone hover:text-ivory'
            }`}
          >
            All Cities ({saved.length})
          </button>
          {DESTINATIONS.map((dest) => {
            const count = saved.filter((p) => p.destination === dest).length
            if (count === 0) return null
            return (
              <button
                key={dest}
                type="button"
                onClick={() => setActiveCity(dest)}
                className={`rounded px-3 py-1.5 font-medium transition ${
                  activeCity === dest
                    ? 'bg-moss text-ink shadow'
                    : 'border border-line bg-panel text-stone hover:text-ivory'
                }`}
              >
                {dest} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Bookmarks Grid or Empty State */}
      {saved.length === 0 ? (
        <div className="mt-14 rounded-sm border border-line bg-panel p-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-moss/20 text-moss">
            <Bookmark size={28} />
          </div>
          <h2 className="mt-4 font-display text-3xl text-ivory">No saved places yet.</h2>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-stone">
            While browsing the collection, tap the bookmark icon on any hidden gem to save it
            for your upcoming journeys.
          </p>
          <Link
            to="/discover"
            className="mt-6 inline-block rounded bg-moss px-6 py-3 text-xs font-semibold text-ink transition hover:bg-olive"
          >
            Explore 60 Hidden Gems
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded border border-line bg-panel p-12 text-center text-xs text-stone">
          No saved places in {activeCity}.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((place, idx) => (
            <PlaceCard
              key={place.id}
              place={place}
              onOpen={setSelected}
              aspectRatio={idx % 3 === 0 ? 'tall' : idx % 3 === 1 ? 'standard' : 'cinematic'}
            />
          ))}
        </div>
      )}

      {/* Place Details Inspection Modal */}
      {selected && (
        <PlaceDetails
          place={selected}
          onClose={() => setSelected(null)}
          onAddToTrip={
            currentItinerary && currentItinerary.destination === selected.destination
              ? (place) => {
                  addActivityToDay(currentItinerary.days[0]?.day ?? 1, {
                    id: crypto.randomUUID(),
                    placeId: place.id,
                    startTime: '15:00',
                    durationMinutes: place.durationMinutes,
                  })
                  setSelected(null)
                }
              : undefined
          }
        />
      )}

      {/* Clear Confirmation Modal */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded border border-line bg-charcoal p-6 shadow-2xl">
            <h4 className="font-display text-2xl text-ivory">Clear all saved places?</h4>
            <p className="mt-2 text-xs leading-relaxed text-stone">
              This will remove all {saved.length} bookmarked places from this device.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded border border-line px-4 py-2 text-xs text-stone hover:text-ivory"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearBookmarks()
                  setConfirmClear(false)
                }}
                className="rounded bg-rose-500/80 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

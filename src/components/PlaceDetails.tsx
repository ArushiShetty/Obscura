import { Bookmark, Clock, Compass, ExternalLink, MapPin, Plus, Sparkles, X } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Place } from '../types'
import { CATEGORY_LABELS, INTEREST_LABELS } from '../types'
import { formatUsd } from '../lib/budgetCalculator'
import { useApp } from '../context/AppContext'

interface PlaceDetailsProps {
  place: Place
  onClose: () => void
  onAddToTrip?: (place: Place) => void
}

export function PlaceDetails({ place, onClose, onAddToTrip }: PlaceDetailsProps) {
  const navigate = useNavigate()
  const { isBookmarked, toggleBookmark, currentItinerary } = useApp()
  const saved = isBookmarked(place.id)
  const matchingTrip =
    currentItinerary?.destination === place.destination ? currentItinerary : null

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/80 p-0 backdrop-blur-sm transition-opacity md:items-center md:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default focus:outline-none"
        aria-label="Close details"
        onClick={onClose}
      />
      <article className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-sm border border-line-strong bg-charcoal shadow-2xl">
        <div className="relative aspect-[16/9] w-full bg-panel">
          <img
            src={place.imageUrl}
            alt={place.imageAlt}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-black/30" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3.5 top-3.5 rounded-full bg-ink/80 p-2 text-ivory/80 transition hover:bg-ink hover:text-ivory"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-4 left-6 flex items-center gap-2">
            <span className="rounded-sm bg-moss px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink">
              {CATEGORY_LABELS[place.category]}
            </span>
            <span className="rounded-sm bg-ink/80 px-2.5 py-1 text-xs tracking-wider text-ivory backdrop-blur-sm">
              {place.destination}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-3xl text-ivory md:text-4xl">{place.name}</h2>
            <span className="font-display text-2xl text-moss">
              {place.estimatedCost === 0 ? 'Free' : `${formatUsd(place.estimatedCost)} / person`}
            </span>
          </div>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-stone">
            <MapPin size={15} className="text-moss" />
            <span>{place.neighborhood}, {place.destination}</span>
            <span className="text-stone-muted">·</span>
            <a
              href={`https://www.openstreetmap.org/?mlat=${place.coordinates.lat}&mlon=${place.coordinates.lng}#map=16/${place.coordinates.lat}/${place.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-moss hover:underline"
            >
              Open on OSM <ExternalLink size={11} />
            </a>
          </p>

          <p className="mt-5 text-base leading-relaxed text-stone/90">
            {place.description}
          </p>

          {/* Quick Stats Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded border border-line bg-panel p-3">
              <span className="flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-stone">
                <Clock size={12} className="text-moss" /> Suggested Visit
              </span>
              <p className="mt-1 font-medium text-ivory">{place.durationMinutes} minutes</p>
            </div>

            <div className="rounded border border-line bg-panel p-3">
              <span className="flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-stone">
                <Sparkles size={12} className="text-moss" /> Quietness
              </span>
              <div className="mt-1 flex items-center gap-2">
                <p className="font-medium text-ivory">{place.quietness} / 10</p>
                <div className="h-1.5 flex-1 rounded-full bg-ink">
                  <div
                    className="h-full rounded-full bg-moss"
                    style={{ width: `${place.quietness * 10}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="col-span-2 rounded border border-line bg-panel p-3 sm:col-span-1">
              <span className="flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-stone">
                <Compass size={12} className="text-moss" /> GPS Coordinates
              </span>
              <p className="mt-1 font-mono text-xs text-ivory">
                {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Interests tags */}
          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-muted">Curated themes</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {place.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded border border-line bg-panel px-2.5 py-1 text-xs tracking-wider text-stone"
                >
                  {INTEREST_LABELS[interest]}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            <button
              type="button"
              onClick={() => toggleBookmark(place.id)}
              className={`inline-flex items-center gap-2 rounded border px-4 py-2.5 text-sm font-medium transition ${
                saved
                  ? 'border-moss bg-moss/10 text-moss'
                  : 'border-line text-ivory hover:border-moss/50 hover:bg-panel'
              }`}
            >
              <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
              {saved ? 'Saved in Bookmarks' : 'Bookmark this Place'}
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {matchingTrip && onAddToTrip ? (
                <button
                  type="button"
                  onClick={() => onAddToTrip(place)}
                  className="inline-flex items-center gap-2 rounded bg-moss px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-olive"
                >
                  <Plus size={16} />
                  Add to Current {place.destination} Trip
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    navigate(`/plan?destination=${place.destination}&place=${place.id}`)
                  }}
                  className="inline-flex items-center gap-2 rounded bg-moss px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-olive"
                >
                  <Plus size={16} />
                  Plan Itinerary Around This
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

import {
  Calendar,
  MapPin,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Search,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BudgetSummary } from '../components/BudgetSummary'
import { ItineraryTimeline } from '../components/ItineraryTimeline'
import { MapBoundary } from '../components/MapBoundary'
import { MapView } from '../components/MapView'
import { PlaceDetails } from '../components/PlaceDetails'
import { useApp } from '../context/AppContext'
import { getPlaceById, getPlacesByDestination } from '../data/places'
import { formatUsd } from '../lib/budgetCalculator'
import { rankPlacesForPreferences } from '../lib/recommendationEngine'
import type { Place } from '../types'
import { CATEGORY_LABELS, INTEREST_LABELS } from '../types'

export function ItineraryPage() {
  const { currentItinerary, saveTrip, addActivityToDay, updateTripTitle } = useApp()

  const [selected, setSelected] = useState<Place | null>(null)
  const [addingDay, setAddingDay] = useState<number | null>(null)
  const [searchSuggestion, setSearchSuggestion] = useState('')
  const [activeDayTab, setActiveDayTab] = useState<number | null>(null) // null = all days
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [savedNote, setSavedNote] = useState('')

  // Places mapped for the current view (filtered by day if a day tab is active)
  const mappedPlaces = useMemo(() => {
    if (!currentItinerary) return []

    const relevantDays =
      activeDayTab === null
        ? currentItinerary.days
        : currentItinerary.days.filter((d) => d.day === activeDayTab)

    const ids = relevantDays.flatMap((day) =>
      day.activities.map((item) => item.placeId),
    )

    return [...new Set(ids)]
      .map((id) => getPlaceById(id))
      .filter((place): place is Place => Boolean(place))
  }, [activeDayTab, currentItinerary])

  // Available unused suggestions for adding to an itinerary day
  const suggestions = useMemo(() => {
    if (!currentItinerary || addingDay === null) return []
    const used = new Set(
      currentItinerary.days.flatMap((day) =>
        day.activities.map((item) => item.placeId),
      ),
    )
    const pool = getPlacesByDestination(currentItinerary.destination)
    const ranked = rankPlacesForPreferences(pool, currentItinerary.preferences)
      .map((item) => item.place)
      .filter((place) => !used.has(place.id))

    if (!searchSuggestion.trim()) return ranked

    const query = searchSuggestion.trim().toLowerCase()
    return ranked.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.neighborhood.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query),
    )
  }, [addingDay, currentItinerary, searchSuggestion])

  if (!currentItinerary) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-moss/20 text-moss">
          <Calendar size={28} />
        </div>
        <h1 className="mt-4 font-display text-5xl text-ivory">No active itinerary.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone">
          Generate an itinerary from your travel preferences, or reopen one of your saved journeys.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/plan"
            className="rounded bg-moss px-6 py-3 text-sm font-medium text-ink transition hover:bg-olive"
          >
            Plan a Trip
          </Link>
          <Link
            to="/trips"
            className="rounded border border-line px-6 py-3 text-sm text-ivory transition hover:border-moss"
          >
            View Saved Trips
          </Link>
        </div>
      </div>
    )
  }

  const handleStartEditTitle = () => {
    setTitleDraft(currentItinerary.title)
    setIsEditingTitle(true)
  }

  const handleSaveTitle = () => {
    if (titleDraft.trim()) {
      updateTripTitle(titleDraft.trim())
    }
    setIsEditingTitle(false)
  }

  const handleSaveTrip = () => {
    saveTrip()
    setSavedNote('Trip itinerary saved to your browser.')
    setTimeout(() => setSavedNote(''), 3500)
  }

  const totalStops = currentItinerary.days.reduce(
    (acc, d) => acc + d.activities.length,
    0,
  )

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      {/* Editorial Header / Printable Header */}
      <header className="print-header flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.24em] text-moss">
              Itinerary Dispatch · {currentItinerary.destination}
            </span>
            <span className="text-xs text-stone-muted">·</span>
            <span className="text-xs text-stone">
              {currentItinerary.preferences.durationDays}{' '}
              {currentItinerary.preferences.durationDays === 1 ? 'Day' : 'Days'} ({totalStops} stops)
            </span>
          </div>

          {/* Editable Title */}
          <div className="mt-2 flex items-center gap-3">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle()
                    if (e.key === 'Escape') setIsEditingTitle(false)
                  }}
                  autoFocus
                  className="rounded border border-moss bg-panel px-3 py-1 font-display text-3xl text-ivory outline-none md:text-5xl"
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="rounded bg-moss px-3 py-2 text-xs font-semibold text-ink"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="group flex items-center gap-3">
                <h1 className="print-title font-display text-4xl text-ivory md:text-5xl">
                  {currentItinerary.title}
                </h1>
                <button
                  type="button"
                  onClick={handleStartEditTitle}
                  className="no-print opacity-0 transition group-hover:opacity-100 rounded p-1 text-stone hover:text-ivory"
                  title="Rename itinerary"
                >
                  <Pencil size={18} />
                </button>
              </div>
            )}
          </div>

          <p className="mt-2 text-xs text-stone sm:text-sm">
            {currentItinerary.preferences.interests.map((i) => INTEREST_LABELS[i]).join(' · ')} ·{' '}
            <span className="capitalize">{currentItinerary.preferences.pace}</span> rhythm ·{' '}
            {currentItinerary.preferences.travelers}{' '}
            {currentItinerary.preferences.travelers === 1 ? 'traveler' : 'travelers'}
            {currentItinerary.preferences.preferQuiet ? ' · quieter preference' : ''}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="no-print flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSaveTrip}
            className="inline-flex items-center gap-2 rounded bg-moss px-4 py-2.5 text-xs font-semibold text-ink shadow transition hover:bg-olive"
          >
            <Save size={14} /> Save Trip
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded border border-line bg-panel px-4 py-2.5 text-xs font-medium text-ivory transition hover:border-moss"
          >
            <Printer size={14} /> Print / PDF
          </button>
          <Link
            to={`/plan?destination=${currentItinerary.destination}`}
            className="inline-flex items-center gap-2 rounded border border-line px-3.5 py-2.5 text-xs text-stone transition hover:text-ivory"
          >
            <RotateCcw size={13} /> Re-plan
          </Link>
        </div>
      </header>

      {/* Save Notification Note */}
      {savedNote && (
        <div className="no-print mt-3 rounded border border-moss/30 bg-moss/10 px-4 py-2 text-xs font-medium text-moss">
          {savedNote}
        </div>
      )}

      {/* Day Selector Tabs (interactive filtering for Map and Timeline) */}
      <div className="no-print mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-2 text-xs uppercase tracking-wider text-stone-muted">Filter View:</span>
          <button
            type="button"
            onClick={() => setActiveDayTab(null)}
            className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${
              activeDayTab === null
                ? 'bg-moss text-ink shadow'
                : 'border border-line bg-panel text-stone hover:text-ivory'
            }`}
          >
            All Days ({currentItinerary.days.length})
          </button>
          {currentItinerary.days.map((day) => (
            <button
              key={day.day}
              type="button"
              onClick={() => setActiveDayTab(day.day)}
              className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${
                activeDayTab === day.day
                  ? 'bg-moss text-ink shadow'
                  : 'border border-line bg-panel text-stone hover:text-ivory'
              }`}
            >
              Day {day.day} ({day.activities.length} stops)
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setAddingDay(activeDayTab ?? 1)}
          className="inline-flex items-center gap-1.5 rounded border border-line bg-panel px-3 py-1.5 text-xs text-stone transition hover:border-moss hover:text-ivory"
        >
          <Plus size={13} className="text-moss" />
          <span>Add Stop to {activeDayTab ? `Day ${activeDayTab}` : 'Itinerary'}</span>
        </button>
      </div>

      {/* Main Content Layout: Timeline + Map on left, Budget on right */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-10">
          {/* Geocoded Interactive Map / Route fallback */}
          <div className="no-print">
            <div className="mb-2 flex items-center justify-between text-xs text-stone">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-moss" />
                <span>
                  {activeDayTab ? `Day ${activeDayTab} Route` : 'Full Trip Map'} (
                  {mappedPlaces.length} mapped {mappedPlaces.length === 1 ? 'stop' : 'stops'})
                </span>
              </span>
              <span className="text-[11px] text-stone-muted">Pins follow chronological order</span>
            </div>
            <MapBoundary>
              <MapView
                places={mappedPlaces}
                onSelect={setSelected}
                className="h-[420px]"
                showSequence={true}
              />
            </MapBoundary>
          </div>

          {/* Chronological Timeline */}
          <ItineraryTimeline
            days={currentItinerary.days}
            travelers={currentItinerary.preferences.travelers}
            editable
            activeDayFilter={activeDayTab}
            onOpenPlace={(id) => {
              const place = getPlaceById(id)
              if (place) setSelected(place)
            }}
            onAddActivity={(dayNum) => setAddingDay(dayNum)}
          />
        </div>

        {/* Budget Sidebar */}
        <div>
          <div className="sticky top-24">
            <BudgetSummary itinerary={currentItinerary} />
          </div>
        </div>
      </div>

      {/* Place Details Inspection Modal */}
      {selected && (
        <PlaceDetails
          place={selected}
          onClose={() => setSelected(null)}
          onAddToTrip={() => {
            setAddingDay(activeDayTab ?? 1)
            setSelected(null)
          }}
        />
      )}

      {/* Add Activity Modal */}
      {addingDay !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-sm border border-line-strong bg-charcoal p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-moss">
                  Add Activity · Day {addingDay}
                </p>
                <h3 className="mt-1 font-display text-3xl text-ivory">Places still off the list</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAddingDay(null)
                  setSearchSuggestion('')
                }}
                className="rounded p-1 text-stone hover:text-ivory"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick search inside suggestions */}
            <div className="mt-4 flex items-center gap-2 rounded border border-line bg-panel px-3 py-2 text-xs">
              <Search size={14} className="text-stone" />
              <input
                type="text"
                value={searchSuggestion}
                onChange={(e) => setSearchSuggestion(e.target.value)}
                placeholder="Search available gems in this city..."
                className="w-full bg-transparent text-ivory outline-none placeholder:text-stone-muted"
              />
            </div>

            {/* List of remaining gems */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1">
              {suggestions.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone">
                  {searchSuggestion
                    ? 'No remaining places match that search.'
                    : 'Every curated gem in this city is already on your itinerary!'}
                </div>
              ) : (
                suggestions.map((place) => (
                  <div
                    key={place.id}
                    className="flex items-center justify-between gap-3 rounded border border-line bg-panel p-3 transition hover:border-moss/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-charcoal">
                        <img
                          src={place.imageUrl}
                          alt={place.imageAlt}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-display text-xl text-ivory">{place.name}</h4>
                        <p className="text-xs text-stone">
                          {place.neighborhood} · {CATEGORY_LABELS[place.category]} ·{' '}
                          {place.estimatedCost === 0 ? 'Free' : formatUsd(place.estimatedCost)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addActivityToDay(addingDay, {
                          id: crypto.randomUUID(),
                          placeId: place.id,
                          startTime: '16:00',
                          durationMinutes: place.durationMinutes,
                        })
                        setAddingDay(null)
                        setSearchSuggestion('')
                      }}
                      className="inline-flex items-center gap-1 rounded bg-moss px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-olive"
                    >
                      <Plus size={13} /> Add
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 border-t border-line pt-3 text-right">
              <button
                type="button"
                onClick={() => {
                  setAddingDay(null)
                  setSearchSuggestion('')
                }}
                className="rounded border border-line px-4 py-1.5 text-xs text-stone hover:text-ivory"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

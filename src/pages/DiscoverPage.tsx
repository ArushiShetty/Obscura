import {
  LayoutGrid,
  Map as MapIcon,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapBoundary } from '../components/MapBoundary'
import { MapView } from '../components/MapView'
import { PlaceCard } from '../components/PlaceCard'
import { PlaceDetails } from '../components/PlaceDetails'
import { useApp } from '../context/AppContext'
import { places } from '../data/places'
import { formatUsd } from '../lib/budgetCalculator'
import type { BudgetLevel, Destination, Interest, Place, PlaceCategory } from '../types'
import {
  BUDGET_LABELS,
  BUDGET_LEVELS,
  CATEGORIES,
  CATEGORY_LABELS,
  DESTINATIONS,
  INTEREST_LABELS,
  INTERESTS,
} from '../types'

type SortOption = 'recommended' | 'quietness' | 'cost-asc' | 'duration-asc'

function inBudget(cost: number, budget: BudgetLevel | 'all') {
  if (budget === 'all') return true
  if (budget === 'budget-friendly') return cost <= 15
  if (budget === 'moderate') return cost <= 35
  return true
}

export function DiscoverPage() {
  const [params, setParams] = useSearchParams()
  const { currentItinerary, addActivityToDay } = useApp()

  const [query, setQuery] = useState('')
  const [destination, setDestination] = useState<Destination | 'all'>(
    (params.get('destination') as Destination) || 'all',
  )
  const [category, setCategory] = useState<PlaceCategory | 'all'>(
    (params.get('category') as PlaceCategory) || 'all',
  )
  const [budget, setBudget] = useState<BudgetLevel | 'all'>('all')
  const [interest, setInterest] = useState<Interest | 'all'>(
    (params.get('interest') as Interest) || 'all',
  )
  const [sort, setSort] = useState<SortOption>('recommended')
  const [view, setView] = useState<'grid' | 'map'>('grid')
  const [selected, setSelected] = useState<Place | null>(null)
  const [addPlace, setAddPlace] = useState<Place | null>(null)
  const [toastMessage, setToastMessage] = useState('')

  const hasActiveFilters =
    destination !== 'all' ||
    category !== 'all' ||
    budget !== 'all' ||
    interest !== 'all' ||
    query.trim() !== ''

  const handleResetFilters = () => {
    setQuery('')
    setDestination('all')
    setCategory('all')
    setBudget('all')
    setInterest('all')
    setSort('recommended')
    setParams({})
  }

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = places.filter((place) => {
      if (destination !== 'all' && place.destination !== destination) return false
      if (category !== 'all' && place.category !== category) return false
      if (interest !== 'all' && !place.interests.includes(interest)) return false
      if (!inBudget(place.estimatedCost, budget)) return false
      if (!needle) return true
      return (
        place.name.toLowerCase().includes(needle) ||
        place.neighborhood.toLowerCase().includes(needle) ||
        place.destination.toLowerCase().includes(needle) ||
        place.description.toLowerCase().includes(needle)
      )
    })

    return filtered.sort((a, b) => {
      if (sort === 'quietness') return b.quietness - a.quietness
      if (sort === 'cost-asc') return a.estimatedCost - b.estimatedCost
      if (sort === 'duration-asc') return a.durationMinutes - b.durationMinutes
      return 0 // default dataset ordering
    })
  }, [budget, category, destination, interest, query, sort])

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-moss">The Collection</p>
          <h1 className="mt-2 font-display text-5xl text-ivory">Hidden gems, curated.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone">
            Explore 60 vetted independent spaces in Bengaluru, Kyoto, and Lisbon.
            Every place is scored for quietness and atmospheric depth.
          </p>
        </div>

        {/* Destination Quick-Tabs */}
        <div className="flex flex-wrap rounded border border-line bg-panel p-1">
          <button
            type="button"
            onClick={() => setDestination('all')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition ${
              destination === 'all'
                ? 'bg-moss text-ink shadow'
                : 'text-stone hover:text-ivory'
            }`}
          >
            All Cities ({places.length})
          </button>
          {DESTINATIONS.map((city) => {
            const count = places.filter((p) => p.destination === city).length
            return (
              <button
                key={city}
                type="button"
                onClick={() => setDestination(city)}
                className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                  destination === city
                    ? 'bg-moss text-ink shadow'
                    : 'text-stone hover:text-ivory'
                }`}
              >
                {city} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 rounded-sm border border-line bg-panel p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {/* Search Input with Clear Button */}
          <div className="relative lg:col-span-2">
            <div className="flex items-center gap-2 rounded border border-line bg-charcoal px-3 py-2 focus-within:border-moss/60">
              <Search size={15} className="text-stone shrink-0" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, neighborhood, or theme..."
                className="w-full bg-transparent text-xs text-ivory outline-none placeholder:text-stone-muted"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-stone hover:text-ivory"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as PlaceCategory | 'all')}
            className="rounded border border-line bg-charcoal px-3 py-2 text-xs text-ivory outline-none focus:border-moss/60"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {CATEGORY_LABELS[item]}
              </option>
            ))}
          </select>

          {/* Budget Filter */}
          <select
            value={budget}
            onChange={(event) => setBudget(event.target.value as BudgetLevel | 'all')}
            className="rounded border border-line bg-charcoal px-3 py-2 text-xs text-ivory outline-none focus:border-moss/60"
          >
            <option value="all">Any spend tier</option>
            {BUDGET_LEVELS.map((item) => (
              <option key={item} value={item}>
                {BUDGET_LABELS[item]}
              </option>
            ))}
          </select>

          {/* Interest Filter */}
          <select
            value={interest}
            onChange={(event) => setInterest(event.target.value as Interest | 'all')}
            className="rounded border border-line bg-charcoal px-3 py-2 text-xs text-ivory outline-none focus:border-moss/60"
          >
            <option value="all">Any theme / interest</option>
            {INTERESTS.map((item) => (
              <option key={item} value={item}>
                {INTEREST_LABELS[item]}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="rounded border border-line bg-charcoal px-3 py-2 text-xs text-ivory outline-none focus:border-moss/60"
          >
            <option value="recommended">Sort: Curated order</option>
            <option value="quietness">Sort: Quietest first</option>
            <option value="cost-asc">Sort: Lowest cost first</option>
            <option value="duration-asc">Sort: Shortest visit</option>
          </select>
        </div>

        {/* Active Filters Summary & Reset */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-stone-muted">Active:</span>
              {destination !== 'all' && (
                <span className="rounded bg-moss/10 px-2 py-0.5 text-moss">
                  City: {destination}
                </span>
              )}
              {category !== 'all' && (
                <span className="rounded bg-moss/10 px-2 py-0.5 text-moss">
                  Category: {CATEGORY_LABELS[category]}
                </span>
              )}
              {budget !== 'all' && (
                <span className="rounded bg-moss/10 px-2 py-0.5 text-moss">
                  Budget: {BUDGET_LABELS[budget]}
                </span>
              )}
              {interest !== 'all' && (
                <span className="rounded bg-moss/10 px-2 py-0.5 text-moss">
                  Interest: {INTEREST_LABELS[interest]}
                </span>
              )}
              {query && (
                <span className="rounded bg-moss/10 px-2 py-0.5 text-moss">
                  “{query}”
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-stone hover:text-ivory"
            >
              <RotateCcw size={12} /> Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Subheader: Results count & Grid/Map View Switcher */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-xs tracking-wider text-stone uppercase">
          Showing <span className="font-semibold text-ivory">{results.length}</span>{' '}
          {results.length === 1 ? 'gem' : 'curated gems'}
        </p>

        <div className="flex rounded border border-line bg-charcoal p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={`inline-flex items-center gap-1.5 rounded px-3 py-1 font-medium transition ${
              view === 'grid' ? 'bg-panel text-ivory shadow' : 'text-stone hover:text-ivory'
            }`}
          >
            <LayoutGrid size={14} /> Grid
          </button>
          <button
            type="button"
            onClick={() => setView('map')}
            className={`inline-flex items-center gap-1.5 rounded px-3 py-1 font-medium transition ${
              view === 'map' ? 'bg-panel text-ivory shadow' : 'text-stone hover:text-ivory'
            }`}
          >
            <MapIcon size={14} /> Map View
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded bg-moss px-4 py-2.5 text-xs font-semibold text-ink shadow-2xl transition">
          {toastMessage}
        </div>
      )}

      {/* Results Content */}
      {results.length === 0 ? (
        <div className="mt-12 rounded border border-line bg-panel p-16 text-center">
          <p className="font-display text-3xl text-ivory">No places match this combination.</p>
          <p className="mt-2 text-sm text-stone">
            Try relaxing the budget or category filters to discover more hidden corners.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-6 rounded bg-moss px-5 py-2.5 text-xs font-medium text-ink transition hover:bg-olive"
          >
            Reset All Filters
          </button>
        </div>
      ) : view === 'map' ? (
        <div className="mt-6">
          <MapBoundary>
            <MapView places={results} onSelect={setSelected} className="h-[540px]" showSequence={false} />
          </MapBoundary>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((place, idx) => (
            <PlaceCard
              key={place.id}
              place={place}
              onOpen={setSelected}
              aspectRatio={idx % 3 === 0 ? 'tall' : idx % 3 === 1 ? 'standard' : 'cinematic'}
            />
          ))}
        </div>
      )}

      {/* Place Details Modal */}
      {selected && (
        <PlaceDetails
          place={selected}
          onClose={() => setSelected(null)}
          onAddToTrip={(place) => {
            setSelected(null)
            setAddPlace(place)
          }}
        />
      )}

      {/* Add to Itinerary Modal */}
      {addPlace && currentItinerary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-sm border border-line bg-charcoal p-6 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-moss">Add to Itinerary</p>
            <h2 className="mt-1 font-display text-3xl text-ivory">{addPlace.name}</h2>
            <p className="mt-2 text-xs text-stone">
              Choose which day in your {currentItinerary.destination} plan to insert this activity.
            </p>

            <div className="mt-5 space-y-2">
              {currentItinerary.days.map((day) => (
                <button
                  key={day.day}
                  type="button"
                  onClick={() => {
                    addActivityToDay(day.day, {
                      id: crypto.randomUUID(),
                      placeId: addPlace.id,
                      startTime: '15:30',
                      durationMinutes: addPlace.durationMinutes,
                    })
                    setAddPlace(null)
                    setToastMessage(`Added "${addPlace.name}" to Day ${day.day}`)
                    setTimeout(() => setToastMessage(''), 3000)
                  }}
                  className="flex w-full items-center justify-between rounded border border-line bg-panel p-3 text-left transition hover:border-moss hover:bg-panel-card"
                >
                  <div>
                    <span className="font-semibold text-ivory">Day {day.day}</span>
                    <span className="text-xs text-stone-muted ml-2">({day.activities.length} stops)</span>
                    <p className="text-xs text-stone">{day.theme}</p>
                  </div>
                  <span className="text-xs text-moss">Add +</span>
                </button>
              ))}
            </div>

            <p className="mt-4 text-[11px] text-stone-muted">
              Estimated extra: {addPlace.estimatedCost === 0 ? 'Free' : formatUsd(addPlace.estimatedCost * currentItinerary.preferences.travelers)} for party.
            </p>

            <button
              type="button"
              className="mt-4 w-full rounded border border-line py-2 text-xs text-stone transition hover:text-ivory"
              onClick={() => setAddPlace(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

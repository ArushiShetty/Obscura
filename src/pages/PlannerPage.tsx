import {
  Calendar,
  Camera,
  Check,
  Coffee,
  Compass,
  Footprints,
  Landmark,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trees,
  Utensils,
  Zap,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { destinationCopy, getPlaceById } from '../data/places'
import { generateItinerary } from '../lib/recommendationEngine'
import { formatUsd } from '../lib/budgetCalculator'
import type { BudgetLevel, Destination, Interest, Pace, TripPreferences } from '../types'
import {
  BUDGET_LEVELS,
  DESTINATIONS,
  INTEREST_LABELS,
  INTERESTS,
  PACES,
} from '../types'

const today = new Date().toISOString().slice(0, 10)

const interestIcons: Record<Interest, typeof Coffee> = {
  food: Utensils,
  nature: Trees,
  art: Sparkles,
  culture: Landmark,
  architecture: Compass,
  history: Landmark,
  photography: Camera,
  shopping: ShoppingBag,
  offbeat: Footprints,
}

const paceDetails: Record<Pace, { label: string; stops: string; start: string; description: string }> = {
  relaxed: {
    label: 'Relaxed',
    stops: '2–3 stops / day',
    start: '09:30 AM start',
    description: 'Long mornings, generous 70-min breaks between stops, leisurely cafés.',
  },
  balanced: {
    label: 'Balanced',
    stops: '3–4 stops / day',
    start: '09:00 AM start',
    description: 'Harmonious rhythm. Mix of cultural highlights, parks, and dining.',
  },
  packed: {
    label: 'Packed',
    stops: '4–5 stops / day',
    start: '08:30 AM start',
    description: 'Early starts, full exploration from sunrise to blue hour lantern lanes.',
  },
}

const budgetDetails: Record<BudgetLevel, { title: string; costPerStop: string; hint: string }> = {
  'budget-friendly': {
    title: 'Budget-Friendly',
    costPerStop: '$0 – $15 / stop',
    hint: 'Prioritizes free parks, scenic viewpoints, neighborhood walks, and street stalls.',
  },
  moderate: {
    title: 'Moderate',
    costPerStop: '$8 – $35 / stop',
    hint: 'Balanced mix of boutique coffee roasteries, museum admissions, and local bistros.',
  },
  premium: {
    title: 'Premium',
    costPerStop: '$18 – $80 / stop',
    hint: 'Allows artisan craft studios, sit-down dinners, special exhibitions, and historic teahouses.',
  },
}

export function PlannerPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setCurrentItinerary } = useApp()

  const initialDestination = (params.get('destination') as Destination) || 'Kyoto'
  const pinnedPlaceId = params.get('place') || undefined
  const pinnedPlace = pinnedPlaceId ? getPlaceById(pinnedPlaceId) : undefined

  const [destination, setDestination] = useState<Destination>(
    DESTINATIONS.includes(initialDestination) ? initialDestination : 'Kyoto',
  )
  const [durationDays, setDurationDays] = useState(3)
  const [startDate, setStartDate] = useState(today)
  const [travelers, setTravelers] = useState(2)
  const [budget, setBudget] = useState<BudgetLevel>('moderate')
  const [interests, setInterests] = useState<Interest[]>([
    'food',
    'culture',
    'photography',
    'offbeat',
  ])
  const [pace, setPace] = useState<Pace>('balanced')
  const [preferQuiet, setPreferQuiet] = useState(true)
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const toggleInterest = (interest: Interest) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    )
  }

  // Quick preset: Next Weekend
  const setNextWeekend = () => {
    const d = new Date()
    const daysUntilSat = (6 - d.getDay() + 7) % 7 || 7
    d.setDate(d.getDate() + daysUntilSat)
    setStartDate(d.toISOString().slice(0, 10))
    setDurationDays(2)
  }

  // Estimated stats projection
  const estimatedStopsTotal = useMemo(() => {
    const perDay = pace === 'relaxed' ? 3 : pace === 'balanced' ? 4 : 5
    return durationDays * perDay
  }, [durationDays, pace])

  const estimatedSpendRange = useMemo(() => {
    const avgPerStop = budget === 'budget-friendly' ? 7 : budget === 'moderate' ? 20 : 45
    const totalSingle = estimatedStopsTotal * avgPerStop
    return formatUsd(totalSingle * travelers)
  }, [budget, estimatedStopsTotal, travelers])

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!interests.length) {
      setError('Please select at least one interest to help our recommendation engine match gems.')
      return
    }
    if (durationDays < 1 || durationDays > 7) {
      setError('Trip duration must be between 1 and 7 days.')
      return
    }
    if (travelers < 1 || travelers > 8) {
      setError('Party size should be between 1 and 8 travelers.')
      return
    }

    setError('')
    setIsGenerating(true)

    // Smooth deterministic generation with realistic micro-transition
    setTimeout(() => {
      const preferences: TripPreferences = {
        destination,
        durationDays,
        startDate,
        travelers,
        budget,
        interests,
        pace,
        preferQuiet,
        pinnedPlaceId: pinnedPlace?.destination === destination ? pinnedPlaceId : undefined,
      }
      const itinerary = generateItinerary(preferences)
      setCurrentItinerary(itinerary)
      navigate('/itinerary')
    }, 450)
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      {/* Header */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-moss">The Itinerary Desk</p>
        <h1 className="mt-2 font-display text-5xl text-ivory md:text-6xl">
          Tell us how you wander.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-stone">
          Obscura ranks curated places against your travel pace and interests,
          arranging them in logical chronological sequence with realistic transition buffers.
        </p>
      </div>

      {/* Pinned place alert if applicable */}
      {pinnedPlace && pinnedPlace.destination === destination && (
        <div className="mt-6 flex items-center justify-between rounded-sm border border-moss/40 bg-moss/10 p-4 text-xs text-moss">
          <div className="flex items-center gap-2">
            <Sparkles size={16} />
            <span>
              <strong>Pinned highlight:</strong> Including{' '}
              <span className="font-semibold text-ivory">{pinnedPlace.name}</span> in Day 1 of
              your itinerary.
            </span>
          </div>
          <span className="rounded bg-moss/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-moss">
            Priority Stop
          </span>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-10 space-y-10">
        {/* Step 1: Destination Selection with Visual Cards */}
        <section className="rounded-sm border border-line bg-panel p-6">
          <label className="block text-xs uppercase tracking-[0.18em] text-moss">
            01 / Choose Your Destination
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {DESTINATIONS.map((city) => {
              const copy = destinationCopy[city]
              const isSelected = destination === city

              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setDestination(city)}
                  className={`group relative overflow-hidden rounded-sm border text-left transition-all ${
                    isSelected
                      ? 'border-moss ring-2 ring-moss/30 shadow-lg'
                      : 'border-line hover:border-line-strong'
                  }`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-charcoal">
                    <img
                      src={copy.imageUrl}
                      alt={city}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-black/30" />
                    {isSelected && (
                      <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-moss text-ink">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                    <span className="absolute bottom-2 left-3 font-display text-2xl text-ivory">
                      {city}
                    </span>
                  </div>
                  <div className="bg-charcoal p-3">
                    <span className="text-[11px] uppercase tracking-wider text-stone-muted">
                      {copy.country}
                    </span>
                    <p className="mt-1 line-clamp-1 text-xs text-stone">{copy.blurb}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Step 2: Duration, Dates & Party Size */}
        <section className="rounded-sm border border-line bg-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-moss">
              02 / Trip Length & Party Size
            </span>
            <button
              type="button"
              onClick={setNextWeekend}
              className="text-xs text-stone hover:text-moss hover:underline"
            >
              Preset: Upcoming Weekend
            </button>
          </div>

          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            {/* Duration Stepper */}
            <div className="rounded border border-line bg-charcoal p-4">
              <label className="text-xs text-stone uppercase tracking-wider">
                Duration (Days)
              </label>
              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setDurationDays(Math.max(1, durationDays - 1))}
                  disabled={durationDays <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded border border-line text-stone transition hover:border-moss hover:text-ivory disabled:opacity-20"
                >
                  <Minus size={14} />
                </button>
                <span className="font-display text-3xl text-ivory">
                  {durationDays} {durationDays === 1 ? 'day' : 'days'}
                </span>
                <button
                  type="button"
                  onClick={() => setDurationDays(Math.min(7, durationDays + 1))}
                  disabled={durationDays >= 7}
                  className="flex h-8 w-8 items-center justify-center rounded border border-line text-stone transition hover:border-moss hover:text-ivory disabled:opacity-20"
                >
                  <Plus size={14} />
                </button>
              </div>
              <p className="mt-2 text-[11px] text-stone-muted text-center">Curated 1–7 day collection</p>
            </div>

            {/* Start Date */}
            <div className="rounded border border-line bg-charcoal p-4">
              <label className="text-xs text-stone uppercase tracking-wider">
                Start Date
              </label>
              <div className="mt-3">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded border border-line bg-panel px-3 py-2 text-xs text-ivory outline-none focus:border-moss"
                />
              </div>
              <p className="mt-2 text-[11px] text-stone-muted">Used for day calendar headers</p>
            </div>

            {/* Travelers Stepper */}
            <div className="rounded border border-line bg-charcoal p-4">
              <label className="text-xs text-stone uppercase tracking-wider">
                Travelers (Party)
              </label>
              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setTravelers(Math.max(1, travelers - 1))}
                  disabled={travelers <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded border border-line text-stone transition hover:border-moss hover:text-ivory disabled:opacity-20"
                >
                  <Minus size={14} />
                </button>
                <span className="font-display text-3xl text-ivory">
                  {travelers} {travelers === 1 ? 'person' : 'people'}
                </span>
                <button
                  type="button"
                  onClick={() => setTravelers(Math.min(8, travelers + 1))}
                  disabled={travelers >= 8}
                  className="flex h-8 w-8 items-center justify-center rounded border border-line text-stone transition hover:border-moss hover:text-ivory disabled:opacity-20"
                >
                  <Plus size={14} />
                </button>
              </div>
              <p className="mt-2 text-[11px] text-stone-muted text-center">Multiplies per-stop spend</p>
            </div>
          </div>
        </section>

        {/* Step 3: Travel Rhythm / Pace */}
        <section className="rounded-sm border border-line bg-panel p-6">
          <span className="text-xs uppercase tracking-[0.18em] text-moss">
            03 / Travel Rhythm & Pace
          </span>
          <p className="mt-1 text-xs text-stone">
            Controls how many stops are scheduled each day and how much breathing room is factored in.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {PACES.map((p) => {
              const detail = paceDetails[p]
              const isSelected = pace === p

              return (
                <label
                  key={p}
                  className={`flex cursor-pointer flex-col justify-between rounded border p-4 transition-all ${
                    isSelected
                      ? 'border-moss bg-charcoal ring-1 ring-moss/30 shadow'
                      : 'border-line bg-charcoal/50 hover:border-moss/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="pace"
                    className="sr-only"
                    checked={isSelected}
                    onChange={() => setPace(p)}
                  />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xl text-ivory">{detail.label}</span>
                      {isSelected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-moss text-ink">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <span className="mt-1 inline-block rounded bg-panel px-2 py-0.5 text-[11px] font-medium text-moss">
                      {detail.stops}
                    </span>
                    <p className="mt-2 text-xs leading-relaxed text-stone">{detail.description}</p>
                  </div>
                  <span className="mt-3 block border-t border-line/60 pt-2 text-[11px] text-stone-muted">
                    {detail.start}
                  </span>
                </label>
              )
            })}
          </div>
        </section>

        {/* Step 4: Budget Tier */}
        <section className="rounded-sm border border-line bg-panel p-6">
          <span className="text-xs uppercase tracking-[0.18em] text-moss">
            04 / Spend Tier & Budget Band
          </span>
          <p className="mt-1 text-xs text-stone">
            Scores places so that estimated costs align with what you expect to spend on tickets and dining.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {BUDGET_LEVELS.map((level) => {
              const detail = budgetDetails[level]
              const isSelected = budget === level

              return (
                <label
                  key={level}
                  className={`flex cursor-pointer flex-col justify-between rounded border p-4 transition-all ${
                    isSelected
                      ? 'border-moss bg-charcoal ring-1 ring-moss/30 shadow'
                      : 'border-line bg-charcoal/50 hover:border-moss/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="budget"
                    className="sr-only"
                    checked={isSelected}
                    onChange={() => setBudget(level)}
                  />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xl text-ivory">{detail.title}</span>
                      {isSelected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-moss text-ink">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <span className="mt-1 inline-block text-xs font-semibold text-moss">
                      {detail.costPerStop}
                    </span>
                    <p className="mt-2 text-xs leading-relaxed text-stone">{detail.hint}</p>
                  </div>
                </label>
              )
            })}
          </div>
        </section>

        {/* Step 5: Interests & Atmosphere */}
        <section className="rounded-sm border border-line bg-panel p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.18em] text-moss">
              05 / Themes & Atmosphere
            </span>
            <span className="text-xs text-stone-muted">Select all that inspire you</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {INTERESTS.map((item) => {
              const isSelected = interests.includes(item)
              const Icon = interestIcons[item]

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInterest(item)}
                  className={`inline-flex items-center gap-2 rounded border px-3.5 py-2 text-xs font-medium transition ${
                    isSelected
                      ? 'border-moss bg-moss/15 text-ivory ring-1 ring-moss/30'
                      : 'border-line bg-charcoal text-stone hover:border-moss/40 hover:text-ivory'
                  }`}
                >
                  <Icon size={14} className={isSelected ? 'text-moss' : 'text-stone-muted'} />
                  <span>{INTEREST_LABELS[item]}</span>
                  {isSelected && <Check size={12} className="text-moss" />}
                </button>
              )
            })}
          </div>

          {/* Quietness boost toggle */}
          <div className="mt-6 border-t border-line/60 pt-4">
            <label className="flex cursor-pointer items-start gap-3 rounded border border-line bg-charcoal/60 p-4 transition hover:border-moss/40">
              <input
                type="checkbox"
                checked={preferQuiet}
                onChange={(e) => setPreferQuiet(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-line bg-panel text-moss accent-moss focus:ring-0"
              />
              <div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-ivory">
                  <Sparkles size={13} className="text-moss" />
                  Prioritize Quieter Gems
                </span>
                <p className="mt-1 text-xs leading-relaxed text-stone">
                  Gives an extra weighting boost to serene temples, hidden bookshops, and quiet parks;
                  down-ranks crowded shopping corridors.
                </p>
              </div>
            </label>
          </div>
        </section>

        {/* Live Generation Projection Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-moss/30 bg-moss/5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-moss/20 text-moss">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-moss">Generated Projection</p>
              <p className="font-display text-xl text-ivory">
                {destination} · {durationDays} Days · {estimatedStopsTotal} Total Stops
              </p>
              <p className="text-xs text-stone">
                Estimated budget for {travelers} {travelers === 1 ? 'traveler' : 'travelers'}: ~{estimatedSpendRange}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded bg-moss px-7 py-3 text-sm font-semibold text-ink shadow-lg transition hover:bg-olive disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                <span>Crafting Itinerary...</span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span>Generate My Itinerary</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="rounded border border-rose-500/40 bg-rose-500/10 p-4 text-center text-xs text-rose-300">
            {error}
          </div>
        )}
      </form>
    </div>
  )
}

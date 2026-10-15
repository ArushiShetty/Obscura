import { getPlacesByDestination } from '../data/places'
import { budgetFitScore } from './budgetCalculator'
import type {
  Interest,
  Itinerary,
  ItineraryActivity,
  ItineraryDay,
  Pace,
  Place,
  TripPreferences,
} from '../types'

export interface ScoredPlace {
  place: Place
  score: number
  reasons: string[]
}

export const ACTIVITIES_PER_DAY: Record<TripPreferences['pace'], number> = {
  relaxed: 3,
  balanced: 4,
  packed: 5,
}

export const START_MINUTES: Record<TripPreferences['pace'], number> = {
  relaxed: 9 * 60 + 30, // 09:30 AM
  balanced: 9 * 60,      // 09:00 AM
  packed: 8 * 60 + 30,  // 08:30 AM
}

export const GAP_MINUTES: Record<TripPreferences['pace'], number> = {
  relaxed: 70,
  balanced: 50,
  packed: 35,
}

function addDays(isoDate: string, days: number): string {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function formatClock(totalMinutes: number): string {
  const normalized = totalMinutes % (24 * 60)
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/**
 * Dynamically recalculates sequential start times for an activity list on a given day.
 * Ensures times are always chronologically ascending after additions, deletions, or reorders.
 */
export function recalculateActivityTimes(
  activities: ItineraryActivity[],
  pace: Pace = 'balanced',
): ItineraryActivity[] {
  let clock = START_MINUTES[pace] ?? 9 * 60
  const gap = GAP_MINUTES[pace] ?? 50

  return activities.map((activity) => {
    const updated: ItineraryActivity = {
      ...activity,
      startTime: formatClock(clock),
    }
    clock += (activity.durationMinutes || 60) + gap
    return updated
  })
}

export function scorePlace(place: Place, preferences: TripPreferences): ScoredPlace {
  const reasons: string[] = []
  let score = 10

  // Pinned place gets top score
  if (preferences.pinnedPlaceId && preferences.pinnedPlaceId === place.id) {
    score += 500
    reasons.push('Selected priority highlight')
  }

  // Interest match
  const overlap = place.interests.filter((interest) =>
    preferences.interests.includes(interest),
  )
  const interestPoints = overlap.length * 20
  score += interestPoints
  if (overlap.length) {
    reasons.push(`Matches ${overlap.join(', ')}`)
  }

  // Category match
  if (preferences.interests.includes(place.category as Interest)) {
    score += 15
    reasons.push(`Primary category (${place.category}) matches your interests`)
  }

  // Budget fit
  const budgetPoints = budgetFitScore(place.estimatedCost, preferences.budget)
  score += budgetPoints
  if (budgetPoints >= 18) reasons.push('Well within chosen budget band')
  else if (budgetPoints < 0) reasons.push('Slightly above preferred spend')

  // Quietness preference
  if (preferences.preferQuiet) {
    score += place.quietness * 2.5
    if (place.quietness >= 7) reasons.push('Quiet & unhurried setting')
    else if (place.quietness <= 3) score -= 14
  } else {
    // Balanced quietness weight
    score += place.quietness * 0.5
  }

  // Offbeat boost
  if (preferences.interests.includes('offbeat') && place.interests.includes('offbeat')) {
    score += 10
    reasons.push('Hidden away from tourist routes')
  }

  if (!overlap.length && preferences.interests.length > 0) {
    score -= 12
  }

  return { place, score, reasons }
}

function pickVariedPlaces(ranked: ScoredPlace[], needed: number, pinnedId?: string): Place[] {
  const selected: Place[] = []
  const categoryCounts = new Map<string, number>()
  const neighborhoodCounts = new Map<string, number>()

  // Always include pinned place first if present
  if (pinnedId) {
    const pinned = ranked.find((item) => item.place.id === pinnedId)
    if (pinned) {
      selected.push(pinned.place)
      categoryCounts.set(pinned.place.category, 1)
      neighborhoodCounts.set(pinned.place.neighborhood, 1)
    }
  }

  const tryAdd = (candidate: Place, strict = true) => {
    if (selected.some((place) => place.id === candidate.id)) return false
    const categoryCount = categoryCounts.get(candidate.category) ?? 0
    const neighborhoodCount = neighborhoodCounts.get(candidate.neighborhood) ?? 0
    if (strict) {
      if (selected.length < needed - 1 && categoryCount >= 2) return false
      if (neighborhoodCount >= 3) return false
    }
    selected.push(candidate)
    categoryCounts.set(candidate.category, categoryCount + 1)
    neighborhoodCounts.set(candidate.neighborhood, neighborhoodCount + 1)
    return true
  }

  // First pass with variety constraints
  for (const item of ranked) {
    if (selected.length >= needed) break
    tryAdd(item.place, true)
  }

  // Second pass relaxing constraints if needed
  if (selected.length < needed) {
    for (const item of ranked) {
      if (selected.length >= needed) break
      tryAdd(item.place, false)
    }
  }

  return selected
}

export function dayTheme(dayPlaces: Place[]): string {
  const counts = new Map<Interest, number>()
  for (const place of dayPlaces) {
    for (const interest of place.interests) {
      counts.set(interest, (counts.get(interest) ?? 0) + 1)
    }
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  if (!top) return 'Open wandering'
  const labels: Record<Interest, string> = {
    food: 'Tastes of the neighborhood',
    nature: 'Green trails and quiet water',
    art: 'Independent studios & galleries',
    culture: 'Local rituals & living history',
    architecture: 'Form, streetscapes & facades',
    history: 'Historic layers & memory',
    photography: 'Vantages & golden hour light',
    shopping: 'Artisans & independent stalls',
    offbeat: 'Alleyways & hidden corners',
  }
  return labels[top[0]] ?? 'Neighborhood discovery'
}

function toActivities(dayPlaces: Place[], pace: TripPreferences['pace']): ItineraryActivity[] {
  const rawActivities: ItineraryActivity[] = dayPlaces.map((place) => ({
    id: crypto.randomUUID(),
    placeId: place.id,
    startTime: '09:00',
    durationMinutes: place.durationMinutes,
  }))
  return recalculateActivityTimes(rawActivities, pace)
}

function spreadAcrossDays(selected: Place[], dayCount: number): Place[][] {
  const buckets: Place[][] = Array.from({ length: dayCount }, () => [])
  selected.forEach((place, index) => {
    buckets[index % dayCount].push(place)
  })

  // Sort each day's places by latitude for spatial coherence
  buckets.forEach((day) => {
    day.sort((a, b) => a.coordinates.lat - b.coordinates.lat)
  })

  return buckets
}

export function generateItinerary(preferences: TripPreferences): Itinerary {
  const pool = getPlacesByDestination(preferences.destination)
  const ranked = pool
    .map((place) => scorePlace(place, preferences))
    .sort((a, b) => b.score - a.score)

  const perDay = ACTIVITIES_PER_DAY[preferences.pace]
  const needed = Math.min(perDay * preferences.durationDays, pool.length)
  const selected = pickVariedPlaces(ranked, needed, preferences.pinnedPlaceId)
  const grouped = spreadAcrossDays(selected, preferences.durationDays)

  const days: ItineraryDay[] = grouped.map((dayPlaces, index) => ({
    day: index + 1,
    date: addDays(preferences.startDate, index),
    theme: dayTheme(dayPlaces),
    activities: toActivities(dayPlaces, preferences.pace),
  }))

  const now = new Date().toISOString()
  const durationText =
    preferences.durationDays === 1
      ? '1 day'
      : `${preferences.durationDays} days`

  return {
    id: crypto.randomUUID(),
    title: `${preferences.destination} · ${durationText}`,
    destination: preferences.destination,
    preferences,
    days,
    createdAt: now,
    updatedAt: now,
  }
}

export function rankPlacesForPreferences(
  places: Place[],
  preferences: Pick<TripPreferences, 'interests' | 'budget' | 'preferQuiet'>,
): ScoredPlace[] {
  const full: TripPreferences = {
    destination: places[0]?.destination ?? 'Kyoto',
    durationDays: 3,
    startDate: '',
    travelers: 1,
    pace: 'balanced',
    ...preferences,
  }
  return places
    .map((place) => scorePlace(place, full))
    .sort((a, b) => b.score - a.score)
}

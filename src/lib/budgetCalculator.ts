import type { BudgetLevel, Itinerary, ItineraryDay, Place } from '../types'
import { getPlaceById } from '../data/places'

export const BUDGET_BANDS: Record<BudgetLevel, { min: number; max: number; hint: string }> = {
  'budget-friendly': {
    min: 0,
    max: 15,
    hint: 'Favors free walks, markets, and inexpensive cafés.',
  },
  moderate: {
    min: 8,
    max: 35,
    hint: 'Mix of paid museums, meals, and free neighborhoods.',
  },
  premium: {
    min: 18,
    max: 80,
    hint: 'Allows sit-down meals, tickets, and longer paid visits.',
  },
}

export function activityCost(place: Place, travelers: number): number {
  return place.estimatedCost * travelers
}

export function dayTotal(day: ItineraryDay, travelers: number): number {
  return day.activities.reduce((sum, activity) => {
    const place = getPlaceById(activity.placeId)
    if (!place) return sum
    return sum + activityCost(place, travelers)
  }, 0)
}

export function itineraryTotal(itinerary: Itinerary): number {
  return itinerary.days.reduce(
    (sum, day) => sum + dayTotal(day, itinerary.preferences.travelers),
    0,
  )
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function budgetFitScore(cost: number, budget: BudgetLevel): number {
  const band = BUDGET_BANDS[budget]
  if (cost >= band.min && cost <= band.max) return 25
  if (cost < band.min) return budget === 'premium' ? 8 : 18
  const overshoot = cost - band.max
  if (overshoot <= 10) return 10
  if (overshoot <= 25) return 0
  return -20
}

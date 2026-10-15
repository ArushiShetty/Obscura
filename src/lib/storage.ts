import type { Itinerary } from '../types'

const BOOKMARKS_KEY = 'obscura.bookmarks'
const TRIPS_KEY = 'obscura.trips'
const CURRENT_KEY = 'obscura.currentItinerary'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadBookmarks(): string[] {
  return readJson<string[]>(BOOKMARKS_KEY, [])
}

export function saveBookmarks(ids: string[]) {
  writeJson(BOOKMARKS_KEY, ids)
}

export function loadTrips(): Itinerary[] {
  return readJson<Itinerary[]>(TRIPS_KEY, [])
}

export function saveTrips(trips: Itinerary[]) {
  writeJson(TRIPS_KEY, trips)
}

export function loadCurrentItinerary(): Itinerary | null {
  return readJson<Itinerary | null>(CURRENT_KEY, null)
}

export function saveCurrentItinerary(itinerary: Itinerary | null) {
  if (!itinerary) {
    localStorage.removeItem(CURRENT_KEY)
    return
  }
  writeJson(CURRENT_KEY, itinerary)
}

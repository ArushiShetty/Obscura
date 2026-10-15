import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Itinerary, ItineraryActivity } from '../types'
import {
  loadBookmarks,
  loadCurrentItinerary,
  loadTrips,
  saveBookmarks,
  saveCurrentItinerary,
  saveTrips,
} from '../lib/storage'
import { recalculateActivityTimes } from '../lib/recommendationEngine'

interface AppContextValue {
  bookmarks: string[]
  trips: Itinerary[]
  currentItinerary: Itinerary | null
  isBookmarked: (placeId: string) => boolean
  toggleBookmark: (placeId: string) => void
  clearBookmarks: () => void
  setCurrentItinerary: (itinerary: Itinerary | null) => void
  saveTrip: (itinerary?: Itinerary) => void
  deleteTrip: (id: string) => void
  openTrip: (id: string) => Itinerary | null
  duplicateTrip: (id: string) => Itinerary | null
  updateTripTitle: (title: string) => void
  updateTravelers: (count: number) => void
  addActivityToDay: (dayNumber: number, activity: ItineraryActivity) => void
  removeActivity: (dayNumber: number, activityId: string) => void
  moveActivity: (dayNumber: number, activityId: string, direction: -1 | 1) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function stamp(itinerary: Itinerary): Itinerary {
  return { ...itinerary, updatedAt: new Date().toISOString() }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<string[]>(() => loadBookmarks())
  const [trips, setTrips] = useState<Itinerary[]>(() => loadTrips())
  const [currentItinerary, setCurrent] = useState<Itinerary | null>(() =>
    loadCurrentItinerary(),
  )

  const persistCurrent = useCallback((itinerary: Itinerary | null) => {
    setCurrent(itinerary)
    saveCurrentItinerary(itinerary)
  }, [])

  const isBookmarked = useCallback(
    (placeId: string) => bookmarks.includes(placeId),
    [bookmarks],
  )

  const toggleBookmark = useCallback((placeId: string) => {
    setBookmarks((current) => {
      const next = current.includes(placeId)
        ? current.filter((id) => id !== placeId)
        : [...current, placeId]
      saveBookmarks(next)
      return next
    })
  }, [])

  const clearBookmarks = useCallback(() => {
    setBookmarks([])
    saveBookmarks([])
  }, [])

  const saveTrip = useCallback(
    (itinerary?: Itinerary) => {
      const source = itinerary ?? currentItinerary
      if (!source) return
      const nextTrip = stamp(source)
      setTrips((current) => {
        const without = current.filter((trip) => trip.id !== nextTrip.id)
        const next = [nextTrip, ...without]
        saveTrips(next)
        return next
      })
      persistCurrent(nextTrip)
    },
    [currentItinerary, persistCurrent],
  )

  const deleteTrip = useCallback(
    (id: string) => {
      setTrips((current) => {
        const next = current.filter((trip) => trip.id !== id)
        saveTrips(next)
        return next
      })
      if (currentItinerary?.id === id) {
        persistCurrent(null)
      }
    },
    [currentItinerary?.id, persistCurrent],
  )

  const openTrip = useCallback(
    (id: string) => {
      const trip = trips.find((item) => item.id === id) ?? null
      if (trip) persistCurrent(trip)
      return trip
    },
    [persistCurrent, trips],
  )

  const duplicateTrip = useCallback(
    (id: string) => {
      const original = trips.find((item) => item.id === id)
      if (!original) return null
      const now = new Date().toISOString()
      const copy: Itinerary = {
        ...original,
        id: crypto.randomUUID(),
        title: `${original.title} (Copy)`,
        createdAt: now,
        updatedAt: now,
      }
      setTrips((current) => {
        const next = [copy, ...current]
        saveTrips(next)
        return next
      })
      return copy
    },
    [trips],
  )

  const updateDays = useCallback(
    (mutator: (itinerary: Itinerary) => Itinerary) => {
      setCurrent((current) => {
        if (!current) return current
        const next = stamp(mutator(current))
        saveCurrentItinerary(next)
        // Also update in trips if already saved
        setTrips((prevTrips) =>
          prevTrips.map((t) => (t.id === next.id ? next : t)),
        )
        return next
      })
    },
    [],
  )

  const updateTripTitle = useCallback(
    (title: string) => {
      if (!currentItinerary) return
      updateDays((itinerary) => ({
        ...itinerary,
        title: title.trim() || itinerary.title,
      }))
    },
    [currentItinerary, updateDays],
  )

  const updateTravelers = useCallback(
    (count: number) => {
      if (!currentItinerary || count < 1 || count > 12) return
      updateDays((itinerary) => ({
        ...itinerary,
        preferences: {
          ...itinerary.preferences,
          travelers: count,
        },
      }))
    },
    [currentItinerary, updateDays],
  )

  const addActivityToDay = useCallback(
    (dayNumber: number, activity: ItineraryActivity) => {
      updateDays((itinerary) => {
        const pace = itinerary.preferences.pace
        return {
          ...itinerary,
          days: itinerary.days.map((day) => {
            if (day.day !== dayNumber) return day
            const updatedRaw = [...day.activities, activity]
            return {
              ...day,
              activities: recalculateActivityTimes(updatedRaw, pace),
            }
          }),
        }
      })
    },
    [updateDays],
  )

  const removeActivity = useCallback(
    (dayNumber: number, activityId: string) => {
      updateDays((itinerary) => {
        const pace = itinerary.preferences.pace
        return {
          ...itinerary,
          days: itinerary.days.map((day) => {
            if (day.day !== dayNumber) return day
            const remaining = day.activities.filter((item) => item.id !== activityId)
            return {
              ...day,
              activities: recalculateActivityTimes(remaining, pace),
            }
          }),
        }
      })
    },
    [updateDays],
  )

  const moveActivity = useCallback(
    (dayNumber: number, activityId: string, direction: -1 | 1) => {
      updateDays((itinerary) => {
        const pace = itinerary.preferences.pace
        return {
          ...itinerary,
          days: itinerary.days.map((day) => {
            if (day.day !== dayNumber) return day
            const index = day.activities.findIndex((item) => item.id === activityId)
            const target = index + direction
            if (index < 0 || target < 0 || target >= day.activities.length) return day
            const nextActivities = [...day.activities]
            const [item] = nextActivities.splice(index, 1)
            nextActivities.splice(target, 0, item)
            return {
              ...day,
              activities: recalculateActivityTimes(nextActivities, pace),
            }
          }),
        }
      })
    },
    [updateDays],
  )

  const value = useMemo<AppContextValue>(
    () => ({
      bookmarks,
      trips,
      currentItinerary,
      isBookmarked,
      toggleBookmark,
      clearBookmarks,
      setCurrentItinerary: persistCurrent,
      saveTrip,
      deleteTrip,
      openTrip,
      duplicateTrip,
      updateTripTitle,
      updateTravelers,
      addActivityToDay,
      removeActivity,
      moveActivity,
    }),
    [
      addActivityToDay,
      bookmarks,
      clearBookmarks,
      currentItinerary,
      deleteTrip,
      duplicateTrip,
      isBookmarked,
      moveActivity,
      openTrip,
      persistCurrent,
      removeActivity,
      saveTrip,
      toggleBookmark,
      trips,
      updateTravelers,
      updateTripTitle,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}

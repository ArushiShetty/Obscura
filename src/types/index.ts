export const DESTINATIONS = ['Bengaluru', 'Kyoto', 'Lisbon'] as const
export type Destination = (typeof DESTINATIONS)[number]

export const INTERESTS = [
  'food',
  'nature',
  'art',
  'culture',
  'architecture',
  'history',
  'photography',
  'shopping',
  'offbeat',
] as const
export type Interest = (typeof INTERESTS)[number]

export const CATEGORIES = [
  'cafe',
  'bookstore',
  'viewpoint',
  'nature',
  'market',
  'culture',
  'street-art',
  'architecture',
  'photography',
  'food',
  'offbeat',
] as const
export type PlaceCategory = (typeof CATEGORIES)[number]

export const BUDGET_LEVELS = ['budget-friendly', 'moderate', 'premium'] as const
export type BudgetLevel = (typeof BUDGET_LEVELS)[number]

export const PACES = ['relaxed', 'balanced', 'packed'] as const
export type Pace = (typeof PACES)[number]

export interface Coordinates {
  lat: number
  lng: number
}

export interface Place {
  id: string
  name: string
  destination: Destination
  neighborhood: string
  description: string
  category: PlaceCategory
  interests: Interest[]
  estimatedCost: number
  durationMinutes: number
  quietness: number
  coordinates: Coordinates
  imageUrl: string
  imageAlt: string
}

export interface TripPreferences {
  destination: Destination
  durationDays: number
  startDate: string
  travelers: number
  budget: BudgetLevel
  interests: Interest[]
  pace: Pace
  preferQuiet: boolean
  pinnedPlaceId?: string
}

export interface ItineraryActivity {
  id: string
  placeId: string
  startTime: string
  durationMinutes: number
}

export interface ItineraryDay {
  day: number
  date: string
  theme: string
  activities: ItineraryActivity[]
}

export interface Itinerary {
  id: string
  title: string
  destination: Destination
  preferences: TripPreferences
  days: ItineraryDay[]
  createdAt: string
  updatedAt: string
}

export const INTEREST_LABELS: Record<Interest, string> = {
  food: 'Food',
  nature: 'Nature',
  art: 'Art',
  culture: 'Culture',
  architecture: 'Architecture',
  history: 'History',
  photography: 'Photography',
  shopping: 'Shopping',
  offbeat: 'Offbeat',
}

export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  cafe: 'Café',
  bookstore: 'Bookstore',
  viewpoint: 'Viewpoint',
  nature: 'Nature',
  market: 'Market',
  culture: 'Culture',
  'street-art': 'Street art',
  architecture: 'Architecture',
  photography: 'Photography',
  food: 'Food',
  offbeat: 'Offbeat',
}

export const BUDGET_LABELS: Record<BudgetLevel, string> = {
  'budget-friendly': 'Budget-friendly',
  moderate: 'Moderate',
  premium: 'Premium',
}

export const PACE_LABELS: Record<Pace, string> = {
  relaxed: 'Relaxed',
  balanced: 'Balanced',
  packed: 'Packed',
}

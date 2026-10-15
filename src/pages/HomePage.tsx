import {
  ArrowRight,
  Bookmark,
  Calendar,
  Compass,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { destinationCopy, places } from '../data/places'
import { PlaceDetails } from '../components/PlaceDetails'
import { CATEGORY_LABELS, DESTINATIONS, type Destination, type Place } from '../types'
import { useApp } from '../context/AppContext'

const sampleDays: Record<Destination, { title: string; subtitle: string; stops: Array<{ time: string; placeId: string; note: string }> }> = {
  Kyoto: {
    title: 'A Quieter Higashiyama & River Dawn',
    subtitle: 'Morning moss gates, historic brick aqueducts, and blue-hour alleys.',
    stops: [
      { time: '09:00', placeId: 'kyo-honen', note: 'Purify spirit at secluded thatched gate & emerald moss' },
      { time: '10:45', placeId: 'kyo-philosophers', note: 'Canal-side stone stroll under weeping willows' },
      { time: '13:00', placeId: 'kyo-nanzen', note: 'Meiji brick aqueduct archways nestled in temple forest' },
      { time: '15:30', placeId: 'kyo-inoda', note: 'Siphon-brewed kissaten coffee and retro lemon pie' },
      { time: '18:00', placeId: 'kyo-pontocho', note: 'Paper lantern glow along the narrow wooden river alley' },
    ],
  },
  Bengaluru: {
    title: 'Books, Shaded Rain Trees & Filter Coffee',
    subtitle: 'Church Street labyrinth, century-old gardens, and fragrant evening streets.',
    stops: [
      { time: '09:30', placeId: 'blr-brahmins', note: 'Steaming idli & frothy filter coffee by the curbside neem' },
      { time: '11:00', placeId: 'blr-blossom', note: 'Lose yourself in towering stacks of second-hand paperbacks' },
      { time: '13:15', placeId: 'blr-cubbon', note: 'Shaded bamboo trails and colonial red pavilions' },
      { time: '15:45', placeId: 'blr-ngma', note: 'Modern Indian art salon in a quiet heritage mansion' },
      { time: '18:30', placeId: 'blr-vvpuram', note: 'Hot crisp dosas and sweet seasonal jackfruit' },
    ],
  },
  Lisbon: {
    title: 'Miradouros, Tiled Stairways & River Light',
    subtitle: 'Hilltop vistas, vintage printing presses, and convent arches open to sky.',
    stops: [
      { time: '09:30', placeId: 'lis-fabrica-coffee', note: 'Single-origin espresso in a cobbled sunlit alleyway' },
      { time: '11:00', placeId: 'lis-senhora', note: 'Uncluttered horizon over terracotta roofs and the Tagus' },
      { time: '13:30', placeId: 'lis-ler', note: 'Browse tall wooden bookshelves under the vintage press' },
      { time: '15:45', placeId: 'lis-carmo', note: 'Gothic ruined nave open to the Atlantic blue sky' },
      { time: '18:00', placeId: 'lis-panoramico', note: '360° sunset panoramic view above Monsanto forest' },
    ],
  },
}

export function HomePage() {
  const navigate = useNavigate()
  const { isBookmarked, toggleBookmark } = useApp()
  const [activeCityTab, setActiveCityTab] = useState<Destination>('Kyoto')
  const [inspectedPlace, setInspectedPlace] = useState<Place | null>(null)

  // Featured curated gallery cards
  const curatedShowcase = [
    places.find((p) => p.id === 'kyo-honen')!,
    places.find((p) => p.id === 'blr-blossom')!,
    places.find((p) => p.id === 'lis-panoramico')!,
    places.find((p) => p.id === 'kyo-seiryu')!,
    places.find((p) => p.id === 'lis-azulejo')!,
    places.find((p) => p.id === 'blr-sankey')!,
  ].filter(Boolean)

  const samplePlan = sampleDays[activeCityTab]

  return (
    <div className="overflow-x-hidden">
      {/* 1. ASYMMETRIC EDITORIAL HERO */}
      <section className="relative border-b border-line bg-ink py-16 md:py-24">
        {/* Subtle background ambient glow */}
        <div className="pointer-events-none absolute left-1/4 top-10 h-96 w-96 rounded-full bg-moss/5 blur-[120px]" />
        <div className="pointer-events-none absolute right-10 top-1/2 h-80 w-80 rounded-full bg-olive/5 blur-[100px]" />

        <div className="mx-auto max-w-6xl px-5">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left Column: Narrative Copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-charcoal/80 px-3.5 py-1 text-[11px] uppercase tracking-[0.22em] text-moss">
                <Sparkles size={11} />
                <span>Issue IV · Curated Travel Archive</span>
              </div>

              <h1 className="mt-6 font-display text-5xl leading-[0.98] text-ivory sm:text-6xl lg:text-7xl">
                The world is <span className="italic font-normal text-moss">infinitely richer</span> than its landmarks.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-stone sm:text-lg">
                Obscura is a quiet travel discovery desk for independent bookstores,
                curated roasteries, moss temple paths, and rooftop lookouts.
                Choose your city and pace—our on-device engine crafts an unhurried,
                chronological itinerary with zero ads.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/plan"
                  className="inline-flex items-center gap-2 rounded bg-moss px-6 py-3.5 text-sm font-medium text-ink transition hover:bg-olive hover:shadow-lg"
                >
                  <Calendar size={16} /> Plan a Trip Now
                </Link>
                <Link
                  to="/discover"
                  className="inline-flex items-center gap-2 rounded border border-line bg-charcoal/60 px-6 py-3.5 text-sm text-ivory transition hover:border-moss/50 hover:bg-panel"
                >
                  Explore 60 Gems <ArrowRight size={15} />
                </Link>
              </div>

              {/* Destination quick pills */}
              <div className="mt-10 flex items-center gap-3 text-xs text-stone">
                <span className="uppercase tracking-wider text-stone-muted">Explore City:</span>
                <div className="flex flex-wrap gap-2">
                  {DESTINATIONS.map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => navigate(`/discover?destination=${dest}`)}
                      className="rounded border border-line bg-panel px-3 py-1 text-stone transition hover:border-moss hover:text-ivory"
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Pinterest-Inspired Floating Visual Collage */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Card 1: Kyoto */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  onClick={() => setInspectedPlace(places.find((p) => p.id === 'kyo-honen') || null)}
                  className="group relative cursor-pointer overflow-hidden rounded-sm border border-line bg-panel shadow-2xl transition hover:border-moss/60 hover:-translate-y-1"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1503899036084-c55cdd92e55e?auto=format&fit=crop&w=800&q=80"
                      alt="Hōnen-in moss gate"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-[10px] uppercase tracking-widest text-moss">Kyoto · Higashiyama</span>
                      <p className="font-display text-lg text-ivory">Hōnen-in Moss Gate</p>
                    </div>
                  </div>
                </motion.div>

                {/* Card 2: Lisbon + Bangalore stacked */}
                <div className="flex flex-col gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    onClick={() => setInspectedPlace(places.find((p) => p.id === 'lis-panoramico') || null)}
                    className="group relative cursor-pointer overflow-hidden rounded-sm border border-line bg-panel shadow-2xl transition hover:border-moss/60 hover:-translate-y-1"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&w=800&q=80"
                        alt="Panorâmico de Monsanto"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-2.5 left-3">
                        <span className="text-[10px] uppercase tracking-widest text-moss">Lisbon</span>
                        <p className="font-display text-base text-ivory">Panorâmico de Monsanto</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    onClick={() => setInspectedPlace(places.find((p) => p.id === 'blr-blossom') || null)}
                    className="group relative cursor-pointer overflow-hidden rounded-sm border border-line bg-panel shadow-2xl transition hover:border-moss/60 hover:-translate-y-1"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80"
                        alt="Blossom Book House"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-3 left-3">
                        <span className="text-[10px] uppercase tracking-widest text-moss">Bengaluru · Church St</span>
                        <p className="font-display text-base text-ivory">Blossom Book House</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Floating aesthetic stamp badge */}
              <div className="absolute -bottom-5 -left-5 hidden rounded-sm border border-line bg-charcoal/95 p-3.5 shadow-2xl backdrop-blur-md sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-moss/20 text-moss">
                    <Compass size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ivory">Curated On-Device</p>
                    <p className="text-[11px] text-stone">No live tracking · No API key needed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL MANIFESTO / THREE PILLARS */}
      <section className="border-b border-line bg-charcoal/40 py-20">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-moss">The Obscura Manifesto</p>
          <blockquote className="mt-6 font-display text-3xl font-light italic leading-snug text-ivory sm:text-4xl">
            “Travel isn’t about queueing four hours with sunhats for a photo everyone has taken.
            It’s the rain on the Church Street tin roof. The moss gate at 7:15 AM in Sakyo.
            The fado leaking from an Alfama shutter before the tables fill.”
          </blockquote>
          <div className="mt-8 flex justify-center">
            <span className="h-0.5 w-16 bg-moss/50" />
          </div>

          <div className="mt-14 grid gap-8 text-left sm:grid-cols-3">
            <div className="rounded border border-line/60 bg-panel/60 p-6">
              <span className="text-xs uppercase tracking-[0.2em] text-moss">01 / Curated</span>
              <h3 className="mt-2 font-display text-2xl text-ivory">Handpicked Character</h3>
              <p className="mt-2 text-xs leading-relaxed text-stone">
                60 curated spots with verified quietness ratings, authentic descriptions, and realistic duration estimates.
              </p>
            </div>

            <div className="rounded border border-line/60 bg-panel/60 p-6">
              <span className="text-xs uppercase tracking-[0.2em] text-moss">02 / Pacing</span>
              <h3 className="mt-2 font-display text-2xl text-ivory">Respect for Energy</h3>
              <p className="mt-2 text-xs leading-relaxed text-stone">
                Relaxed, balanced, or packed modes that schedule sensible transition gaps and geographical clustering.
              </p>
            </div>

            <div className="rounded border border-line/60 bg-panel/60 p-6">
              <span className="text-xs uppercase tracking-[0.2em] text-moss">03 / Privacy</span>
              <h3 className="mt-2 font-display text-2xl text-ivory">Local Storage</h3>
              <p className="mt-2 text-xs leading-relaxed text-stone">
                Saved trips and bookmarks live privately on your browser. Print directly to PDF without signing up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED DESTINATIONS SHOWCASE */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-moss">Three Curated Cities</p>
            <h2 className="mt-2 font-display text-4xl text-ivory md:text-5xl">Where would you like to wander?</h2>
          </div>
          <Link to="/discover" className="inline-flex items-center gap-1.5 text-sm text-moss hover:underline">
            View full 60-place catalog <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {DESTINATIONS.map((city, idx) => {
            const copy = destinationCopy[city]
            const cityPlaces = places.filter((p) => p.destination === city)
            const avgQuiet = (
              cityPlaces.reduce((sum, p) => sum + p.quietness, 0) / cityPlaces.length
            ).toFixed(1)

            return (
              <div
                key={city}
                className={`group flex flex-col overflow-hidden rounded-sm border border-line bg-panel transition-all duration-300 hover:border-moss/50 hover:shadow-2xl ${
                  idx === 1 ? 'md:-translate-y-4' : ''
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={copy.imageUrl}
                    alt={city}
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/30 to-transparent" />
                  <div className="absolute left-4 top-4">
                    <span className="rounded-sm bg-ink/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-moss backdrop-blur-sm">
                      {copy.country}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-display text-4xl text-ivory">{city}</h3>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <p className="text-sm leading-relaxed text-stone">{copy.blurb}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-xs text-stone-muted">
                      <span>{cityPlaces.length} Curated Gems</span>
                      <span>Quietness {avgQuiet}/10</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    <Link
                      to={`/discover?destination=${city}`}
                      className="flex-1 rounded border border-line py-2 text-center text-xs font-medium text-stone transition hover:border-moss hover:text-ivory"
                    >
                      Browse Gems
                    </Link>
                    <Link
                      to={`/plan?destination=${city}`}
                      className="flex-1 rounded bg-moss/20 py-2 text-center text-xs font-medium text-moss transition hover:bg-moss hover:text-ink"
                    >
                      Plan 3 Days
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. ASYMMETRIC PINTEREST GALLERY ("DISPATCHES") */}
      <section className="border-y border-line bg-charcoal/50 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-moss">Curated Moods & Dispatches</p>
              <h2 className="mt-2 font-display text-4xl text-ivory">Gems from the field</h2>
            </div>
            <p className="max-w-md text-xs text-stone">
              Click any gem to inspect duration, cost, quietness, and exact OpenStreetMap coordinates.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {curatedShowcase.map((place) => {
              const saved = isBookmarked(place.id)
              return (
                <div
                  key={place.id}
                  onClick={() => setInspectedPlace(place)}
                  className="group relative cursor-pointer overflow-hidden rounded-sm border border-line bg-panel transition hover:border-moss/40 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
                    <img
                      src={place.imageUrl}
                      alt={place.imageAlt}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-60" />
                    <span className="absolute left-3 top-3 rounded-sm bg-ink/85 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ivory backdrop-blur-sm">
                      {CATEGORY_LABELS[place.category]}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleBookmark(place.id)
                      }}
                      className="absolute right-3 top-3 rounded-full bg-ink/80 p-2 text-ivory backdrop-blur-sm transition hover:scale-110"
                      aria-label={saved ? 'Remove bookmark' : 'Bookmark place'}
                    >
                      <Bookmark size={13} fill={saved ? '#8b9a6a' : 'none'} className={saved ? 'text-moss' : ''} />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-display text-2xl text-ivory transition group-hover:text-moss">
                        {place.name}
                      </h4>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-stone">
                      <MapPin size={12} className="text-moss" />
                      {place.neighborhood}, {place.destination}
                    </p>
                    <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-stone/80">
                      {place.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-xs">
                      <span className="text-moss font-medium">
                        {place.estimatedCost === 0 ? 'Free' : `~$${place.estimatedCost} / person`}
                      </span>
                      <span className="text-stone-muted text-[11px]">
                        Quiet {place.quietness}/10
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE DAY-IN-THE-LIFE TIMELINE PREVIEW */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-moss">Engine Preview</p>
            <h2 className="mt-2 font-display text-4xl text-ivory">A day scheduled with Obscura</h2>
          </div>

          {/* Destination Tab Switcher */}
          <div className="flex rounded border border-line bg-panel p-1">
            {DESTINATIONS.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setActiveCityTab(city)}
                className={`rounded px-4 py-1.5 text-xs font-medium transition ${
                  activeCityTab === city
                    ? 'bg-moss text-ink shadow'
                    : 'text-stone hover:text-ivory'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-sm border border-line bg-panel p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-moss">{activeCityTab} Sample Flow</p>
              <h3 className="mt-1 font-display text-3xl text-ivory">{samplePlan.title}</h3>
              <p className="mt-1 text-xs text-stone">{samplePlan.subtitle}</p>
            </div>
            <Link
              to={`/plan?destination=${activeCityTab}`}
              className="rounded bg-moss px-4 py-2 text-xs font-medium text-ink transition hover:bg-olive"
            >
              Generate Custom {activeCityTab} Trip →
            </Link>
          </div>

          <ol className="mt-8 space-y-4">
            {samplePlan.stops.map((stop) => {
              const place = places.find((p) => p.id === stop.placeId)
              if (!place) return null

              return (
                <li
                  key={stop.placeId}
                  onClick={() => setInspectedPlace(place)}
                  className="group flex cursor-pointer flex-col justify-between gap-4 rounded border border-line/80 bg-charcoal p-4 transition hover:border-moss/50 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-semibold text-moss">
                      {stop.time}
                    </span>
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-panel">
                      <img src={place.imageUrl} alt={place.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-display text-xl text-ivory transition group-hover:text-moss">
                        {place.name}
                      </h4>
                      <p className="text-xs text-stone-muted">{stop.note}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone sm:justify-end">
                    <span>{place.neighborhood}</span>
                    <span className="rounded bg-panel px-2 py-0.5 text-moss">
                      {place.estimatedCost === 0 ? 'Free' : `$${place.estimatedCost}`}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER BANNER */}
      <section className="relative border-t border-line bg-gradient-to-b from-charcoal to-ink py-20 text-center">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-xs uppercase tracking-[0.24em] text-moss">Ready to wander?</p>
          <h2 className="mt-3 font-display text-4xl text-ivory sm:text-5xl">
            Design an itinerary that feels like yours.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Select your destination, set your travel rhythm, and Obscura will construct a
            harmonious, day-by-day plan with neighborhood proximity in mind.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 rounded bg-moss px-7 py-3.5 text-sm font-medium text-ink transition hover:bg-olive"
            >
              Start Planning Now <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Place Inspection Details Modal */}
      {inspectedPlace && (
        <PlaceDetails
          place={inspectedPlace}
          onClose={() => setInspectedPlace(null)}
        />
      )}
    </div>
  )
}

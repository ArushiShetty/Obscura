import { Bookmark, Clock, Eye, MapPin, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Place } from '../types'
import { CATEGORY_LABELS } from '../types'
import { formatUsd } from '../lib/budgetCalculator'
import { useApp } from '../context/AppContext'

interface PlaceCardProps {
  place: Place
  onOpen: (place: Place) => void
}

export function PlaceCard({ place, onOpen }: PlaceCardProps) {
  const { isBookmarked, toggleBookmark } = useApp()
  const saved = isBookmarked(place.id)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-sm border border-line bg-panel transition-all duration-300 hover:border-moss/40 hover:bg-panel-card hover:shadow-xl"
    >
      <button
        type="button"
        className="block w-full text-left focus:outline-none"
        onClick={() => onOpen(place)}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
          <img
            src={place.imageUrl}
            alt={place.imageAlt}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-60 transition duration-300 group-hover:opacity-40" />

          {/* Category & Quietness badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span className="rounded-sm bg-ink/85 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-ivory backdrop-blur-sm">
              {CATEGORY_LABELS[place.category]}
            </span>
            {place.quietness >= 7 && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-moss/90 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink backdrop-blur-sm">
                <Sparkles size={10} />
                Quiet {place.quietness}/10
              </span>
            )}
          </div>

          {/* Duration badge */}
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded bg-ink/80 px-2 py-0.5 text-[11px] text-ivory/90 backdrop-blur-sm">
            <Clock size={11} /> {place.durationMinutes}m
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-2xl font-normal text-ivory transition-colors group-hover:text-moss">
              {place.name}
            </h3>
          </div>

          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-stone">
            <MapPin size={13} className="text-moss/80 shrink-0" />
            <span className="truncate">{place.neighborhood}, {place.destination}</span>
          </p>

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone/90">
            {place.description}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-xs">
            <span className="font-medium text-moss">
              {place.estimatedCost === 0
                ? 'Free to explore'
                : `~${formatUsd(place.estimatedCost)} / person`}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-stone opacity-0 transition duration-200 group-hover:opacity-100">
              <Eye size={12} /> Inspect
            </span>
          </div>
        </div>
      </button>

      {/* Footer bar with Bookmark button */}
      <div className="flex items-center justify-between border-t border-line bg-charcoal/40 px-4 py-2.5">
        <span className="text-[11px] uppercase tracking-wider text-stone-muted">
          {place.interests.slice(0, 2).join(' · ')}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            toggleBookmark(place.id)
          }}
          className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs uppercase tracking-[0.14em] transition ${
            saved
              ? 'bg-moss/15 text-moss hover:bg-moss/25'
              : 'text-stone hover:bg-panel hover:text-ivory'
          }`}
          title={saved ? 'Remove from saved places' : 'Save this place'}
        >
          <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
          <span>{saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </motion.article>
  )
}

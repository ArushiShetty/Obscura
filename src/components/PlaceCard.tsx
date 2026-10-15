import { Bookmark, Clock, Eye, MapPin, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Place } from '../types'
import { CATEGORY_LABELS } from '../types'
import { formatUsd } from '../lib/budgetCalculator'
import { useApp } from '../context/AppContext'

interface PlaceCardProps {
  place: Place
  onOpen: (place: Place) => void
  aspectRatio?: 'tall' | 'standard' | 'cinematic'
}

export function PlaceCard({ place, onOpen, aspectRatio = 'standard' }: PlaceCardProps) {
  const { isBookmarked, toggleBookmark } = useApp()
  const saved = isBookmarked(place.id)

  const aspectClass =
    aspectRatio === 'tall'
      ? 'aspect-[3/4]'
      : aspectRatio === 'cinematic'
      ? 'aspect-[16/10]'
      : 'aspect-[4/3]'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-panel transition-all duration-500 hover:-translate-y-1.5 hover:border-moss/50 hover:bg-panel-card hover:shadow-2xl"
    >
      <button
        type="button"
        className="block w-full text-left focus:outline-none"
        onClick={() => onOpen(place)}
      >
        <div className={`relative ${aspectClass} overflow-hidden bg-charcoal`}>
          <img
            src={place.imageUrl}
            alt={place.imageAlt}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-50 transition duration-300 group-hover:opacity-30" />

          {/* Floating Category Tag */}
          <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-ink/85 px-3 py-1 text-[11px] font-medium tracking-wide text-ivory backdrop-blur-md shadow-sm">
              {CATEGORY_LABELS[place.category]}
            </span>
            {place.quietness >= 7 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-moss/90 px-2.5 py-1 text-[10px] font-semibold text-ink backdrop-blur-md shadow-sm">
                <Sparkles size={10} />
                Quiet {place.quietness}/10
              </span>
            )}
          </div>

          {/* Floating Pinterest-Style Bookmark Button on Image */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleBookmark(place.id)
            }}
            className={`absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full shadow-lg backdrop-blur-md transition-all duration-300 ${
              saved
                ? 'bg-moss text-ink scale-100'
                : 'bg-ink/80 text-ivory opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-moss hover:text-ink'
            }`}
            title={saved ? 'Remove bookmark' : 'Save to bookmarks'}
          >
            <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
          </button>

          {/* Duration Pill at bottom right */}
          <span className="absolute bottom-3 right-3.5 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-0.5 text-[11px] text-ivory/90 backdrop-blur-md">
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

          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-stone/90">
            {place.description}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-xs">
            <span className="font-medium text-moss">
              {place.estimatedCost === 0
                ? 'Free discovery'
                : `~${formatUsd(place.estimatedCost)} / traveler`}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-stone opacity-0 transition duration-200 group-hover:opacity-100">
              <Eye size={12} /> View pin
            </span>
          </div>
        </div>
      </button>

      {/* Footer bar with Tags & Quick Pin */}
      <div className="flex items-center justify-between border-t border-line bg-charcoal/40 px-4 py-2.5">
        <span className="text-[11px] capitalize tracking-wide text-stone-muted truncate max-w-[200px]">
          {place.interests.slice(0, 3).join(' · ')}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            toggleBookmark(place.id)
          }}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
            saved
              ? 'bg-moss/20 text-moss hover:bg-moss/30'
              : 'text-stone hover:bg-panel hover:text-ivory'
          }`}
        >
          <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
          <span>{saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </motion.article>
  )
}

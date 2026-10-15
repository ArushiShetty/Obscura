import {
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { getPlaceById } from '../data/places'
import { formatUsd } from '../lib/budgetCalculator'
import type { ItineraryDay } from '../types'
import { CATEGORY_LABELS } from '../types'
import { useApp } from '../context/AppContext'

interface ItineraryTimelineProps {
  days: ItineraryDay[]
  travelers: number
  editable?: boolean
  activeDayFilter?: number | null
  onOpenPlace?: (placeId: string) => void
  onAddActivity?: (dayNumber: number) => void
}

export function ItineraryTimeline({
  days,
  travelers,
  editable = false,
  activeDayFilter = null,
  onOpenPlace,
  onAddActivity,
}: ItineraryTimelineProps) {
  const { removeActivity, moveActivity } = useApp()

  const displayedDays =
    activeDayFilter === null
      ? days
      : days.filter((d) => d.day === activeDayFilter)

  return (
    <div className="space-y-12">
      {displayedDays.map((day) => (
        <section
          key={day.day}
          className="print-surface rounded-sm border border-line bg-panel/70 p-6 shadow-sm backdrop-blur-sm"
        >
          {/* Day Header */}
          <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-sm bg-moss/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-moss">
                  Day {day.day}
                </span>
                {day.date && (
                  <span className="text-xs text-stone-muted">{day.date}</span>
                )}
              </div>
              <h3 className="mt-2 font-display text-3xl font-normal text-ivory">
                {day.theme}
              </h3>
            </div>

            {editable && onAddActivity && (
              <button
                type="button"
                onClick={() => onAddActivity(day.day)}
                className="no-print inline-flex items-center gap-1.5 rounded border border-line px-3 py-1.5 text-xs text-stone transition hover:border-moss hover:bg-panel hover:text-ivory"
              >
                <Plus size={13} className="text-moss" />
                <span>Add Stop</span>
              </button>
            )}
          </header>

          {/* Activities list */}
          {day.activities.length === 0 ? (
            <div className="border border-dashed border-line/60 p-8 text-center text-sm text-stone">
              <p>No activities on this day yet.</p>
              {editable && onAddActivity && (
                <button
                  type="button"
                  onClick={() => onAddActivity(day.day)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-moss hover:underline"
                >
                  <Plus size={13} /> Add an activity to Day {day.day}
                </button>
              )}
            </div>
          ) : (
            <ol className="space-y-3.5">
              {day.activities.map((activity, index) => {
                const place = getPlaceById(activity.placeId)
                if (!place) return null

                return (
                  <li
                    key={activity.id}
                    className="print-card group relative grid gap-4 rounded border border-line/80 bg-charcoal p-4 transition-all duration-200 hover:border-moss/40 sm:grid-cols-[100px_90px_1fr_auto]"
                  >
                    {/* Time & Duration badge */}
                    <div className="flex flex-col justify-center text-xs">
                      <span className="flex items-center gap-1 font-mono font-medium text-moss">
                        <Clock size={12} />
                        {activity.startTime}
                      </span>
                      <span className="mt-1 text-[11px] text-stone-muted">
                        {activity.durationMinutes} min visit
                      </span>
                    </div>

                    {/* Image Thumbnail */}
                    <div className="relative hidden h-20 w-20 overflow-hidden rounded bg-panel sm:block">
                      <img
                        src={place.imageUrl}
                        alt={place.imageAlt}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Place info */}
                    <button
                      type="button"
                      className="text-left focus:outline-none"
                      onClick={() => onOpenPlace?.(place.id)}
                    >
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-2xl font-normal text-ivory transition group-hover:text-moss">
                          {place.name}
                        </h4>
                        <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-stone-muted">
                          {CATEGORY_LABELS[place.category]}
                        </span>
                      </div>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-stone">
                        <MapPin size={12} className="text-moss/70" />
                        <span>{place.neighborhood}</span>
                        <span>·</span>
                        <span className="text-moss">
                          {place.estimatedCost === 0
                            ? 'Free'
                            : `${formatUsd(place.estimatedCost * travelers)} est.`}
                        </span>
                        {place.quietness >= 7 && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-0.5 text-stone-muted">
                              <Sparkles size={10} className="text-moss" />
                              Quiet
                            </span>
                          </>
                        )}
                      </p>

                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone/80">
                        {place.description}
                      </p>
                    </button>

                    {/* Action buttons (Move & Delete) */}
                    {editable && (
                      <div className="no-print flex items-center gap-1 self-start sm:flex-col sm:self-center">
                        <button
                          type="button"
                          aria-label={`Move ${place.name} up`}
                          disabled={index === 0}
                          onClick={() => moveActivity(day.day, activity.id, -1)}
                          className="rounded p-1.5 text-stone transition hover:bg-panel hover:text-ivory disabled:opacity-20"
                          title="Move up (adjusts times)"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${place.name} down`}
                          disabled={index === day.activities.length - 1}
                          onClick={() => moveActivity(day.day, activity.id, 1)}
                          className="rounded p-1.5 text-stone transition hover:bg-panel hover:text-ivory disabled:opacity-20"
                          title="Move down (adjusts times)"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${place.name}`}
                          onClick={() => removeActivity(day.day, activity.id)}
                          className="rounded p-1.5 text-stone transition hover:bg-panel hover:text-rose-400"
                          title="Remove activity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      ))}
    </div>
  )
}

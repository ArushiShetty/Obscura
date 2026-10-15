import { Minus, Plus, Users, Wallet } from 'lucide-react'
import type { Itinerary } from '../types'
import { BUDGET_BANDS, dayTotal, formatUsd, itineraryTotal } from '../lib/budgetCalculator'
import { BUDGET_LABELS } from '../types'
import { useApp } from '../context/AppContext'

export function BudgetSummary({ itinerary }: { itinerary: Itinerary }) {
  const { updateTravelers } = useApp()
  const total = itineraryTotal(itinerary)
  const travelers = itinerary.preferences.travelers
  const perPerson = Math.round(total / (travelers || 1))
  const band = BUDGET_BANDS[itinerary.preferences.budget]

  // Calculate day totals and max for visual relative bars
  const dayBreakdown = itinerary.days.map((day) => ({
    day: day.day,
    total: dayTotal(day, travelers),
    perPerson: dayTotal(day, 1),
  }))
  const maxDayTotal = Math.max(...dayBreakdown.map((d) => d.total), 1)

  return (
    <aside className="print-budget flex flex-col justify-between rounded-sm border border-line bg-panel p-6">
      <div>
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-moss">
            <Wallet size={13} /> Estimated Spend
          </p>
          <span className="rounded bg-charcoal px-2 py-0.5 text-[11px] font-medium text-stone">
            {BUDGET_LABELS[itinerary.preferences.budget]}
          </span>
        </div>

        <p className="mt-3 font-display text-4xl font-normal text-ivory tracking-tight">
          {formatUsd(total)}
        </p>

        <p className="mt-1 text-xs text-stone">
          ~{formatUsd(perPerson)} per traveler across {itinerary.preferences.durationDays} {itinerary.preferences.durationDays === 1 ? 'day' : 'days'}
        </p>

        {/* Live Party Size Adjuster */}
        <div className="no-print mt-5 rounded border border-line bg-charcoal/60 p-3">
          <div className="flex items-center justify-between text-xs text-stone">
            <span className="flex items-center gap-1.5 font-medium text-ivory">
              <Users size={13} className="text-moss" /> Party Size
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateTravelers(Math.max(1, travelers - 1))}
                disabled={travelers <= 1}
                aria-label="Decrease travelers"
                className="flex h-6 w-6 items-center justify-center rounded border border-line text-stone transition hover:border-moss hover:text-ivory disabled:opacity-30"
              >
                <Minus size={12} />
              </button>
              <span className="w-5 text-center font-mono font-medium text-ivory">
                {travelers}
              </span>
              <button
                type="button"
                onClick={() => updateTravelers(Math.min(10, travelers + 1))}
                disabled={travelers >= 10}
                aria-label="Increase travelers"
                className="flex h-6 w-6 items-center justify-center rounded border border-line text-stone transition hover:border-moss hover:text-ivory disabled:opacity-30"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Day-by-Day Visual Spend Breakdown */}
        <div className="mt-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-muted">
            Daily breakdown ({travelers} {travelers === 1 ? 'traveler' : 'travelers'})
          </p>
          <ul className="mt-3 space-y-2.5">
            {dayBreakdown.map((item) => {
              const percentage = Math.round((item.total / maxDayTotal) * 100)
              return (
                <li key={item.day} className="text-xs">
                  <div className="flex justify-between text-stone">
                    <span className="font-medium text-ivory">Day {item.day}</span>
                    <span className="font-mono text-ivory">{formatUsd(item.total)}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-ink">
                    <div
                      className="h-full rounded-full bg-moss/70 transition-all duration-300"
                      style={{ width: `${Math.max(8, percentage)}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="mt-6 border-t border-line/60 pt-4">
        <p className="text-[11px] leading-relaxed text-stone">
          Curated estimates based on typical tickets, tastings, and café stops.
          {band?.hint ? ` ${band.hint}` : ''}
        </p>
      </div>
    </aside>
  )
}

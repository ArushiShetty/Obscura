import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { List, Map as MapIcon, MapPin } from 'lucide-react'
import type { Place } from '../types'
import { formatUsd } from '../lib/budgetCalculator'
import { CATEGORY_LABELS } from '../types'

function createNumberedIcon(num: number) {
  return L.divIcon({
    className: 'obscura-marker-wrapper',
    html: `<div class="obscura-marker-pin">${num}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  })
}

function InvalidateAndFit({ places }: { places: Place[] }) {
  const map = useMap()
  const key = places.map((place) => place.id).join(',')

  useEffect(() => {
    // Invalidate size to handle tab switches or container resizes
    const timer = setTimeout(() => {
      map.invalidateSize()
      if (places.length > 0) {
        const bounds = L.latLngBounds(
          places.map((place) => [place.coordinates.lat, place.coordinates.lng]),
        )
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [key, map, places])

  return null
}

interface MapViewProps {
  places: Place[]
  onSelect?: (place: Place) => void
  className?: string
  showSequence?: boolean
}

export function MapView({
  places,
  onSelect,
  className,
  showSequence = true,
}: MapViewProps) {
  const [mode, setMode] = useState<'map' | 'list'>('map')

  const center = useMemo<[number, number]>(() => {
    if (!places.length) return [35.0116, 135.7681]
    return [places[0].coordinates.lat, places[0].coordinates.lng]
  }, [places])

  if (!places.length) {
    return (
      <div
        className={`flex items-center justify-center rounded-sm border border-line bg-panel p-6 text-center text-sm text-stone ${
          className ?? 'h-[440px]'
        }`}
      >
        <p>No mapped places in this view.</p>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col overflow-hidden rounded-sm border border-line bg-panel">
      {/* View Switcher Header */}
      <div className="flex items-center justify-between border-b border-line bg-charcoal/80 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs text-stone">
          <MapPin size={13} className="text-moss" />
          <span>{places.length} geocoded {places.length === 1 ? 'place' : 'places'}</span>
        </div>
        <div className="flex items-center rounded border border-line bg-ink/70 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode('map')}
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition ${
              mode === 'map' ? 'bg-panel text-ivory shadow' : 'text-stone hover:text-ivory'
            }`}
          >
            <MapIcon size={12} /> Map View
          </button>
          <button
            type="button"
            onClick={() => setMode('list')}
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition ${
              mode === 'list' ? 'bg-panel text-ivory shadow' : 'text-stone hover:text-ivory'
            }`}
          >
            <List size={12} /> List Fallback
          </button>
        </div>
      </div>

      {mode === 'map' ? (
        <div className={`w-full ${className ?? 'h-[440px]'}`}>
          <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={false}
            className="h-full w-full"
            attributionControl
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <InvalidateAndFit places={places} />
            {places.map((place, index) => (
              <Marker
                key={place.id}
                position={[place.coordinates.lat, place.coordinates.lng]}
                icon={createNumberedIcon(showSequence ? index + 1 : index + 1)}
                eventHandlers={{
                  click: () => onSelect?.(place),
                }}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <p className="font-display text-base font-semibold text-ivory">
                      {showSequence ? `${index + 1}. ` : ''}{place.name}
                    </p>
                    <p className="mt-1 text-xs text-stone">
                      {place.neighborhood} · {CATEGORY_LABELS[place.category]}
                    </p>
                    <div className="mt-2 flex items-center justify-between pt-1 text-xs">
                      <span className="font-medium text-moss">
                        {place.estimatedCost === 0 ? 'Free' : formatUsd(place.estimatedCost)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelect?.(place)}
                        className="text-xs text-moss underline hover:text-ivory"
                      >
                        Inspect details →
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        /* Usable Accessible List Fallback */
        <div className={`overflow-y-auto p-4 ${className ?? 'h-[440px]'}`}>
          <div className="mb-3 flex items-center justify-between text-xs text-stone">
            <span>Stop sequence & neighborhood coordinates</span>
            <span className="text-[11px] text-stone-muted">OpenStreetMap fallback mode</span>
          </div>
          <ol className="space-y-2.5">
            {places.map((place, index) => (
              <li
                key={place.id}
                className="flex items-center justify-between rounded border border-line bg-charcoal p-3 transition hover:border-moss/40"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-moss text-xs font-bold text-ink">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-display text-lg text-ivory">{place.name}</h4>
                    <p className="text-xs text-stone">
                      {place.neighborhood} · {CATEGORY_LABELS[place.category]} · {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-moss">
                    {place.estimatedCost === 0 ? 'Free' : formatUsd(place.estimatedCost)}
                  </span>
                  {onSelect && (
                    <button
                      type="button"
                      onClick={() => onSelect(place)}
                      className="rounded border border-line px-2.5 py-1 text-xs text-stone hover:border-moss hover:text-ivory"
                    >
                      View
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

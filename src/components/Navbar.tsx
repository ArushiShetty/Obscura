import { Bookmark, Compass, MapPin, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { bookmarks, currentItinerary, trips } = useApp()

  const links = [
    { to: '/discover', label: 'Discover' },
    { to: '/plan', label: 'Plan a Trip' },
    {
      to: '/saved',
      label: 'Saved Places',
      badge: bookmarks.length > 0 ? bookmarks.length : null,
      icon: Bookmark,
    },
    {
      to: '/trips',
      label: 'My Trips',
      badge: trips.length > 0 ? trips.length : null,
    },
  ]

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        {/* Brand */}
        <Link to="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-moss/40 bg-panel text-moss transition duration-300 group-hover:border-moss group-hover:scale-105">
            <Compass size={18} strokeWidth={1.5} />
          </span>
          <div>
            <span className="block font-display text-2xl tracking-[0.2em] text-ivory">
              OBSCURA
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.22em] text-stone-muted sm:block">
              Hidden Travel Discovery
            </span>
          </div>
        </Link>

        {/* Navigation links & Current trip indicator */}
        <div className="hidden items-center gap-7 md:flex">
          <nav className="flex items-center gap-7">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-1.5 text-sm tracking-wide transition-colors ${
                    isActive ? 'font-medium text-ivory' : 'text-stone hover:text-ivory'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>
                    {link.badge !== null && (
                      <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-moss/20 px-1 text-[10px] font-medium text-moss">
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute -bottom-2 left-0 right-0 h-[2px] rounded-full bg-moss" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Active trip quick-link pill */}
          {currentItinerary && (
            <Link
              to="/itinerary"
              className="inline-flex items-center gap-2 rounded-full border border-moss/30 bg-moss/10 px-3.5 py-1.5 text-xs text-moss transition hover:border-moss hover:bg-moss/20"
            >
              <MapPin size={12} />
              <span>{currentItinerary.destination}</span>
              <span className="text-[10px] text-stone">
                ({currentItinerary.preferences.durationDays}d)
              </span>
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3 md:hidden">
          {currentItinerary && (
            <Link
              to="/itinerary"
              className="inline-flex items-center gap-1 rounded-full border border-moss/30 bg-moss/10 px-2.5 py-1 text-xs text-moss"
            >
              <MapPin size={11} />
              <span>{currentItinerary.destination}</span>
            </Link>
          )}
          <button
            type="button"
            className="rounded p-1 text-ivory hover:bg-panel"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <nav className="border-t border-line bg-charcoal/95 px-5 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between text-base ${
                    isActive ? 'font-medium text-ivory' : 'text-stone'
                  }`
                }
              >
                <span>{link.label}</span>
                {link.badge !== null && (
                  <span className="rounded-full bg-moss/20 px-2 py-0.5 text-xs text-moss">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
            {currentItinerary && (
              <Link
                to="/itinerary"
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center justify-between rounded border border-moss/30 bg-moss/10 px-3 py-2 text-sm text-moss"
              >
                <span className="flex items-center gap-2">
                  <MapPin size={14} /> Active {currentItinerary.destination} Trip
                </span>
                <span>Open →</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

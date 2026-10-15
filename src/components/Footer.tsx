import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="no-print border-t border-line bg-charcoal">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-moss">
            <Compass size={18} strokeWidth={1.5} />
            <span className="font-display text-xl tracking-[0.2em] text-ivory">
              OBSCURA
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone">
            Find the places the guidebooks missed. A quieter way to plan days in
            cities that still have rooms you haven’t entered.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone">Explore</p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link to="/discover" className="text-ivory/90 hover:text-moss">
              Discover places
            </Link>
            <Link to="/plan" className="text-ivory/90 hover:text-moss">
              Plan a trip
            </Link>
            <Link to="/saved" className="text-ivory/90 hover:text-moss">
              Saved places
            </Link>
            <Link to="/trips" className="text-ivory/90 hover:text-moss">
              My trips
            </Link>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone">Cities</p>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            Bengaluru, Kyoto, and Lisbon in this collection. Recommendations are
            generated on your device from a curated local dataset — no account,
            no live availability claims.
          </p>
        </div>
      </div>
      <div className="border-t border-line px-5 py-5 text-center text-xs tracking-wide text-stone">
        Obscura · Find the places the guidebooks missed · Made with care by <a href="https://github.com/ArushiShetty" target="_blank" rel="noopener noreferrer" className="text-moss hover:underline">Arushi Shetty</a>
      </div>
    </footer>
  )
}

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
}

export class MapBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-[420px] items-center justify-center border border-line bg-panel px-6 text-center text-sm text-stone">
          The map could not load. Your itinerary and place list still work without it.
        </div>
      )
    }
    return this.props.children
  }
}

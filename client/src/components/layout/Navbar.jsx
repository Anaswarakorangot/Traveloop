import { Link } from 'react-router-dom'
import { Search, Bell, Menu } from 'lucide-react'
import { Avatar } from '../common/Avatar'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'

export function Navbar() {
  const { user } = useAuthStore()
  const { toggleMobileNav } = useUIStore()

  return (
    <nav className="h-16 bg-surface border-b border-border px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileNav}
          className="lg:hidden p-2 text-muted hover:text-white"
        >
          <Menu size={24} />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">✈️</span>
          <span className="font-display text-xl font-bold text-white hidden sm:block">
            Traveloop
          </span>
        </Link>
      </div>

      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search trips, destinations..."
            className="w-full pl-10 pr-4 py-2 bg-dark border border-border rounded-full text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-muted hover:text-white relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full" />
        </button>
        <Link to="/profile">
          <Avatar
            src={user?.avatarUrl}
            name={`${user?.firstName} ${user?.lastName}`}
            size="sm"
          />
        </Link>
      </div>
    </nav>
  )
}

import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Bell, Menu } from 'lucide-react'
import { Avatar } from '../common/Avatar'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'

export function Navbar() {
  const { user } = useAuthStore()
  const { toggleMobileNav } = useUIStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-muted hover:text-white relative"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full" />
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-white">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="p-4 border-b border-border/50 hover:bg-dark transition-colors cursor-pointer">
                  <p className="text-sm text-white font-medium mb-1">Welcome to Traveloop! 🎉</p>
                  <p className="text-xs text-muted">Get started by planning your first trip or exploring destinations.</p>
                  <p className="text-xs text-muted mt-2">Just now</p>
                </div>
                <div className="p-4 border-b border-border/50 hover:bg-dark transition-colors cursor-pointer">
                  <p className="text-sm text-white font-medium mb-1">Profile Setup</p>
                  <p className="text-xs text-muted">Don't forget to update your avatar and privacy settings in your profile.</p>
                  <p className="text-xs text-muted mt-2">2 hours ago</p>
                </div>
              </div>
              <div className="p-3 text-center border-t border-border">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-sm text-primary hover:text-primary-light transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>
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

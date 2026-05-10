import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  Map,
  Compass,
  Users,
  User,
  Settings,
  LogOut,
  Shield
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trips', label: 'My Trips', icon: Map },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/profile', label: 'Profile', icon: User },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()

  return (
    <aside className="w-64 bg-surface border-r border-border h-[calc(100vh-4rem)] sticky top-16 hidden lg:flex flex-col">
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-muted hover:bg-dark hover:text-white'
              )
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-muted hover:bg-dark hover:text-white'
              )
            }
          >
            <Shield size={20} />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-muted hover:bg-dark hover:text-danger transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

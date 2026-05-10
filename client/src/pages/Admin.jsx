import { useEffect, useState } from 'react'
import { Users, Map, MessageSquare, TrendingUp } from 'lucide-react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { CardSkeleton } from '../components/common/Skeleton'
import { toast } from '../components/common/Toast'
import { adminApi } from '../api/admin'
import { format } from 'date-fns'

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [trips, setTrips] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes, tripsRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getUsers({ limit: 10 }),
          adminApi.getTrips({ limit: 10 })
        ])
        setStats(statsRes.data)
        setUsers(usersRes.data.users)
        setTrips(tripsRes.data.trips)
      } catch (error) {
        toast.error('Failed to load admin data')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const updateUserRole = async (userId, role) => {
    try {
      await adminApi.updateUserRole(userId, role)
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u))
      toast.success('Role updated')
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-surface rounded w-1/4 animate-pulse" />
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Users className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-muted text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/20 rounded-lg">
              <Map className="text-secondary" size={24} />
            </div>
            <div>
              <p className="text-muted text-sm">Total Trips</p>
              <p className="text-2xl font-bold text-white">{stats?.totalTrips || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <MessageSquare className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-muted text-sm">Total Posts</p>
              <p className="text-2xl font-bold text-white">{stats?.totalPosts || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TrendingUp className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-muted text-sm">Active Trips</p>
              <p className="text-2xl font-bold text-white">
                {stats?.tripsByStatus?.ongoing || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {['overview', 'users', 'trips', 'cities'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg capitalize transition-colors ${
              activeTab === tab
                ? 'bg-surface text-white'
                : 'text-muted hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardTitle className="mb-4">Recent Users</CardTitle>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentUsers?.map(user => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-white">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </div>
                    <span className="text-xs text-muted">
                      {format(new Date(user.createdAt), 'MMM d')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Cities */}
          <Card>
            <CardTitle className="mb-4">Popular Cities</CardTitle>
            <CardContent>
              <div className="space-y-3">
                {stats?.popularCities?.map((city, i) => (
                  <div key={city.id || i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-muted">{i + 1}</span>
                      <span className="text-white">{city.name}</span>
                    </div>
                    <Badge variant="primary">{city.tripCount} trips</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <Card>
          <CardTitle className="mb-4">Users</CardTitle>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-muted text-sm border-b border-border">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Trips</th>
                    <th className="pb-3">Posts</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-border/50">
                      <td className="py-3 text-white">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="py-3 text-muted">{user.email}</td>
                      <td className="py-3">
                        <Badge variant={user.role === 'admin' ? 'secondary' : 'default'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted">{user._count?.trips || 0}</td>
                      <td className="py-3 text-muted">{user._count?.communityPosts || 0}</td>
                      <td className="py-3">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="px-2 py-1 bg-dark border border-border rounded text-white text-sm"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trips */}
      {activeTab === 'trips' && (
        <Card>
          <CardTitle className="mb-4">Recent Trips</CardTitle>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-muted text-sm border-b border-border">
                    <th className="pb-3">Title</th>
                    <th className="pb-3">User</th>
                    <th className="pb-3">Destinations</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map(trip => (
                    <tr key={trip.id} className="border-b border-border/50">
                      <td className="py-3 text-white">{trip.title}</td>
                      <td className="py-3 text-muted">{trip.user?.email}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {trip.stops?.map(stop => (
                            <Badge key={stop.id} variant="default">{stop.city?.name}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant={trip.status}>{trip.status}</Badge>
                      </td>
                      <td className="py-3 text-muted">
                        {format(new Date(trip.createdAt), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cities */}
      {activeTab === 'cities' && (
        <Card>
          <CardTitle className="mb-4">Popular Cities</CardTitle>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats?.popularCities?.map((city, i) => (
                <div key={city.id || i} className="flex items-center gap-3 p-3 bg-dark rounded-lg">
                  <span className="text-2xl font-bold text-muted">#{i + 1}</span>
                  <div>
                    <p className="text-white font-medium">{city.name}</p>
                    <p className="text-sm text-muted">{city.country}</p>
                  </div>
                  <Badge variant="primary" className="ml-auto">{city.tripCount} trips</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

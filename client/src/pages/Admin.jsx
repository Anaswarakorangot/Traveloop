import { useEffect, useState } from 'react'
import { Users, Map, FileText, BarChart3, Download, Trash2, Ban } from 'lucide-react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { toast } from '../components/common/Toast'
import { adminApi } from '../api/admin'
import { format } from 'date-fns'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CHART_COLORS = ['#A78BFA', '#06B6D4', '#F59E0B', '#EF4444', '#10B981', '#EC4899']

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [trips, setTrips] = useState([])
  const [cities, setCities] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes, tripsRes, citiesRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getUsers({ limit: 20 }),
          adminApi.getTrips({ limit: 20 }),
          adminApi.getPopularCities(10),
        ])
        setStats(statsRes.data)
        setUsers(usersRes.data)
        setTrips(tripsRes.data)
        setCities(citiesRes.data)
      } catch (e) { console.error(e) }
      finally { setIsLoading(false) }
    }
    load()
  }, [])

  const exportCsv = async (type) => {
    try {
      const { data } = type === 'users' ? await adminApi.exportUsers() : await adminApi.exportTrips()
      const url = window.URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
      const a = document.createElement('a')
      a.href = url; a.download = `${type}_export.json`; a.click()
      toast.success(`${type} exported`)
    } catch { toast.error('Export failed') }
  }

  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-surface rounded w-1/3" /><div className="h-64 bg-surface rounded" /></div>

  const statusData = [
    { name: 'Draft', value: stats?.tripsByStatus?.draft || 0 },
    { name: 'Planned', value: stats?.tripsByStatus?.planned || 0 },
    { name: 'Ongoing', value: stats?.tripsByStatus?.ongoing || 0 },
    { name: 'Completed', value: stats?.tripsByStatus?.completed || 0 },
  ].filter(d => d.value > 0)

  const cityData = cities.slice(0, 8).map(c => ({ name: c.name, trips: c._count?.tripStops || c.popularity || 0 }))

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[{ key: 'overview', label: 'Overview', icon: BarChart3 }, { key: 'users', label: 'Users', icon: Users }, { key: 'trips', label: 'Trips', icon: Map }, { key: 'reports', label: 'Reports', icon: FileText }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${activeTab === tab.key ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-white'}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Users', value: stats?.totalUsers || 0, icon: '👥' },
              { label: 'Trips', value: stats?.totalTrips || 0, icon: '🗺️' },
              { label: 'Cities', value: stats?.totalCities || 0, icon: '🏙️' },
              { label: 'Posts', value: stats?.totalPosts || 0, icon: '📝' },
            ].map(s => (
              <Card key={s.label} className="text-center">
                <div className="text-3xl mb-1">{s.icon}</div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardTitle className="mb-4">Trip Status Distribution</CardTitle>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                      {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardTitle className="mb-4">Popular Cities</CardTitle>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid #333', borderRadius: '8px' }} />
                    <Bar dataKey="trips" fill="#A78BFA" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>All Users</CardTitle>
            <Button variant="secondary" onClick={() => exportCsv('users')} className="gap-2">
              <Download size={16} /> Export
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted border-b border-border"><th className="pb-2 pr-4">Name</th><th className="pb-2 pr-4">Email</th><th className="pb-2 pr-4">Role</th><th className="pb-2 pr-4">Joined</th><th className="pb-2">Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-border/30">
                    <td className="py-2 pr-4 text-white">{u.firstName} {u.lastName}</td>
                    <td className="py-2 pr-4 text-muted">{u.email}</td>
                    <td className="py-2 pr-4"><Badge variant={u.role === 'admin' ? 'secondary' : 'default'}>{u.role}</Badge></td>
                    <td className="py-2 pr-4 text-muted">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                    <td className="py-2">
                      <button className="text-muted hover:text-danger" title="Ban"><Ban size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Trips Tab */}
      {activeTab === 'trips' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>All Trips</CardTitle>
            <Button variant="secondary" onClick={() => exportCsv('trips')} className="gap-2">
              <Download size={16} /> Export
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted border-b border-border"><th className="pb-2 pr-4">Title</th><th className="pb-2 pr-4">User</th><th className="pb-2 pr-4">Status</th><th className="pb-2 pr-4">Budget</th><th className="pb-2">Dates</th></tr></thead>
              <tbody>
                {trips.map(t => (
                  <tr key={t.id} className="border-b border-border/30">
                    <td className="py-2 pr-4 text-white font-medium">{t.title}</td>
                    <td className="py-2 pr-4 text-muted">{t.user?.firstName} {t.user?.lastName}</td>
                    <td className="py-2 pr-4"><Badge variant={t.status}>{t.status}</Badge></td>
                    <td className="py-2 pr-4 text-secondary">${Number(t.totalBudget).toLocaleString()}</td>
                    <td className="py-2 text-muted">{format(new Date(t.startDate), 'MMM d')} - {format(new Date(t.endDate), 'MMM d')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <>
          <Card>
            <CardTitle className="mb-4">Revenue & Expense Summary</CardTitle>
            <CardContent>
              <p className="text-muted text-sm mb-4">Aggregate spending across all trips</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-dark rounded-lg text-center">
                  <p className="text-xs text-muted">Avg Budget</p>
                  <p className="text-lg font-bold text-white">${stats?.avgBudget?.toLocaleString() || 'N/A'}</p>
                </div>
                <div className="p-4 bg-dark rounded-lg text-center">
                  <p className="text-xs text-muted">Total Budget</p>
                  <p className="text-lg font-bold text-secondary">${stats?.totalBudget?.toLocaleString() || 'N/A'}</p>
                </div>
                <div className="p-4 bg-dark rounded-lg text-center">
                  <p className="text-xs text-muted">Active Users</p>
                  <p className="text-lg font-bold text-white">{stats?.activeUsers || stats?.totalUsers || 0}</p>
                </div>
                <div className="p-4 bg-dark rounded-lg text-center">
                  <p className="text-xs text-muted">Community Posts</p>
                  <p className="text-lg font-bold text-white">{stats?.totalPosts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

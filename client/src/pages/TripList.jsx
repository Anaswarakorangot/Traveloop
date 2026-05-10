import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Trash2, Copy, Share2, MoreVertical, SortAsc } from 'lucide-react'
import { Card, CardTitle } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { TripCardSkeleton } from '../components/common/Skeleton'
import { toast } from '../components/common/Toast'
import { useTripStore } from '../store/tripStore'
import { tripsApi } from '../api/trips'
import { format } from 'date-fns'

export default function TripList() {
  const { trips, fetchTrips, isLoading, deleteTrip } = useTripStore()
  const [sortBy, setSortBy] = useState('date')
  const [statusFilter, setStatusFilter] = useState('all')
  const [openMenu, setOpenMenu] = useState(null)

  useEffect(() => { fetchTrips() }, [fetchTrips])

  const statuses = ['all', 'draft', 'planned', 'ongoing', 'completed']

  const filtered = trips
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'budget') return Number(b.totalBudget) - Number(a.totalBudget)
      if (sortBy === 'name') return a.title.localeCompare(b.title)
      return new Date(b.startDate) - new Date(a.startDate)
    })

  const grouped = {
    upcoming: filtered.filter(t => new Date(t.startDate) > new Date()),
    ongoing: filtered.filter(t => t.status === 'ongoing'),
    past: filtered.filter(t => t.status === 'completed'),
    other: filtered.filter(t => !['ongoing', 'completed'].includes(t.status) && new Date(t.startDate) <= new Date()),
  }

  const handleDelete = async (tripId) => {
    if (!confirm('Delete this trip?')) return
    try { await deleteTrip(tripId); toast.success('Trip deleted') }
    catch { toast.error('Failed to delete') }
    setOpenMenu(null)
  }

  const handleDuplicate = async (tripId) => {
    try { await tripsApi.clone(tripId); await fetchTrips(); toast.success('Trip duplicated!') }
    catch { toast.error('Failed to duplicate') }
    setOpenMenu(null)
  }

  const handleShare = async (tripId) => {
    try {
      await tripsApi.shareTrip(tripId)
      await navigator.clipboard.writeText(`${window.location.origin}/trips/${tripId}`)
      toast.success('Share link copied!')
    } catch { toast.error('Failed to share') }
    setOpenMenu(null)
  }

  const renderGroup = (label, items) => {
    if (items.length === 0) return null
    return (
      <div key={label} className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3 capitalize">{label} ({items.length})</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(trip => (
            <div key={trip.id} className="relative group">
              <Link to={`/trips/${trip.id}`}>
                <Card hover className="overflow-hidden h-full">
                  <div className="h-32 -mx-4 -mt-4 mb-4 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
                    {trip.coverPhotoUrl && <img src={trip.coverPhotoUrl} alt="" className="w-full h-full object-cover" />}
                    <div className="absolute top-2 right-2"><Badge variant={trip.status}>{trip.status}</Badge></div>
                  </div>
                  <h3 className="font-semibold text-white mb-1 truncate">{trip.title}</h3>
                  <p className="text-sm text-muted mb-2">
                    {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {trip.stops?.slice(0, 2).map(stop => (
                        <span key={stop.id} className="text-xs text-muted flex items-center gap-0.5">
                          <MapPin size={10} /> {stop.city?.name}
                        </span>
                      ))}
                      {trip.stops?.length > 2 && <span className="text-xs text-muted">+{trip.stops.length - 2}</span>}
                    </div>
                    {trip.totalBudget > 0 && (
                      <span className="text-xs text-secondary font-medium">${Number(trip.totalBudget).toLocaleString()}</span>
                    )}
                  </div>
                  {/* Budget progress */}
                  {trip.totalBudget > 0 && (
                    <div className="mt-3">
                      <div className="h-1 bg-dark rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '30%' }} />
                      </div>
                    </div>
                  )}
                </Card>
              </Link>
              {/* Action menu */}
              <div className="absolute top-2 left-2 z-10">
                <button onClick={(e) => { e.preventDefault(); setOpenMenu(openMenu === trip.id ? null : trip.id) }}
                  className="p-1 bg-black/40 hover:bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={16} />
                </button>
                {openMenu === trip.id && (
                  <div className="absolute top-8 left-0 w-40 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-20">
                    <button onClick={() => handleDuplicate(trip.id)} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-dark flex items-center gap-2"><Copy size={14} /> Duplicate</button>
                    <button onClick={() => handleShare(trip.id)} className="w-full px-4 py-2 text-left text-sm text-white hover:bg-dark flex items-center gap-2"><Share2 size={14} /> Share</button>
                    <button onClick={() => handleDelete(trip.id)} className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-dark flex items-center gap-2"><Trash2 size={14} /> Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">My Trips</h1>
        <Link to="/trips/new">
          <Button className="gap-2"><Plus size={18} /> New Trip</Button>
        </Link>
      </div>

      {/* Filters + Sort */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs capitalize transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {['date', 'name', 'budget'].map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-full text-xs capitalize transition-colors ${sortBy === s ? 'bg-secondary text-dark' : 'bg-surface text-muted hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <TripCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">🧳</div>
          <p className="text-muted mb-4">No trips found</p>
          <Link to="/trips/new"><Button>Create your first trip</Button></Link>
        </Card>
      ) : (
        <>
          {renderGroup('ongoing', grouped.ongoing)}
          {renderGroup('upcoming', grouped.upcoming)}
          {renderGroup('completed', grouped.past)}
          {renderGroup('drafts & other', grouped.other)}
        </>
      )}
    </div>
  )
}

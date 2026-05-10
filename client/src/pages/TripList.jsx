import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter } from 'lucide-react'
import { Card, CardTitle } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Input } from '../components/common/Input'
import { TripCardSkeleton } from '../components/common/Skeleton'
import { tripsApi } from '../api/trips'
import { format } from 'date-fns'

export default function TripList() {
  const [trips, setTrips] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await tripsApi.getAll()
        setTrips(data)
      } catch (error) {
        console.error('Failed to fetch trips', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTrips()
  }, [])

  const today = new Date()

  const categorizeTrips = (trips) => {
    return {
      ongoing: trips.filter(t => new Date(t.startDate) <= today && new Date(t.endDate) >= today),
      upcoming: trips.filter(t => new Date(t.startDate) > today),
      completed: trips.filter(t => new Date(t.endDate) < today),
    }
  }

  const filteredTrips = trips.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  const { ongoing, upcoming, completed } = categorizeTrips(filteredTrips)

  const renderTripSection = (title, tripList, emptyMessage) => {
    if (filter !== 'all' && filter !== title.toLowerCase()) return null

    return (
      <section className="mb-8">
        <CardTitle className="mb-4">{title} ({tripList.length})</CardTitle>
        {tripList.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-muted">{emptyMessage}</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tripList.map((trip) => (
              <Link key={trip.id} to={`/trips/${trip.id}`}>
                <Card hover className="h-full">
                  <div className="h-28 -mx-4 -mt-4 mb-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-t-xl overflow-hidden">
                    {trip.coverPhotoUrl && (
                      <img src={trip.coverPhotoUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <h3 className="font-semibold text-white mb-1 truncate">{trip.title}</h3>
                  <p className="text-sm text-muted mb-2">
                    {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={trip.status}>{trip.status}</Badge>
                    {trip.stops?.map(stop => (
                      <Badge key={stop.id} variant="default">{stop.city?.name}</Badge>
                    ))}
                  </div>
                  {trip.totalBudget > 0 && (
                    <p className="text-sm text-muted mt-2">
                      Budget: ${Number(trip.totalBudget).toLocaleString()}
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-white">My Trips</h1>
        <Link to="/trips/new">
          <Button className="gap-2">
            <Plus size={18} />
            New Trip
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search trips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'ongoing', 'upcoming', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm capitalize transition-colors ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-surface text-muted hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <TripCardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {renderTripSection('Ongoing', ongoing, 'No ongoing trips')}
          {renderTripSection('Upcoming', upcoming, 'No upcoming trips')}
          {renderTripSection('Completed', completed, 'No completed trips')}
        </>
      )}
    </div>
  )
}

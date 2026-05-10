import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight } from 'lucide-react'
import { Card, CardTitle } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { TripCardSkeleton } from '../components/common/Skeleton'
import { useAuthStore } from '../store/authStore'
import { tripsApi } from '../api/trips'
import { citiesApi } from '../api/cities'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [trips, setTrips] = useState([])
  const [cities, setCities] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, citiesRes] = await Promise.all([
          tripsApi.getAll({ limit: 5 }),
          citiesApi.getPopular(8)
        ])
        setTrips(tripsRes.data)
        setCities(citiesRes.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-primary-light">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex flex-col justify-center px-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-white/80 text-lg">Ready for your next adventure?</p>
          <Link to="/trips/new" className="mt-4">
            <Button className="gap-2">
              <Plus size={18} />
              Plan a Trip
            </Button>
          </Link>
        </div>
      </div>

      {/* Popular Destinations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Popular Destinations</CardTitle>
          <Link to="/explore" className="text-primary text-sm flex items-center gap-1 hover:underline">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
          {cities.map((city) => (
            <Link
              key={city.id}
              to={`/explore?city=${city.id}`}
              className="flex-shrink-0 w-40 group"
            >
              <div className="relative h-32 rounded-xl overflow-hidden mb-2">
                <img
                  src={city.imageUrl || `https://source.unsplash.com/300x200/?${city.name}`}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2">
                  <p className="text-white font-semibold">{city.name}</p>
                  <p className="text-white/70 text-xs">{city.country}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Trips */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Your Trips</CardTitle>
          <Link to="/trips" className="text-primary text-sm flex items-center gap-1 hover:underline">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <TripCardSkeleton key={i} />)}
          </div>
        ) : trips.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-muted mb-4">No trips yet. Start your first adventure!</p>
            <Link to="/trips/new">
              <Button>Create Trip</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <Link key={trip.id} to={`/trips/${trip.id}`}>
                <Card hover className="overflow-hidden">
                  <div className="h-32 -mx-4 -mt-4 mb-4 bg-gradient-to-r from-primary/20 to-secondary/20">
                    {trip.coverPhotoUrl && (
                      <img
                        src={trip.coverPhotoUrl}
                        alt={trip.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <h3 className="font-semibold text-white mb-1">{trip.title}</h3>
                  <p className="text-sm text-muted mb-2">
                    {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant={trip.status}>{trip.status}</Badge>
                    {trip.stops?.length > 0 && (
                      <span className="text-xs text-muted">
                        {trip.stops.length} stop{trip.stops.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FAB */}
      <Link
        to="/trips/new"
        className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 w-14 h-14 bg-primary hover:bg-primary-light rounded-full shadow-lg flex items-center justify-center text-white transition-colors z-30"
      >
        <Plus size={24} />
      </Link>
    </div>
  )
}

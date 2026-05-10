import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, ChevronLeft, Cloud, Droplets, Wind, MapPin, Plane, Globe } from 'lucide-react'
import { Card, CardTitle } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { TripCardSkeleton } from '../components/common/Skeleton'
import { useAuthStore } from '../store/authStore'
import { tripsApi } from '../api/trips'
import { citiesApi } from '../api/cities'
import { weatherApi } from '../api/weather'
import { format } from 'date-fns'

const heroSlides = [
  { image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200', title: 'Discover Paradise', subtitle: 'Plan your dream beach getaway', gradient: 'from-cyan-600/80 to-blue-900/80' },
  { image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200', title: 'Ancient Wonders', subtitle: 'Explore history and culture', gradient: 'from-amber-700/80 to-red-900/80' },
  { image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200', title: 'City Adventures', subtitle: 'Experience the world\'s best cities', gradient: 'from-violet-700/80 to-indigo-900/80' },
  { image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200', title: 'Mountain Escapes', subtitle: 'Find peace in the peaks', gradient: 'from-emerald-700/80 to-teal-900/80' },
]

const regions = [
  { name: 'Asia', emoji: '🌏' },
  { name: 'Europe', emoji: '🏰' },
  { name: 'North America', emoji: '🗽' },
  { name: 'South America', emoji: '🌴' },
  { name: 'Africa', emoji: '🦁' },
  { name: 'Oceania', emoji: '🏝️' },
  { name: 'Middle East', emoji: '🕌' },
]

export default function Dashboard() {
  const { user } = useAuthStore()
  const [trips, setTrips] = useState([])
  const [cities, setCities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [heroIndex, setHeroIndex] = useState(0)
  const [weather, setWeather] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [sortBy, setSortBy] = useState('date')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, citiesRes] = await Promise.all([
          tripsApi.getAll({ limit: 6 }),
          citiesApi.getPopular(12)
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

  // Weather widget
  useEffect(() => {
    const cityName = user?.city || 'New York'
    weatherApi.getWeather(cityName)
      .then(res => setWeather(res.data))
      .catch(() => {})
  }, [user])

  // Auto-rotate hero carousel
  useEffect(() => {
    const timer = setInterval(() => setHeroIndex(i => (i + 1) % heroSlides.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const filteredCities = selectedRegion
    ? cities.filter(c => c.region === selectedRegion)
    : cities

  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === 'budget') return Number(b.totalBudget) - Number(a.totalBudget)
    if (sortBy === 'name') return a.title.localeCompare(b.title)
    return new Date(b.startDate) - new Date(a.startDate)
  })

  const slide = heroSlides[heroIndex]

  return (
    <div className="space-y-8">
      {/* Hero Carousel */}
      <div className="relative h-72 md:h-80 rounded-2xl overflow-hidden group">
        {heroSlides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={s.image} alt="" className="w-full h-full object-cover" loading="lazy" />
            <div className={`absolute inset-0 bg-gradient-to-r ${s.gradient}`} />
          </div>
        ))}
        <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
          <p className="text-white/70 text-sm font-medium tracking-wider uppercase mb-2 animate-fade-in">
            ✈️ Traveloop
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-2 transition-all">
            {slide.title}
          </h1>
          <p className="text-white/80 text-lg mb-6">{slide.subtitle}</p>
          <Link to="/trips/new">
            <Button className="gap-2 shadow-lg">
              <Plus size={18} /> Plan a Trip
            </Button>
          </Link>
        </div>
        {/* Carousel controls */}
        <button onClick={() => setHeroIndex(i => (i - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => setHeroIndex(i => (i + 1) % heroSlides.length)} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={20} />
        </button>
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setHeroIndex(i)} className={`h-2 rounded-full transition-all duration-300 ${i === heroIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} />
          ))}
        </div>
      </div>

      {/* Quick Stats + Weather */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl mb-1">🗺️</div>
          <p className="text-2xl font-bold text-white">{trips.length}</p>
          <p className="text-xs text-muted">Total Trips</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-1">✈️</div>
          <p className="text-2xl font-bold text-white">
            {trips.filter(t => new Date(t.startDate) > new Date()).length}
          </p>
          <p className="text-xs text-muted">Upcoming</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-1">🌍</div>
          <p className="text-2xl font-bold text-white">
            {[...new Set(trips.flatMap(t => t.stops?.map(s => s.city?.country) || []))].length}
          </p>
          <p className="text-xs text-muted">Countries</p>
        </Card>
        {/* Weather Widget */}
        <Card className="text-center">
          {weather ? (
            <>
              <div className="text-3xl mb-1">{weather.temp > 25 ? '☀️' : weather.temp > 15 ? '⛅' : '🌧️'}</div>
              <p className="text-2xl font-bold text-white">{weather.temp}°C</p>
              <p className="text-xs text-muted truncate">{weather.city || user?.city || 'Weather'}</p>
            </>
          ) : (
            <>
              <div className="text-3xl mb-1">🌤️</div>
              <p className="text-2xl font-bold text-white">--</p>
              <p className="text-xs text-muted">Weather</p>
            </>
          )}
        </Card>
      </div>

      {/* Top Regional Selections */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2">
            <Globe size={20} className="text-primary" /> Explore by Region
          </CardTitle>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
          <button
            onClick={() => setSelectedRegion(null)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${!selectedRegion ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-surface text-muted hover:text-white'}`}
          >
            🌐 All
          </button>
          {regions.map(r => (
            <button
              key={r.name}
              onClick={() => setSelectedRegion(r.name)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${selectedRegion === r.name ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-surface text-muted hover:text-white'}`}
            >
              {r.emoji} {r.name}
            </button>
          ))}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
          {filteredCities.map(city => (
            <Link key={city.id} to={`/explore?city=${city.id}`} className="flex-shrink-0 w-44 group">
              <div className="relative h-36 rounded-xl overflow-hidden mb-2">
                <img
                  src={city.imageUrl || `https://images.unsplash.com/400x300/?${city.name}`}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 right-3">
                  <p className="text-white font-semibold text-sm">{city.name}</p>
                  <p className="text-white/60 text-xs">{city.country}</p>
                </div>
                {city.costIndex && (
                  <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    <span className="text-xs text-white">{'$'.repeat(Math.round(Number(city.costIndex)))}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
          {filteredCities.length === 0 && (
            <p className="text-muted text-sm py-8">No cities in this region yet</p>
          )}
        </div>
      </section>

      {/* Your Trips */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Your Trips</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {['date', 'name', 'budget'].map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1 rounded-full text-xs capitalize transition-colors ${sortBy === s ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-white'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <Link to="/trips" className="text-primary text-sm flex items-center gap-1 hover:underline">
              View all <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <TripCardSkeleton key={i} />)}
          </div>
        ) : sortedTrips.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-5xl mb-4">🧳</div>
            <p className="text-muted mb-4">No trips yet. Start your first adventure!</p>
            <Link to="/trips/new">
              <Button>Create Trip</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTrips.map(trip => (
              <Link key={trip.id} to={`/trips/${trip.id}`}>
                <Card hover className="overflow-hidden h-full">
                  <div className="h-32 -mx-4 -mt-4 mb-4 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
                    {trip.coverPhotoUrl && (
                      <img src={trip.coverPhotoUrl} alt={trip.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={trip.status}>{trip.status}</Badge>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-1 truncate">{trip.title}</h3>
                  <p className="text-sm text-muted mb-2">
                    {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {trip.stops?.slice(0, 2).map(stop => (
                        <span key={stop.id} className="text-xs text-muted flex items-center gap-1">
                          <MapPin size={10} /> {stop.city?.name}
                        </span>
                      ))}
                      {trip.stops?.length > 2 && (
                        <span className="text-xs text-muted">+{trip.stops.length - 2}</span>
                      )}
                    </div>
                    {trip.totalBudget > 0 && (
                      <span className="text-xs text-secondary font-medium">
                        ${Number(trip.totalBudget).toLocaleString()}
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
        className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 w-14 h-14 bg-primary hover:bg-primary-light rounded-full shadow-lg shadow-primary/25 flex items-center justify-center text-white transition-all hover:scale-110 z-30"
      >
        <Plus size={24} />
      </Link>
    </div>
  )
}

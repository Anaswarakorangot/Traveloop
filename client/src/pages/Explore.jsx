import { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, MapPin, Star, Heart, X, TrendingUp, Filter, DollarSign } from 'lucide-react'
import { Card, CardTitle } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { CardSkeleton } from '../components/common/Skeleton'
import { toast } from '../components/common/Toast'
import { searchApi } from '../api/search'
import { citiesApi } from '../api/cities'
import { activitiesApi } from '../api/activities'
import { tripsApi } from '../api/trips'
import { useAuthStore } from '../store/authStore'
import { usersApi } from '../api/users'

export default function Explore() {
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState({ cities: [], activities: [], trips: [] })
  const [trending, setTrending] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [cities, setCities] = useState([])
  const [activeType, setActiveType] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 500])
  const [savedIds, setSavedIds] = useState(new Set())
  const timerRef = useRef(null)

  useEffect(() => {
    citiesApi.getPopular(12).then(r => setCities(r.data)).catch(() => {})
    searchApi.trending().then(r => setTrending(r.data)).catch(() => {})
    if (user?.id) {
      usersApi.getSavedDestinations(user.id).then(r => {
        setSavedIds(new Set(r.data.map(c => c.id)))
      }).catch(() => {})
    }
  }, [user?.id])

  // Debounced search
  useEffect(() => {
    if (activeType === 'all' && query.length < 2) {
      setResults({ cities: [], activities: [], trips: [] })
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        if (query.length >= 2) {
          const params = { q: query, limit: 20 }
          if (activeType !== 'all') params.type = activeType
          const { data } = await searchApi.search(params)
          setResults(data)
        } else {
          // No query, but a specific type is selected
          if (activeType === 'city') {
            const { data } = await citiesApi.getAll({ limit: 20 })
            setResults({ cities: data, activities: [], trips: [] })
          } else if (activeType === 'activity') {
            const { data } = await activitiesApi.getAll({ limit: 20 })
            setResults({ cities: [], activities: data, trips: [] })
          } else if (activeType === 'trip') {
            const { data } = await tripsApi.getAll({ limit: 20 })
            setResults({ cities: [], activities: [], trips: data })
          }
        }
      } catch { console.error('Search failed') }
      finally { setIsLoading(false) }
    }, 300)
  }, [query, activeType])

  const toggleSave = async (cityId) => {
    if (!user) return
    try {
      if (savedIds.has(cityId)) {
        await usersApi.unsaveDestination(user.id, cityId)
        setSavedIds(prev => { const next = new Set(prev); next.delete(cityId); return next })
        toast.success('Removed from saved')
      } else {
        await usersApi.saveDestination(user.id, cityId)
        setSavedIds(prev => new Set(prev).add(cityId))
        toast.success('Saved destination!')
      }
    } catch { toast.error('Failed to update') }
  }

  const hasResults = results.cities.length > 0 || results.activities.length > 0 || results.trips.length > 0

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-white">Explore</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cities, activities, or trips..."
          className="w-full pl-12 pr-10 py-3 bg-surface border border-border rounded-xl text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary text-lg" />
        {query && <button onClick={() => { setQuery(''); setResults({ cities: [], activities: [], trips: [] }) }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white"><X size={18} /></button>}
      </div>

      {/* Type filters */}
      <div className="flex gap-2">
        {['all', 'city', 'activity', 'trip'].map(type => (
          <button key={type} onClick={() => setActiveType(type)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize transition-colors ${activeType === type ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-white'}`}>
            {type === 'all' ? '🔍 All' : type === 'city' ? '🏙️ Cities' : type === 'activity' ? '🎯 Activities' : '✈️ Trips'}
          </button>
        ))}
      </div>

      {/* Trending */}
      {!query && trending.length > 0 && (
        <div>
          <p className="text-sm text-muted mb-2 flex items-center gap-1"><TrendingUp size={14} /> Trending searches</p>
          <div className="flex flex-wrap gap-2">
            {trending.map(t => (
              <button key={t.query} onClick={() => setQuery(t.query)}
                className="px-3 py-1.5 bg-surface border border-border rounded-full text-sm text-muted hover:text-white hover:border-primary transition-colors">
                {t.query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (query || activeType !== 'all') && hasResults ? (
        <div className="space-y-6">
          {results.cities.length > 0 && (
            <div>
              <CardTitle className="mb-3">Cities</CardTitle>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.cities.map(city => (
                  <Card key={city.id} hover className="overflow-hidden group relative">
                    <div className="h-32 -mx-4 -mt-4 mb-3 relative">
                      <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-3">
                        <p className="text-white font-semibold">{city.name}</p>
                        <p className="text-white/70 text-xs">{city.country}</p>
                      </div>
                    </div>
                    <Link to={`/trips/new?cityId=${city.id}`} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-10">
                      <div className="px-4 py-2 bg-primary text-white rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                        Plan a Trip
                      </div>
                    </Link>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(city.id); }} className="absolute top-2 right-2 p-1.5 bg-black/30 rounded-full hover:bg-black/50 transition-colors z-20">
                      <Heart size={16} className={savedIds.has(city.id) ? 'text-danger fill-danger' : 'text-white'} />
                    </button>
                    {city.description && <p className="text-sm text-muted line-clamp-2">{city.description}</p>}
                  </Card>
                ))}
              </div>
            </div>
          )}
          {results.activities.length > 0 && (
            <div>
              <CardTitle className="mb-3">Activities</CardTitle>
              <div className="grid md:grid-cols-2 gap-4">
                {results.activities.map(activity => (
                  <Card key={activity.id} hover className="flex gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{activity.name}</h3>
                      <p className="text-xs text-muted">{activity.city?.name}, {activity.city?.country}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="default" className="capitalize text-xs">{activity.category}</Badge>
                        {activity.rating > 0 && <span className="text-xs text-amber-400 flex items-center gap-0.5"><Star size={12} fill="currentColor" /> {Number(activity.rating).toFixed(1)}</span>}
                        {activity.costMin && <span className="text-xs text-muted">${Number(activity.costMin)}-${Number(activity.costMax)}</span>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {results.trips.length > 0 && (
            <div>
              <CardTitle className="mb-3">Trips</CardTitle>
              <div className="grid md:grid-cols-2 gap-4">
                {results.trips.map(trip => (
                  <Link key={trip.id} to={`/trips/${trip.id}`}>
                    <Card hover>
                      <h3 className="font-semibold text-white">{trip.title}</h3>
                      <p className="text-sm text-muted mt-1">{trip.description?.slice(0, 100)}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                        <span>by {trip.user?.firstName}</span>
                        {trip.stops?.map(s => <span key={s.city?.name}><MapPin size={10} className="inline" /> {s.city?.name}</span>)}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (query || activeType !== 'all') && !hasResults ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-muted">No results for "{query}"</p>
        </Card>
      ) : (
        /* Popular Destinations (when not searching) */
        <div>
          <CardTitle className="mb-3">Popular Destinations</CardTitle>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map(city => (
              <Card key={city.id} hover className="overflow-hidden group relative">
                <div className="h-40 -mx-4 -mt-4 mb-3 relative">
                  <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <p className="text-white font-bold text-lg">{city.name}</p>
                    <p className="text-white/70 text-sm">{city.country}</p>
                  </div>
                  <Link to={`/trips/new?cityId=${city.id}`} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-10">
                    <div className="px-5 py-2.5 bg-primary text-white rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl">
                      Plan a Trip
                    </div>
                  </Link>
                </div>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(city.id); }} className="absolute top-3 right-3 p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors z-20">
                  <Heart size={18} className={savedIds.has(city.id) ? 'text-danger fill-danger' : 'text-white'} />
                </button>
                {city.description && <p className="text-sm text-muted line-clamp-2">{city.description}</p>}
                {city.costIndex && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="default">{'$'.repeat(Math.round(Number(city.costIndex)))}</Badge>
                    {city.region && <span className="text-xs text-muted">{city.region}</span>}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

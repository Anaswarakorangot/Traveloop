import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, MapPin, Clock, Star, DollarSign } from 'lucide-react'
import { Card, CardTitle } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { CardSkeleton } from '../components/common/Skeleton'
import { searchApi } from '../api/search'
import { citiesApi } from '../api/cities'
import { activitiesApi } from '../api/activities'

const categories = [
  'all', 'sightseeing', 'food', 'adventure', 'culture', 'nightlife', 'shopping', 'wellness'
]

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState('all')
  const [results, setResults] = useState({ cities: [], activities: [] })
  const [popularCities, setPopularCities] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    citiesApi.getPopular(12).then(res => setPopularCities(res.data))
  }, [])

  useEffect(() => {
    if (query.length >= 2) {
      setIsLoading(true)
      searchApi.search({
        q: query,
        category: category !== 'all' ? category : undefined,
        limit: 20
      })
        .then(res => setResults(res.data))
        .finally(() => setIsLoading(false))
    } else {
      setResults({ cities: [], activities: [] })
    }
  }, [query, category])

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-white">Explore</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input
          type="text"
          placeholder="Search activities, cities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm capitalize whitespace-nowrap transition-colors ${
              category === cat
                ? 'bg-primary text-white'
                : 'bg-surface text-muted hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : query.length >= 2 ? (
        <div className="space-y-6">
          {/* Cities */}
          {results.cities?.length > 0 && (
            <section>
              <CardTitle className="mb-4">Cities</CardTitle>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.cities.map(city => (
                  <Card key={city.id} hover>
                    <div className="h-32 -mx-4 -mt-4 mb-4 rounded-t-xl overflow-hidden">
                      <img
                        src={city.imageUrl || `https://source.unsplash.com/400x300/?${city.name}`}
                        alt={city.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-white">{city.name}</h3>
                    <p className="text-sm text-muted">{city.country}</p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Activities */}
          {results.activities?.length > 0 && (
            <section>
              <CardTitle className="mb-4">Activities</CardTitle>
              <div className="grid md:grid-cols-2 gap-4">
                {results.activities.map(activity => (
                  <Card key={activity.id} hover>
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={activity.imageUrl || `https://source.unsplash.com/200x200/?${activity.category}`}
                          alt={activity.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{activity.name}</h3>
                        <p className="text-sm text-muted">{activity.city?.name}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="primary">{activity.category}</Badge>
                          {activity.rating > 0 && (
                            <span className="text-xs text-secondary flex items-center gap-1">
                              <Star size={12} /> {activity.rating}
                            </span>
                          )}
                          {activity.costMin && (
                            <span className="text-xs text-muted flex items-center gap-1">
                              <DollarSign size={12} /> ${activity.costMin}-${activity.costMax}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {results.cities?.length === 0 && results.activities?.length === 0 && (
            <Card className="text-center py-12">
              <p className="text-muted">No results found for "{query}"</p>
            </Card>
          )}
        </div>
      ) : (
        /* Popular Cities */
        <section>
          <CardTitle className="mb-4">Popular Destinations</CardTitle>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularCities.map(city => (
              <Card key={city.id} hover className="overflow-hidden">
                <div className="h-32 -mx-4 -mt-4 mb-4">
                  <img
                    src={city.imageUrl || `https://source.unsplash.com/400x300/?${city.name}`}
                    alt={city.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-white">{city.name}</h3>
                <p className="text-sm text-muted">{city.country}</p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

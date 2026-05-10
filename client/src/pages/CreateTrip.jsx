import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { toast } from '../components/common/Toast'
import { useTripStore } from '../store/tripStore'
import { citiesApi } from '../api/cities'
import { format, differenceInDays } from 'date-fns'

export default function CreateTrip() {
  const navigate = useNavigate()
  const { createTrip, isLoading } = useTripStore()
  const [suggestions, setSuggestions] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [form, setForm] = useState({
    title: '',
    startDate: '',
    endDate: '',
    selectedCity: null,
    totalBudget: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    citiesApi.getSuggestions(9).then(res => setSuggestions(res.data))
  }, [])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      citiesApi.getAll({ limit: 5 }).then(res => {
        setSearchResults(res.data.filter(c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      })
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const duration = form.startDate && form.endDate
    ? differenceInDays(new Date(form.endDate), new Date(form.startDate)) + 1
    : 0

  const validate = () => {
    const newErrors = {}
    if (!form.title) newErrors.title = 'Trip name required'
    if (!form.selectedCity) newErrors.city = 'Select a destination'
    if (!form.startDate) newErrors.startDate = 'Start date required'
    if (!form.endDate) newErrors.endDate = 'End date required'
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      newErrors.endDate = 'End date must be after start'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      const trip = await createTrip({
        title: form.title,
        startDate: form.startDate,
        endDate: form.endDate,
        totalBudget: parseFloat(form.totalBudget) || 0,
        stops: [{
          cityId: form.selectedCity.id,
          arrivalDate: form.startDate,
          departureDate: form.endDate,
        }]
      })
      toast.success('Trip created!')
      navigate(`/trips/${trip.id}/build`)
    } catch (error) {
      toast.error('Failed to create trip')
    }
  }

  const selectCity = (city) => {
    setForm({ ...form, selectedCity: city })
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-white mb-6">Create New Trip</h1>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Trip Name"
              placeholder="Summer Europe Adventure"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              error={errors.title}
            />

            <div>
              <label className="block text-sm font-medium text-muted mb-1">
                Destination
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cities..."
                  value={form.selectedCity ? form.selectedCity.name : searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setForm({ ...form, selectedCity: null })
                  }}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-xl">
                    {searchResults.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => selectCity(city)}
                        className="w-full px-4 py-2 text-left hover:bg-dark text-white"
                      >
                        {city.name}, {city.country}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.city && <p className="text-sm text-danger mt-1">{errors.city}</p>}
            </div>

            {/* City Suggestions */}
            <div>
              <p className="text-sm text-muted mb-2">Suggestions</p>
              <div className="grid grid-cols-3 gap-3">
                {suggestions.slice(0, 6).map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => selectCity(city)}
                    className={`relative h-20 rounded-lg overflow-hidden ${
                      form.selectedCity?.id === city.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <img
                      src={city.imageUrl || `https://source.unsplash.com/200x150/?${city.name}`}
                      alt={city.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <span className="absolute bottom-1 left-2 text-white text-sm font-medium">
                      {city.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                error={errors.startDate}
              />
              <Input
                label="End Date"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                error={errors.endDate}
              />
            </div>

            {duration > 0 && (
              <p className="text-primary text-sm">
                {duration} day{duration > 1 ? 's' : ''} trip
              </p>
            )}

            <Input
              label="Budget (USD)"
              type="number"
              placeholder="1000"
              value={form.totalBudget}
              onChange={(e) => setForm({ ...form, totalBudget: e.target.value })}
            />

            <Button type="submit" isLoading={isLoading} className="w-full">
              Continue to Build Itinerary
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

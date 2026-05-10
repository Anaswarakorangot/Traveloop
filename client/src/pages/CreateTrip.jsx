import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { toast } from '../components/common/Toast'
import { useTripStore } from '../store/tripStore'
import { citiesApi } from '../api/cities'
import { aiApi } from '../api/ai'
import { Plus, X, GripVertical, Sparkles, Calculator, ChevronUp, ChevronDown } from 'lucide-react'
import { differenceInDays } from 'date-fns'

export default function CreateTrip() {
  const navigate = useNavigate()
  const { createTrip, isLoading } = useTripStore()
  const [suggestions, setSuggestions] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [budgetEstimate, setBudgetEstimate] = useState(null)
  const [aiSuggestions, setAiSuggestions] = useState(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', startDate: '', endDate: '', totalBudget: '',
    stops: [], // { city, arrivalDate, departureDate }
    travelStyle: 'moderate',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => { citiesApi.getSuggestions(9).then(res => setSuggestions(res.data)) }, [])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      citiesApi.getAll({ limit: 8 }).then(res => {
        setSearchResults(res.data.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())))
      })
    } else { setSearchResults([]) }
  }, [searchQuery])

  const duration = form.startDate && form.endDate
    ? differenceInDays(new Date(form.endDate), new Date(form.startDate)) + 1 : 0

  const addCity = (city) => {
    if (form.stops.find(s => s.city.id === city.id)) { toast.error('City already added'); return }
    setForm(f => ({
      ...f,
      stops: [...f.stops, { city, arrivalDate: f.startDate, departureDate: f.endDate }]
    }))
    setSearchQuery('')
    setSearchResults([])
  }

  const removeCity = (idx) => setForm(f => ({ ...f, stops: f.stops.filter((_, i) => i !== idx) }))

  const moveStop = (idx, dir) => {
    const stops = [...form.stops]
    const target = idx + dir
    if (target < 0 || target >= stops.length) return
    ;[stops[idx], stops[target]] = [stops[target], stops[idx]]
    setForm(f => ({ ...f, stops }))
  }

  // Smart Budget Estimator
  const estimateBudget = async () => {
    if (!form.stops.length || !duration) { toast.error('Add cities and dates first'); return }
    setIsEstimating(true)
    try {
      const { data } = await aiApi.estimateBudget({
        cityIds: form.stops.map(s => s.city.id),
        days: duration,
        travelStyle: form.travelStyle
      })
      setBudgetEstimate(data)
      setForm(f => ({ ...f, totalBudget: String(data.totalEstimate) }))
    } catch { toast.error('Estimation failed') }
    finally { setIsEstimating(false) }
  }

  // AI Itinerary Suggestions
  const getAiSuggestions = async () => {
    if (!form.stops.length) { toast.error('Add a city first'); return }
    setIsAiLoading(true)
    try {
      const { data } = await aiApi.suggestItinerary({
        cityId: form.stops[0].city.id,
        days: Math.min(duration || 3, 7),
        budget: parseFloat(form.totalBudget) || undefined,
      })
      setAiSuggestions(data)
    } catch { toast.error('AI suggestions failed') }
    finally { setIsAiLoading(false) }
  }

  const validate = () => {
    const newErrors = {}
    if (!form.title) newErrors.title = 'Trip name required'
    if (form.stops.length === 0) newErrors.city = 'Add at least one destination'
    if (!form.startDate) newErrors.startDate = 'Start date required'
    if (!form.endDate) newErrors.endDate = 'End date required'
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) newErrors.endDate = 'End date must be after start'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      const trip = await createTrip({
        title: form.title, startDate: form.startDate, endDate: form.endDate,
        totalBudget: parseFloat(form.totalBudget) || 0,
        stops: form.stops.map((s, i) => ({
          cityId: s.city.id, arrivalDate: s.arrivalDate || form.startDate,
          departureDate: s.departureDate || form.endDate,
        }))
      })
      toast.success('Trip created!')
      navigate(`/trips/${trip.id}/build`)
    } catch { toast.error('Failed to create trip') }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-white mb-6">Create New Trip</h1>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input label="Trip Name" placeholder="Summer Europe Adventure" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />

            {/* Multi-city selector */}
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Destinations</label>
              {/* Added cities */}
              {form.stops.length > 0 && (
                <div className="space-y-2 mb-3">
                  {form.stops.map((stop, idx) => (
                    <div key={stop.city.id} className="flex items-center gap-2 p-2 bg-dark rounded-lg">
                      <div className="flex flex-col gap-0.5">
                        <button type="button" onClick={() => moveStop(idx, -1)} className="text-muted hover:text-white" disabled={idx === 0}><ChevronUp size={14} /></button>
                        <button type="button" onClick={() => moveStop(idx, 1)} className="text-muted hover:text-white" disabled={idx === form.stops.length - 1}><ChevronDown size={14} /></button>
                      </div>
                      <img src={stop.city.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{stop.city.name}</p>
                        <p className="text-xs text-muted">{stop.city.country}</p>
                      </div>
                      <Badge variant="default">#{idx + 1}</Badge>
                      <button type="button" onClick={() => removeCity(idx)} className="text-muted hover:text-danger"><X size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
              {/* Search */}
              <div className="relative">
                <input type="text" placeholder="Search and add cities..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary" />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {searchResults.map(city => (
                      <button key={city.id} type="button" onClick={() => addCity(city)}
                        className="w-full px-4 py-2 text-left hover:bg-dark text-white flex items-center gap-3">
                        <img src={city.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                        <span>{city.name}, {city.country}</span>
                        {city.costIndex && <span className="text-xs text-muted ml-auto">{'$'.repeat(Math.round(Number(city.costIndex)))}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.city && <p className="text-sm text-danger mt-1">{errors.city}</p>}
            </div>

            {/* Quick suggestions */}
            <div>
              <p className="text-sm text-muted mb-2">Quick picks</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 8).map(city => (
                  <button key={city.id} type="button" onClick={() => addCity(city)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${form.stops.find(s => s.city.id === city.id) ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-white border border-border hover:border-primary'}`}>
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Start Date" type="date" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} error={errors.startDate} />
              <Input label="End Date" type="date" value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} error={errors.endDate} />
            </div>
            {duration > 0 && <p className="text-primary text-sm">📅 {duration} day{duration > 1 ? 's' : ''} trip · {form.stops.length} destination{form.stops.length !== 1 ? 's' : ''}</p>}

            {/* Travel Style */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Travel Style</label>
              <div className="flex gap-2">
                {[{ v: 'budget', l: '🎒 Budget', d: 'Hostels & street food' }, { v: 'moderate', l: '🏨 Moderate', d: 'Hotels & restaurants' }, { v: 'luxury', l: '✨ Luxury', d: 'Premium everything' }].map(s => (
                  <button key={s.v} type="button" onClick={() => setForm(f => ({ ...f, travelStyle: s.v }))}
                    className={`flex-1 p-3 rounded-lg text-left transition-all ${form.travelStyle === s.v ? 'bg-primary/20 border-2 border-primary' : 'bg-surface border-2 border-border hover:border-primary/50'}`}>
                    <p className="text-sm font-medium text-white">{s.l}</p>
                    <p className="text-xs text-muted">{s.d}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget with estimator */}
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input label="Budget (USD)" type="number" placeholder="1000" value={form.totalBudget}
                  onChange={(e) => setForm({ ...form, totalBudget: e.target.value })} />
              </div>
              <Button type="button" variant="secondary" onClick={estimateBudget} isLoading={isEstimating} className="gap-1 mb-0.5">
                <Calculator size={16} /> Estimate
              </Button>
            </div>

            {/* Budget estimate breakdown */}
            {budgetEstimate && (
              <div className="bg-dark rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-white flex items-center gap-2"><Calculator size={14} className="text-primary" /> Budget Estimate</p>
                <p className="text-2xl font-bold text-primary">${budgetEstimate.totalEstimate.toLocaleString()}</p>
                <p className="text-xs text-muted">${budgetEstimate.perDay}/day · {budgetEstimate.travelStyle} style</p>
                {budgetEstimate.byCity?.map(c => (
                  <div key={c.city} className="flex justify-between text-sm">
                    <span className="text-muted">{c.city}</span>
                    <span className="text-white">${c.dailyEstimate}/day</span>
                  </div>
                ))}
              </div>
            )}

            {/* AI Suggestions */}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={getAiSuggestions} isLoading={isAiLoading} className="gap-1">
                <Sparkles size={16} /> AI Suggestions
              </Button>
            </div>
            {aiSuggestions && (
              <div className="bg-dark rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-white flex items-center gap-2"><Sparkles size={14} className="text-secondary" /> AI Itinerary Ideas for {aiSuggestions.city}</p>
                {aiSuggestions.suggestions?.slice(0, 3).map(day => (
                  <div key={day.day} className="pl-3 border-l-2 border-primary/30">
                    <p className="text-sm font-medium text-white">{day.title}</p>
                    <div className="space-y-1 mt-1">
                      {day.activities?.map((a, i) => (
                        <p key={i} className="text-xs text-muted">
                          <span className="text-primary">{a.timeSlot}</span> · {a.name} {a.estimatedCost ? `· $${a.estimatedCost}` : ''}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
                {aiSuggestions.tips?.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted">💡 {aiSuggestions.tips[0]}</p>
                  </div>
                )}
              </div>
            )}

            <Button type="submit" isLoading={isLoading} className="w-full">
              Continue to Build Itinerary
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, GripVertical, Save } from 'lucide-react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { toast } from '../components/common/Toast'
import { useTripStore } from '../store/tripStore'
import { tripsApi } from '../api/trips'
import { activitiesApi } from '../api/activities'
import { format } from 'date-fns'

export default function BuildItinerary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTrip: trip, fetchTrip } = useTripStore()
  const [items, setItems] = useState([])
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      await fetchTrip(id)
      const { data } = await tripsApi.getItinerary(id)
      setItems(data)
      setIsLoading(false)
    }
    load()
  }, [id, fetchTrip])

  useEffect(() => {
    if (trip?.stops?.[0]?.cityId) {
      activitiesApi.getAll({ city_id: trip.stops[0].cityId, limit: 20 })
        .then(res => setActivities(res.data))
    }
  }, [trip])

  const totalBudget = items.reduce((sum, item) => sum + Number(item.cost || 0), 0)

  const addItem = () => {
    if (!trip?.stops?.[0]) {
      toast.error('Add a destination first')
      return
    }
    const newItem = {
      id: `temp-${Date.now()}`,
      stopId: trip.stops[0].id,
      customTitle: '',
      date: trip.startDate,
      cost: 0,
      notes: '',
      isNew: true
    }
    setItems([...items, newItem])
  }

  const updateItem = (index, field, value) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const removeItem = async (index) => {
    const item = items[index]
    if (!item.isNew) {
      try {
        await tripsApi.deleteItineraryItem(id, item.id)
      } catch (error) {
        toast.error('Failed to delete')
        return
      }
    }
    setItems(items.filter((_, i) => i !== index))
    toast.success('Item removed')
  }

  const saveAll = async () => {
    setIsSaving(true)
    try {
      for (const item of items) {
        if (item.isNew) {
          await tripsApi.addItineraryItem(id, {
            stopId: item.stopId,
            customTitle: item.customTitle,
            date: item.date,
            cost: parseFloat(item.cost) || 0,
            notes: item.notes
          })
        } else {
          await tripsApi.updateItineraryItem(id, item.id, {
            customTitle: item.customTitle,
            date: item.date,
            cost: parseFloat(item.cost) || 0,
            notes: item.notes
          })
        }
      }
      toast.success('Itinerary saved!')
      navigate(`/trips/${id}`)
    } catch (error) {
      toast.error('Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-surface rounded w-1/3" />
      <div className="h-32 bg-surface rounded" />
      <div className="h-32 bg-surface rounded" />
    </div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Build Itinerary</h1>
          <p className="text-muted">{trip?.title}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted">Total Budget</p>
          <p className="text-xl font-semibold text-secondary">${totalBudget.toLocaleString()}</p>
        </div>
      </div>

      {/* Budget Warning */}
      {trip?.totalBudget > 0 && totalBudget > Number(trip.totalBudget) && (
        <div className="bg-danger/20 border border-danger rounded-lg p-3 mb-4">
          <p className="text-danger text-sm">
            Over budget by ${(totalBudget - Number(trip.totalBudget)).toLocaleString()}
          </p>
        </div>
      )}

      {/* Itinerary Items */}
      <div className="space-y-4 mb-6">
        {items.map((item, index) => (
          <Card key={item.id}>
            <CardContent className="flex gap-4">
              <div className="text-muted cursor-move">
                <GripVertical size={20} />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex gap-3">
                  <Input
                    placeholder="Activity name"
                    value={item.customTitle || item.activity?.name || ''}
                    onChange={(e) => updateItem(index, 'customTitle', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={item.date ? format(new Date(item.date), 'yyyy-MM-dd') : ''}
                    onChange={(e) => updateItem(index, 'date', e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    placeholder="Cost ($)"
                    value={item.cost || ''}
                    onChange={(e) => updateItem(index, 'cost', e.target.value)}
                    className="w-32"
                  />
                  <Input
                    placeholder="Notes (optional)"
                    value={item.notes || ''}
                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <button
                onClick={() => removeItem(index)}
                className="text-muted hover:text-danger transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Add Activities */}
      {activities.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-muted mb-2">Quick add activities</p>
          <div className="flex flex-wrap gap-2">
            {activities.slice(0, 6).map(activity => (
              <button
                key={activity.id}
                onClick={() => {
                  if (!trip?.stops?.[0]) return
                  setItems([...items, {
                    id: `temp-${Date.now()}`,
                    stopId: trip.stops[0].id,
                    activityId: activity.id,
                    customTitle: activity.name,
                    date: trip.startDate,
                    cost: activity.costMin || 0,
                    isNew: true
                  }])
                }}
                className="px-3 py-1.5 bg-surface border border-border rounded-full text-sm text-muted hover:text-white hover:border-primary transition-colors"
              >
                + {activity.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={addItem} className="gap-2">
          <Plus size={18} /> Add Section
        </Button>
        <Button onClick={saveAll} isLoading={isSaving} className="gap-2 ml-auto">
          <Save size={18} /> Save Itinerary
        </Button>
      </div>
    </div>
  )
}

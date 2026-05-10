import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, GripVertical, Save, Upload, AlertTriangle, Sun, Sunset, Moon } from 'lucide-react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { toast } from '../components/common/Toast'
import { useTripStore } from '../store/tripStore'
import { tripsApi } from '../api/trips'
import { activitiesApi } from '../api/activities'
import { format } from 'date-fns'

const SECTION_TYPES = [
  { value: 'morning', label: 'Morning', icon: Sun, color: 'text-amber-400' },
  { value: 'afternoon', label: 'Afternoon', icon: Sunset, color: 'text-orange-400' },
  { value: 'evening', label: 'Evening', icon: Moon, color: 'text-indigo-400' },
]

export default function BuildItinerary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTrip: trip, fetchTrip } = useTripStore()
  const [items, setItems] = useState([])
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeStopIdx, setActiveStopIdx] = useState(0)
  const [dragIdx, setDragIdx] = useState(null)
  const csvRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      await fetchTrip(id)
      const { data } = await tripsApi.getItinerary(id)
      setItems(data)
      setIsLoading(false)
    }
    load()
  }, [id, fetchTrip])

  // Load activities for active stop
  useEffect(() => {
    const stop = trip?.stops?.[activeStopIdx]
    if (stop?.cityId) {
      activitiesApi.getAll({ city_id: stop.cityId, limit: 20 })
        .then(res => setActivities(res.data)).catch(() => {})
    }
  }, [trip, activeStopIdx])

  const activeStop = trip?.stops?.[activeStopIdx]
  const stopItems = items.filter(item => item.stopId === activeStop?.id)
  const totalBudget = items.reduce((sum, item) => sum + Number(item.cost || 0), 0)

  // Time conflict detection
  const getConflicts = () => {
    const conflicts = new Set()
    for (let i = 0; i < stopItems.length; i++) {
      for (let j = i + 1; j < stopItems.length; j++) {
        const a = stopItems[i], b = stopItems[j]
        if (a.date === b.date && a.startTime && b.startTime && a.endTime && b.endTime) {
          if (a.startTime < b.endTime && b.startTime < a.endTime) {
            conflicts.add(a.id); conflicts.add(b.id)
          }
        }
      }
    }
    return conflicts
  }
  const conflicts = getConflicts()

  const addItem = () => {
    if (!activeStop) { toast.error('Add a destination first'); return }
    setItems([...items, {
      id: `temp-${Date.now()}`, stopId: activeStop.id, customTitle: '',
      date: trip.startDate, cost: 0, notes: '', sectionType: 'morning', isNew: true
    }])
  }

  const updateItem = (index, field, value) => {
    const allIdx = items.indexOf(stopItems[index])
    const updated = [...items]
    updated[allIdx] = { ...updated[allIdx], [field]: value }
    setItems(updated)
  }

  const removeItem = async (index) => {
    const item = stopItems[index]
    if (!item.isNew) {
      try { await tripsApi.deleteItineraryItem(id, item.id) }
      catch { toast.error('Failed to delete'); return }
    }
    setItems(items.filter(i => i.id !== item.id))
    toast.success('Item removed')
  }

  // Drag and drop
  const onDragStart = (idx) => setDragIdx(idx)
  const onDragOver = (e, idx) => { e.preventDefault() }
  const onDrop = (idx) => {
    if (dragIdx === null || dragIdx === idx) return
    const newStopItems = [...stopItems]
    const [moved] = newStopItems.splice(dragIdx, 1)
    newStopItems.splice(idx, 0, moved)
    // Rebuild full items array
    const otherItems = items.filter(i => i.stopId !== activeStop?.id)
    setItems([...otherItems, ...newStopItems])
    setDragIdx(null)
  }

  // CSV Import
  const handleCsvImport = (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeStop) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').filter(l => l.trim())
      const newItems = lines.slice(1).map((line, i) => {
        const [title, date, cost, notes] = line.split(',').map(s => s.trim())
        return {
          id: `csv-${Date.now()}-${i}`, stopId: activeStop.id,
          customTitle: title || 'Imported', date: date || trip.startDate,
          cost: parseFloat(cost) || 0, notes: notes || '', sectionType: 'morning', isNew: true
        }
      })
      setItems(prev => [...prev, ...newItems])
      toast.success(`Imported ${newItems.length} items`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const saveAll = async () => {
    setIsSaving(true)
    try {
      for (const item of items) {
        const payload = {
          stopId: item.stopId, customTitle: item.customTitle, date: item.date,
          cost: parseFloat(item.cost) || 0, notes: item.notes,
          sectionType: item.sectionType, orderIndex: items.indexOf(item)
        }
        if (item.isNew) await tripsApi.addItineraryItem(id, payload)
        else await tripsApi.updateItineraryItem(id, item.id, payload)
      }
      toast.success('Itinerary saved!')
      navigate(`/trips/${id}`)
    } catch { toast.error('Failed to save') }
    finally { setIsSaving(false) }
  }

  if (isLoading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-surface rounded w-1/3" />
      <div className="h-32 bg-surface rounded" />
    </div>
  )

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
        <div className="bg-danger/20 border border-danger rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-danger" />
          <p className="text-danger text-sm">Over budget by ${(totalBudget - Number(trip.totalBudget)).toLocaleString()}</p>
        </div>
      )}

      {/* Multi-stop tabs */}
      {trip?.stops?.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {trip.stops.map((stop, idx) => (
            <button key={stop.id} onClick={() => setActiveStopIdx(idx)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${idx === activeStopIdx ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-white'}`}>
              {stop.city?.name || `Stop ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Time conflict warning */}
      {conflicts.size > 0 && (
        <div className="bg-orange-500/20 border border-orange-500 rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-orange-400" />
          <p className="text-orange-300 text-sm">{conflicts.size} time conflict(s) detected — check overlapping activities</p>
        </div>
      )}

      {/* Itinerary Items */}
      <div className="space-y-3 mb-6">
        {stopItems.map((item, index) => (
          <Card key={item.id} className={conflicts.has(item.id) ? 'ring-2 ring-orange-500/50' : ''}>
            <CardContent className="flex gap-3">
              <div className="text-muted cursor-grab active:cursor-grabbing"
                draggable onDragStart={() => onDragStart(index)}
                onDragOver={(e) => onDragOver(e, index)} onDrop={() => onDrop(index)}>
                <GripVertical size={20} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Input placeholder="Activity name" value={item.customTitle || item.activity?.name || ''}
                    onChange={(e) => updateItem(index, 'customTitle', e.target.value)} className="flex-1" />
                  <Input type="date" value={item.date ? format(new Date(item.date), 'yyyy-MM-dd') : ''}
                    onChange={(e) => updateItem(index, 'date', e.target.value)} className="w-36" />
                </div>
                <div className="flex gap-2">
                  <Input type="number" placeholder="Cost ($)" value={item.cost || ''}
                    onChange={(e) => updateItem(index, 'cost', e.target.value)} className="w-28" />
                  {/* Section type */}
                  <div className="flex gap-1">
                    {SECTION_TYPES.map(s => (
                      <button key={s.value} type="button" onClick={() => updateItem(index, 'sectionType', s.value)}
                        className={`p-1.5 rounded transition-colors ${item.sectionType === s.value ? 'bg-primary/20' : 'hover:bg-dark'}`}
                        title={s.label}>
                        <s.icon size={14} className={item.sectionType === s.value ? s.color : 'text-muted'} />
                      </button>
                    ))}
                  </div>
                  <Input placeholder="Notes" value={item.notes || ''}
                    onChange={(e) => updateItem(index, 'notes', e.target.value)} className="flex-1" />
                </div>
              </div>
              <button onClick={() => removeItem(index)} className="text-muted hover:text-danger transition-colors">
                <Trash2 size={18} />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Add Activities */}
      {activities.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-muted mb-2">Quick add from {activeStop?.city?.name}</p>
          <div className="flex flex-wrap gap-2">
            {activities.slice(0, 8).map(activity => (
              <button key={activity.id} onClick={() => {
                if (!activeStop) return
                setItems([...items, {
                  id: `temp-${Date.now()}`, stopId: activeStop.id, activityId: activity.id,
                  customTitle: activity.name, date: trip.startDate, cost: activity.costMin || 0,
                  sectionType: 'morning', isNew: true
                }])
              }}
                className="px-3 py-1.5 bg-surface border border-border rounded-full text-sm text-muted hover:text-white hover:border-primary transition-colors">
                + {activity.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button variant="secondary" onClick={addItem} className="gap-2"><Plus size={18} /> Add Item</Button>
        <Button variant="ghost" onClick={() => csvRef.current?.click()} className="gap-2">
          <Upload size={16} /> Import CSV
        </Button>
        <input ref={csvRef} type="file" accept=".csv" onChange={handleCsvImport} className="hidden" />
        <Button onClick={saveAll} isLoading={isSaving} className="gap-2 ml-auto"><Save size={18} /> Save Itinerary</Button>
      </div>
    </div>
  )
}

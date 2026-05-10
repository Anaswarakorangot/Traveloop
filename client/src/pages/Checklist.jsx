import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Plus, Trash2, RotateCcw } from 'lucide-react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { toast } from '../components/common/Toast'
import { tripsApi } from '../api/trips'
import { useTripStore } from '../store/tripStore'

const categories = ['documents', 'clothing', 'electronics', 'toiletries', 'medication', 'misc']

const defaultItems = {
  documents: ['Passport', 'Tickets', 'Visa', 'Hotel booking', 'Travel insurance'],
  clothing: ['T-shirts', 'Pants', 'Underwear', 'Socks', 'Jacket'],
  electronics: ['Phone', 'Charger', 'Power bank', 'Adapter'],
  toiletries: ['Toothbrush', 'Shampoo', 'Sunscreen'],
  medication: ['First aid kit', 'Prescription meds'],
  misc: ['Wallet', 'Sunglasses', 'Umbrella']
}

export default function Checklist() {
  const { id } = useParams()
  const { currentTrip, fetchTrip } = useTripStore()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [newItem, setNewItem] = useState({ label: '', category: 'misc' })

  useEffect(() => {
    const load = async () => {
      await fetchTrip(id)
      const { data } = await tripsApi.getChecklist(id)
      setItems(data)
      setIsLoading(false)
    }
    load()
  }, [id, fetchTrip])

  const groupedItems = categories.reduce((acc, cat) => {
    acc[cat] = items.filter(item => item.category === cat)
    return acc
  }, {})

  const progress = items.length > 0
    ? Math.round((items.filter(i => i.isPacked).length / items.length) * 100)
    : 0

  const toggleItem = async (itemId, isPacked) => {
    try {
      await tripsApi.toggleChecklistItem(id, itemId, !isPacked)
      setItems(items.map(i => i.id === itemId ? { ...i, isPacked: !isPacked } : i))
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  const addItem = async () => {
    if (!newItem.label.trim()) return

    try {
      const { data } = await tripsApi.addChecklistItem(id, newItem)
      setItems([...items, data])
      setNewItem({ label: '', category: 'misc' })
      toast.success('Item added')
    } catch (error) {
      toast.error('Failed to add')
    }
  }

  const deleteItem = async (itemId) => {
    try {
      await tripsApi.deleteChecklistItem(id, itemId)
      setItems(items.filter(i => i.id !== itemId))
      toast.success('Item removed')
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const resetChecklist = async () => {
    try {
      await tripsApi.resetChecklist(id)
      setItems(items.map(i => ({ ...i, isPacked: false })))
      toast.success('Checklist reset')
    } catch (error) {
      toast.error('Failed to reset')
    }
  }

  const addDefaultItems = async (category) => {
    const itemsToAdd = defaultItems[category] || []
    for (const label of itemsToAdd) {
      if (!items.find(i => i.label.toLowerCase() === label.toLowerCase())) {
        const { data } = await tripsApi.addChecklistItem(id, { label, category })
        setItems(prev => [...prev, data])
      }
    }
    toast.success(`Added ${category} items`)
  }

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-surface rounded w-1/3" />
      <div className="h-32 bg-surface rounded" />
    </div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Packing Checklist</h1>
          <p className="text-muted">{currentTrip?.title}</p>
        </div>
        <Button variant="ghost" onClick={resetChecklist} className="gap-2">
          <RotateCcw size={16} /> Reset
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted text-sm">Progress</span>
          <span className="text-white font-semibold">{progress}%</span>
        </div>
        <div className="h-3 bg-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted mt-2">
          {items.filter(i => i.isPacked).length} / {items.length} items packed
        </p>
      </Card>

      {/* Add Item */}
      <Card>
        <div className="flex gap-3">
          <Input
            placeholder="Add item..."
            value={newItem.label}
            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
            className="flex-1"
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Button onClick={addItem}>
            <Plus size={18} />
          </Button>
        </div>
      </Card>

      {/* Categories */}
      {categories.map(category => (
        <Card key={category}>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="capitalize">{category}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addDefaultItems(category)}
            >
              + Add defaults
            </Button>
          </div>
          <CardContent>
            {groupedItems[category]?.length === 0 ? (
              <p className="text-muted text-sm">No items</p>
            ) : (
              <div className="space-y-2">
                {groupedItems[category]?.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark group"
                  >
                    <button
                      onClick={() => toggleItem(item.id, item.isPacked)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        item.isPacked
                          ? 'bg-primary border-primary'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {item.isPacked && <Check size={14} className="text-white" />}
                    </button>
                    <span className={`flex-1 ${item.isPacked ? 'line-through text-muted' : 'text-white'}`}>
                      {item.label}
                    </span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

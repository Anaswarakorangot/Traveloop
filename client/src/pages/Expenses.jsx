import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Trash2, Download, DollarSign } from 'lucide-react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { toast } from '../components/common/Toast'
import { tripsApi } from '../api/trips'
import { useTripStore } from '../store/tripStore'
import { format } from 'date-fns'

const expenseCategories = ['hotel', 'flight', 'food', 'activity', 'transport', 'shopping', 'other']

export default function Expenses() {
  const { id } = useParams()
  const { currentTrip, fetchTrip } = useTripStore()
  const [expenses, setExpenses] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({
    category: 'other',
    description: '',
    amount: '',
    date: ''
  })

  useEffect(() => {
    const load = async () => {
      await fetchTrip(id)
      const { data } = await tripsApi.getExpenses(id)
      setExpenses(data.expenses)
      setTotal(data.total)
      setIsLoading(false)
    }
    load()
  }, [id, fetchTrip])

  const budget = Number(currentTrip?.totalBudget) || 0
  const remaining = budget - total
  const percentage = budget > 0 ? Math.min((total / budget) * 100, 100) : 0

  const addExpense = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Enter valid amount')
      return
    }

    try {
      const { data } = await tripsApi.addExpense(id, {
        ...form,
        amount: parseFloat(form.amount)
      })
      setExpenses([data, ...expenses])
      setTotal(total + parseFloat(form.amount))
      setShowNew(false)
      setForm({ category: 'other', description: '', amount: '', date: '' })
      toast.success('Expense added')
    } catch (error) {
      toast.error('Failed to add expense')
    }
  }

  const deleteExpense = async (expId, amount) => {
    try {
      await tripsApi.deleteExpense(id, expId)
      setExpenses(expenses.filter(e => e.id !== expId))
      setTotal(total - Number(amount))
      toast.success('Expense deleted')
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const groupedExpenses = expenseCategories.reduce((acc, cat) => {
    const catExpenses = expenses.filter(e => e.category === cat)
    const catTotal = catExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    acc[cat] = { items: catExpenses, total: catTotal }
    return acc
  }, {})

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-surface rounded w-1/3" />
      <div className="h-32 bg-surface rounded" />
    </div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Expenses</h1>
          <p className="text-muted">{currentTrip?.title}</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-2">
          <Plus size={16} /> Add Expense
        </Button>
      </div>

      {/* Budget Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <p className="text-muted text-sm">Total Budget</p>
          <p className="text-2xl font-bold text-white">${budget.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-muted text-sm">Spent</p>
          <p className="text-2xl font-bold text-secondary">${total.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-muted text-sm">Remaining</p>
          <p className={`text-2xl font-bold ${remaining < 0 ? 'text-danger' : 'text-primary-light'}`}>
            ${remaining.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted text-sm">Budget Usage</span>
          <span className="text-white font-semibold">{percentage.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-dark rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              percentage > 100 ? 'bg-danger' : percentage > 80 ? 'bg-secondary' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </Card>

      {/* Add Expense Form */}
      {showNew && (
        <Card>
          <CardTitle className="mb-4">Add Expense</CardTitle>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary capitalize"
                >
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Amount ($)"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <Input
              label="Description"
              placeholder="What was this for?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <div className="flex gap-3">
              <Button onClick={addExpense}>Add Expense</Button>
              <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses by Category */}
      {expenseCategories.map(category => {
        const { items, total: catTotal } = groupedExpenses[category]
        if (items.length === 0) return null

        return (
          <Card key={category}>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="capitalize">{category}</CardTitle>
              <span className="text-secondary font-semibold">${catTotal.toLocaleString()}</span>
            </div>
            <CardContent>
              <div className="space-y-2">
                {items.map(expense => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-dark rounded-lg group"
                  >
                    <div>
                      <p className="text-white">{expense.description || category}</p>
                      {expense.date && (
                        <p className="text-xs text-muted">
                          {format(new Date(expense.date), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">
                        ${Number(expense.amount).toLocaleString()}
                      </span>
                      <button
                        onClick={() => deleteExpense(expense.id, expense.amount)}
                        className="text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {expenses.length === 0 && !showNew && (
        <Card className="text-center py-12">
          <p className="text-muted mb-4">No expenses recorded yet</p>
          <Button onClick={() => setShowNew(true)}>Add your first expense</Button>
        </Card>
      )}
    </div>
  )
}

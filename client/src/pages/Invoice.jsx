import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Printer, Download, DollarSign } from 'lucide-react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { tripsApi } from '../api/trips'
import { format } from 'date-fns'

const categoryColors = {
  hotel: 'bg-blue-500', flight: 'bg-purple-500', food: 'bg-orange-500',
  activity: 'bg-green-500', transport: 'bg-cyan-500', shopping: 'bg-pink-500', other: 'bg-gray-500'
}

export default function Invoice() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    tripsApi.getExpenseSummary(id)
      .then(res => { setData(res.data); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [id])

  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-surface rounded w-1/3" /><div className="h-64 bg-surface rounded" /></div>
  if (!data) return <Card className="text-center py-12"><p className="text-muted">No expense data available</p></Card>

  const maxCat = Math.max(...data.byCategory.map(c => c.total), 1)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Trip Invoice</h1>
          <p className="text-muted">{data.trip.title}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="secondary" onClick={() => window.print()} className="gap-2">
            <Printer size={16} /> Print
          </Button>
        </div>
      </div>

      {/* Invoice Card */}
      <Card className="print:shadow-none print:border">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">✈️ Traveloop</h2>
            <p className="text-muted text-sm">Trip Expense Report</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted">Date</p>
            <p className="text-white">{format(new Date(), 'MMM d, yyyy')}</p>
          </div>
        </div>

        {/* Trip info */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-dark rounded-lg">
          <div>
            <p className="text-xs text-muted">Trip</p>
            <p className="text-white font-medium">{data.trip.title}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Traveler</p>
            <p className="text-white">{data.user.firstName} {data.user.lastName}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Duration</p>
            <p className="text-white">{format(new Date(data.trip.startDate), 'MMM d')} - {format(new Date(data.trip.endDate), 'MMM d, yyyy')}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Budget</p>
            <p className="text-white">${Number(data.trip.budget).toLocaleString()} {data.trip.currency}</p>
          </div>
        </div>

        {/* Category breakdown bars */}
        <CardTitle className="mb-4">Spending by Category</CardTitle>
        <div className="space-y-3 mb-6">
          {data.byCategory.map(cat => (
            <div key={cat.category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white capitalize">{cat.category}</span>
                <span className="text-muted">${cat.total.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-dark rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${categoryColors[cat.category] || 'bg-gray-500'}`}
                  style={{ width: `${(cat.total / maxCat) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Expense table */}
        <CardTitle className="mb-4">All Expenses</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Category</th>
                <th className="pb-2 pr-4">Description</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.map(exp => (
                <tr key={exp.id} className="border-b border-border/30">
                  <td className="py-2 pr-4 text-muted">{exp.date ? format(new Date(exp.date), 'MMM d') : '-'}</td>
                  <td className="py-2 pr-4"><Badge variant="default" className="capitalize text-xs">{exp.category}</Badge></td>
                  <td className="py-2 pr-4 text-white">{exp.description || '-'}</td>
                  <td className="py-2 text-right text-white font-medium">${Number(exp.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border">
                <td colSpan={3} className="py-3 font-semibold text-white">Total Spent</td>
                <td className="py-3 text-right font-bold text-secondary text-lg">${data.total.toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan={3} className="pb-2 text-muted">Budget Remaining</td>
                <td className={`pb-2 text-right font-semibold ${data.remaining >= 0 ? 'text-green-400' : 'text-danger'}`}>
                  ${data.remaining.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}

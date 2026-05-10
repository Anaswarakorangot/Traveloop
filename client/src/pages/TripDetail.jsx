import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, DollarSign, Edit, Clipboard, FileText, Receipt, Share2, FileDown } from 'lucide-react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Skeleton } from '../components/common/Skeleton'
import { toast } from '../components/common/Toast'
import { useTripStore } from '../store/tripStore'
import { tripsApi } from '../api/trips'
import { format, differenceInDays } from 'date-fns'

export default function TripDetail() {
  const { id } = useParams()
  const { currentTrip: trip, fetchTrip, isLoading } = useTripStore()

  useEffect(() => {
    fetchTrip(id)
  }, [id, fetchTrip])

  if (isLoading || !trip) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-8 w-1/2" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  const duration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1
  const totalExpenses = trip.expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-secondary">
        {trip.coverPhotoUrl && (
          <img src={trip.coverPhotoUrl} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={trip.status}>{trip.status}</Badge>
            {trip.isPublic && <Badge variant="secondary">Public</Badge>}
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">{trip.title}</h1>
          <p className="text-white/80 mt-1">
            {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
            <span className="mx-2">•</span>
            {duration} days
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link to={`/trips/${id}/build`}>
          <Button variant="secondary" className="gap-2">
            <Edit size={16} /> Edit Itinerary
          </Button>
        </Link>
        <Link to={`/trips/${id}/checklist`}>
          <Button variant="ghost" className="gap-2">
            <Clipboard size={16} /> Checklist
          </Button>
        </Link>
        <Link to={`/trips/${id}/notes`}>
          <Button variant="ghost" className="gap-2">
            <FileText size={16} /> Notes
          </Button>
        </Link>
        <Link to={`/trips/${id}/expenses`}>
          <Button variant="ghost" className="gap-2">
            <Receipt size={16} /> Expenses
          </Button>
        </Link>
        <Link to={`/trips/${id}/invoice`}>
          <Button variant="ghost" className="gap-2">
            <FileDown size={16} /> Invoice
          </Button>
        </Link>
        <Button variant="ghost" className="gap-2" onClick={async () => {
          try {
            const { data } = await tripsApi.shareTrip(id)
            const url = `${window.location.origin}/trips/${id}`
            await navigator.clipboard.writeText(url)
            toast.success('Share link copied!')
          } catch { toast.error('Failed to share') }
        }}>
          <Share2 size={16} /> Share
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <MapPin className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-muted text-sm">Destinations</p>
              <p className="text-xl font-semibold text-white">{trip.stops?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/20 rounded-lg">
              <DollarSign className="text-secondary" size={24} />
            </div>
            <div>
              <p className="text-muted text-sm">Budget</p>
              <p className="text-xl font-semibold text-white">
                ${Number(trip.totalBudget).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-danger/20 rounded-lg">
              <Receipt className="text-danger" size={24} />
            </div>
            <div>
              <p className="text-muted text-sm">Spent</p>
              <p className="text-xl font-semibold text-white">
                ${totalExpenses.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Itinerary */}
      <Card>
        <CardTitle className="mb-4">Itinerary</CardTitle>
        <CardContent>
          {trip.stops?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted mb-4">No stops added yet</p>
              <Link to={`/trips/${id}/build`}>
                <Button>Build Itinerary</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {trip.stops?.map((stop, index) => (
                <div key={stop.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                      {index + 1}
                    </div>
                    {index < trip.stops.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h3 className="font-semibold text-white">{stop.city?.name}</h3>
                    <p className="text-sm text-muted">
                      {format(new Date(stop.arrivalDate), 'MMM d')} - {format(new Date(stop.departureDate), 'MMM d')}
                    </p>
                    {stop.itineraryItems?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {stop.itineraryItems.map(item => (
                          <div key={item.id} className="text-sm text-muted flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-light" />
                            {item.customTitle || item.activity?.name}
                            {item.cost > 0 && (
                              <span className="text-secondary">${Number(item.cost)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

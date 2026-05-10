import client from './client'

export const tripsApi = {
  getAll: (params) => client.get('/trips', { params }),
  getById: (id) => client.get(`/trips/${id}`),
  create: (data) => client.post('/trips', data),
  update: (id, data) => client.put(`/trips/${id}`, data),
  delete: (id) => client.delete(`/trips/${id}`),
  clone: (id) => client.post(`/trips/${id}/clone`),

  // Stops
  getStops: (tripId) => client.get(`/trips/${tripId}/stops`),
  addStop: (tripId, data) => client.post(`/trips/${tripId}/stops`, data),
  updateStop: (tripId, stopId, data) => client.put(`/trips/${tripId}/stops/${stopId}`, data),
  deleteStop: (tripId, stopId) => client.delete(`/trips/${tripId}/stops/${stopId}`),
  reorderStops: (tripId, stops) => client.patch(`/trips/${tripId}/stops/reorder`, { stops }),

  // Itinerary
  getItinerary: (tripId) => client.get(`/trips/${tripId}/itinerary`),
  addItineraryItem: (tripId, data) => client.post(`/trips/${tripId}/itinerary-items`, data),
  updateItineraryItem: (tripId, itemId, data) => client.put(`/trips/${tripId}/itinerary-items/${itemId}`, data),
  deleteItineraryItem: (tripId, itemId) => client.delete(`/trips/${tripId}/itinerary-items/${itemId}`),
  reorderItineraryItems: (tripId, items) => client.patch(`/trips/${tripId}/itinerary-items/reorder`, { items }),

  // Budget
  getBudget: (tripId) => client.get(`/trips/${tripId}/budget`),
  getDailyBudget: (tripId) => client.get(`/trips/${tripId}/budget/daily`),
  getExpenseSummary: (tripId) => client.get(`/trips/${tripId}/expense-summary`),

  // Expenses
  getExpenses: (tripId) => client.get(`/trips/${tripId}/expenses`),
  addExpense: (tripId, data) => client.post(`/trips/${tripId}/expenses`, data),
  updateExpense: (tripId, expId, data) => client.put(`/trips/${tripId}/expenses/${expId}`, data),
  deleteExpense: (tripId, expId) => client.delete(`/trips/${tripId}/expenses/${expId}`),

  // Checklist
  getChecklist: (tripId) => client.get(`/trips/${tripId}/checklist`),
  addChecklistItem: (tripId, data) => client.post(`/trips/${tripId}/checklist`, data),
  toggleChecklistItem: (tripId, itemId, isPacked) => client.patch(`/trips/${tripId}/checklist/${itemId}`, { isPacked }),
  deleteChecklistItem: (tripId, itemId) => client.delete(`/trips/${tripId}/checklist/${itemId}`),
  resetChecklist: (tripId) => client.post(`/trips/${tripId}/checklist/reset`),

  // Notes
  getNotes: (tripId, params) => client.get(`/trips/${tripId}/notes`, { params }),
  addNote: (tripId, data) => client.post(`/trips/${tripId}/notes`, data),
  updateNote: (tripId, noteId, data) => client.put(`/trips/${tripId}/notes/${noteId}`, data),
  deleteNote: (tripId, noteId) => client.delete(`/trips/${tripId}/notes/${noteId}`),

  // Sharing & Export
  shareTrip: (tripId) => client.post(`/trips/${tripId}/share`),
  getSharedTrip: (token) => client.get(`/trips/shared/${token}`),
  exportTrip: (tripId) => client.get(`/trips/${tripId}/export`),
}

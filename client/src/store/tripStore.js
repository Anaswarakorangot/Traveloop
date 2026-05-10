import { create } from 'zustand'
import { tripsApi } from '../api/trips'

export const useTripStore = create((set, get) => ({
  trips: [],
  currentTrip: null,
  isLoading: false,
  error: null,

  fetchTrips: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await tripsApi.getAll(params)
      set({ trips: data, isLoading: false })
      return data
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch trips', isLoading: false })
      throw error
    }
  },

  fetchTrip: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await tripsApi.getById(id)
      set({ currentTrip: data, isLoading: false })
      return data
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch trip', isLoading: false })
      throw error
    }
  },

  createTrip: async (tripData) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await tripsApi.create(tripData)
      set((state) => ({ trips: [data, ...state.trips], isLoading: false }))
      return data
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to create trip', isLoading: false })
      throw error
    }
  },

  updateTrip: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await tripsApi.update(id, updates)
      set((state) => ({
        trips: state.trips.map((t) => (t.id === id ? data : t)),
        currentTrip: state.currentTrip?.id === id ? data : state.currentTrip,
        isLoading: false,
      }))
      return data
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update trip', isLoading: false })
      throw error
    }
  },

  deleteTrip: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await tripsApi.delete(id)
      set((state) => ({
        trips: state.trips.filter((t) => t.id !== id),
        currentTrip: state.currentTrip?.id === id ? null : state.currentTrip,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to delete trip', isLoading: false })
      throw error
    }
  },

  clearCurrentTrip: () => set({ currentTrip: null }),
  clearError: () => set({ error: null }),
}))

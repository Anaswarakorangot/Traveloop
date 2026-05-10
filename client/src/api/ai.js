import client from './client'

export const aiApi = {
  suggestItinerary: (params) => client.post('/ai/suggest-itinerary', params),
  estimateBudget: (params) => client.post('/ai/estimate-budget', params),
}

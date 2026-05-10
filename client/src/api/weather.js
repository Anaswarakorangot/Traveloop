import client from './client'

export const weatherApi = {
  getWeather: (cityName) => client.get(`/weather/${encodeURIComponent(cityName)}`),
}

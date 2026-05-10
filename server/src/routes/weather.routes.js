import { Router } from 'express';
import { getCache, setCache } from '../config/redis.js';

const router = Router();
const CACHE_TTL = 300; // 5 minutes in seconds

router.get('/:cityName', async (req, res) => {
  const { cityName } = req.params;
  const key = cityName.toLowerCase();

  // Check cache
  const cached = await getCache(`weather:${key}`);
  if (cached) {
    return res.json(cached);
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || apiKey === 'your_key') {
    // Return mock weather data
    const mockWeather = {
      city: cityName,
      temp: Math.round(15 + Math.random() * 20),
      feelsLike: Math.round(14 + Math.random() * 20),
      humidity: Math.round(40 + Math.random() * 40),
      description: ['Clear sky', 'Partly cloudy', 'Scattered clouds', 'Light rain', 'Sunny'][Math.floor(Math.random() * 5)],
      icon: '01d',
      wind: (2 + Math.random() * 8).toFixed(1),
      mock: true
    };
    return res.json(mockWeather);
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error('Weather API error');
    const data = await response.json();

    const weather = {
      city: data.name,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0]?.description || 'Unknown',
      icon: data.weather[0]?.icon || '01d',
      wind: data.wind.speed,
      mock: false
    };

    await setCache(`weather:${key}`, weather, CACHE_TTL);
    res.json(weather);
  } catch (error) {
    console.error('Weather fetch failed:', error.message);
    res.status(502).json({ error: 'Failed to fetch weather', mock: true, temp: 22, description: 'Unable to load' });
  }
});

export default router;

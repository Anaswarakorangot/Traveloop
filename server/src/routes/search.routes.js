import { Router } from 'express';
import prisma from '../config/db.js';

const router = Router();

// In-memory trending searches
const searchCounts = new Map();
const TRENDING_WINDOW = 60 * 60 * 1000; // 1 hour

function trackSearch(query) {
  const key = query.toLowerCase().trim();
  const now = Date.now();
  if (!searchCounts.has(key)) searchCounts.set(key, []);
  searchCounts.get(key).push(now);
  // Cleanup old entries
  searchCounts.set(key, searchCounts.get(key).filter(t => now - t < TRENDING_WINDOW));
}

// Trending searches
router.get('/trending', (req, res) => {
  const now = Date.now();
  const trending = [];
  for (const [query, timestamps] of searchCounts.entries()) {
    const recent = timestamps.filter(t => now - t < TRENDING_WINDOW);
    if (recent.length > 0) trending.push({ query, count: recent.length });
  }
  trending.sort((a, b) => b.count - a.count);
  res.json(trending.slice(0, 10));
});

// Global search
router.get('/', async (req, res, next) => {
  try {
    const { q, type, category, cost_min, cost_max, limit = 10, offset = 0 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    // Track trending
    trackSearch(q);

    const results = { cities: [], activities: [], trips: [] };

    if (!type || type === 'city') {
      results.cities = await prisma.city.findMany({
        where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { country: { contains: q, mode: 'insensitive' } }] },
        take: parseInt(limit), skip: parseInt(offset)
      });
    }

    if (!type || type === 'activity') {
      const activityWhere = {
        OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }]
      };
      if (category) activityWhere.category = category;
      if (cost_min) activityWhere.costMin = { gte: parseFloat(cost_min) };
      if (cost_max) activityWhere.costMax = { lte: parseFloat(cost_max) };

      results.activities = await prisma.activity.findMany({
        where: activityWhere,
        include: { city: { select: { name: true, country: true } } },
        take: parseInt(limit), skip: parseInt(offset)
      });
    }

    if (!type || type === 'trip') {
      results.trips = await prisma.trip.findMany({
        where: { isPublic: true, OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] },
        include: {
          user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          stops: { include: { city: { select: { name: true } } }, take: 3 }
        },
        take: parseInt(limit), skip: parseInt(offset)
      });
    }

    res.json(results);
  } catch (error) { next(error); }
});

export default router;

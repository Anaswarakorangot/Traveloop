import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { getCache, setCache } from '../config/redis.js';

const router = Router();

// Get all cities
router.get('/', async (req, res, next) => {
  try {
    const { featured, limit = 20, offset = 0, country } = req.query;

    const where = {};
    if (featured === 'true') where.popularity = { gt: 50 };
    if (country) where.country = country;

    const cities = await prisma.city.findMany({
      where,
      orderBy: { popularity: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json(cities);
  } catch (error) {
    next(error);
  }
});

// Get popular cities
router.get('/popular', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const cacheKey = `cities:popular:${limit}`;
    
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const cities = await prisma.city.findMany({
      orderBy: { popularity: 'desc' },
      take: parseInt(limit)
    });

    await setCache(cacheKey, cities, 3600); // cache for 1 hour
    res.json(cities);
  } catch (error) {
    next(error);
  }
});

// Get suggestions for user
router.get('/suggestions', authenticate, async (req, res, next) => {
  try {
    const { limit = 9 } = req.query;

    // Get cities user hasn't visited
    const visitedCities = await prisma.tripStop.findMany({
      where: { trip: { userId: req.user.id } },
      select: { cityId: true },
      distinct: ['cityId']
    });

    const visitedIds = visitedCities.map(v => v.cityId);

    const cities = await prisma.city.findMany({
      where: visitedIds.length ? { id: { notIn: visitedIds } } : {},
      orderBy: { popularity: 'desc' },
      take: parseInt(limit)
    });

    res.json(cities);
  } catch (error) {
    next(error);
  }
});

// Get single city
router.get('/:id', async (req, res, next) => {
  try {
    const city = await prisma.city.findUnique({
      where: { id: req.params.id },
      include: {
        activities: {
          where: { isFeatured: true },
          take: 10
        }
      }
    });

    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    res.json(city);
  } catch (error) {
    next(error);
  }
});

// Get city activities
router.get('/:id/activities', async (req, res, next) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;

    const where = { cityId: req.params.id };
    if (category) where.category = category;

    const activities = await prisma.activity.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json(activities);
  } catch (error) {
    next(error);
  }
});

export default router;

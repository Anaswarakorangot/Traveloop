import { Router } from 'express';
import prisma from '../config/db.js';

const router = Router();

// Global search
router.get('/', async (req, res, next) => {
  try {
    const {
      q,
      type,
      category,
      cost_min,
      cost_max,
      limit = 10,
      offset = 0
    } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const results = { cities: [], activities: [], trips: [] };

    // Search cities
    if (!type || type === 'city') {
      results.cities = await prisma.city.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { country: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: parseInt(limit),
        skip: parseInt(offset)
      });
    }

    // Search activities
    if (!type || type === 'activity') {
      const activityWhere = {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      };

      if (category) activityWhere.category = category;
      if (cost_min) activityWhere.costMin = { gte: parseFloat(cost_min) };
      if (cost_max) activityWhere.costMax = { lte: parseFloat(cost_max) };

      results.activities = await prisma.activity.findMany({
        where: activityWhere,
        include: { city: { select: { name: true, country: true } } },
        take: parseInt(limit),
        skip: parseInt(offset)
      });
    }

    // Search public trips
    if (!type || type === 'trip') {
      results.trips = await prisma.trip.findMany({
        where: {
          isPublic: true,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
          ]
        },
        include: {
          user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          stops: { include: { city: { select: { name: true } } }, take: 3 }
        },
        take: parseInt(limit),
        skip: parseInt(offset)
      });
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
});

export default router;

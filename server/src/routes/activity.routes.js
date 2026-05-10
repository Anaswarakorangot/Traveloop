import { Router } from 'express';
import prisma from '../config/db.js';

const router = Router();

// Get activities with filters
router.get('/', async (req, res, next) => {
  try {
    const {
      city_id,
      category,
      cost_min,
      cost_max,
      rating_min,
      featured,
      limit = 20,
      offset = 0
    } = req.query;

    const where = {};

    if (city_id) where.cityId = city_id;
    if (category) where.category = category;
    if (featured === 'true') where.isFeatured = true;

    if (cost_min || cost_max) {
      where.costMin = {};
      if (cost_min) where.costMin.gte = parseFloat(cost_min);
      if (cost_max) where.costMax = { lte: parseFloat(cost_max) };
    }

    if (rating_min) {
      where.rating = { gte: parseFloat(rating_min) };
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        city: { select: { id: true, name: true, country: true } }
      },
      orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json(activities);
  } catch (error) {
    next(error);
  }
});

// Get single activity
router.get('/:id', async (req, res, next) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: {
        city: { select: { id: true, name: true, country: true, imageUrl: true } }
      }
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    next(error);
  }
});

export default router;

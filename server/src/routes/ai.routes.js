import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// AI Suggest Itinerary (mock – uses city cost_index + activities)
router.post('/suggest-itinerary', authenticate, async (req, res, next) => {
  try {
    const { cityId, days, budget, interests } = req.body;
    if (!cityId || !days) return res.status(400).json({ error: 'cityId and days required' });

    const city = await prisma.city.findUnique({ where: { id: cityId }, include: { activities: { orderBy: { rating: 'desc' }, take: 20 } } });
    if (!city) return res.status(404).json({ error: 'City not found' });

    // Build a smart suggestion based on actual activities
    const suggestions = [];
    const perDay = Math.ceil(city.activities.length / Math.max(days, 1));

    for (let day = 0; day < days; day++) {
      const dayActivities = city.activities.slice(day * 3, day * 3 + 3).map(a => ({
        name: a.name,
        category: a.category,
        estimatedCost: Number(a.costMin) || 30,
        duration: Number(a.durationHrs) || 2,
        description: a.description,
        rating: Number(a.rating),
        timeSlot: ['morning', 'afternoon', 'evening'][city.activities.indexOf(a) % 3]
      }));

      suggestions.push({
        day: day + 1,
        title: `Day ${day + 1} in ${city.name}`,
        activities: dayActivities.length > 0 ? dayActivities : [
          { name: `Explore ${city.name}`, category: 'sightseeing', estimatedCost: 20, duration: 3, timeSlot: 'morning' }
        ]
      });
    }

    const dailyBudget = budget ? Math.round(budget / days) : Math.round(Number(city.costIndex || 3) * 50);

    res.json({
      city: city.name,
      days,
      estimatedDailyBudget: dailyBudget,
      suggestions,
      tips: [
        `${city.name} has a cost index of ${city.costIndex}/5 — ${Number(city.costIndex) > 3.5 ? 'consider booking in advance for better deals' : 'great value destination!'}`,
        `Best time to visit: Check local weather before your trip.`,
        `Don't miss the local ${city.activities[0]?.category || 'sightseeing'} experiences!`
      ]
    });
  } catch (error) { next(error); }
});

// Budget estimator
router.post('/estimate-budget', authenticate, async (req, res, next) => {
  try {
    const { cityIds, days, travelStyle } = req.body;
    if (!cityIds?.length || !days) return res.status(400).json({ error: 'cityIds array and days required' });

    const cities = await prisma.city.findMany({ where: { id: { in: cityIds } } });
    const styleMultiplier = { budget: 0.6, moderate: 1, luxury: 2 }[travelStyle] || 1;

    const estimates = cities.map(city => {
      const ci = Number(city.costIndex) || 3;
      const dailyCost = Math.round(ci * 50 * styleMultiplier);
      return {
        city: city.name,
        country: city.country,
        costIndex: ci,
        dailyEstimate: dailyCost,
        breakdown: {
          accommodation: Math.round(dailyCost * 0.4),
          food: Math.round(dailyCost * 0.25),
          activities: Math.round(dailyCost * 0.2),
          transport: Math.round(dailyCost * 0.15)
        }
      };
    });

    const totalDaily = estimates.reduce((s, e) => s + e.dailyEstimate, 0) / estimates.length;
    res.json({
      totalEstimate: Math.round(totalDaily * days),
      perDay: Math.round(totalDaily),
      days,
      travelStyle: travelStyle || 'moderate',
      byCity: estimates
    });
  } catch (error) { next(error); }
});

export default router;

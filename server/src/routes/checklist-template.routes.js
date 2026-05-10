import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get all templates
router.get('/templates', async (req, res, next) => {
  try {
    const templates = await prisma.checklistTemplate.findMany({
      orderBy: { name: 'asc' }
    });
    // Parse items JSON
    const formatted = templates.map(t => ({
      ...t,
      items: typeof t.items === 'string' ? JSON.parse(t.items) : t.items
    }));
    res.json(formatted);
  } catch (error) { next(error); }
});

// Get single template
router.get('/templates/:id', async (req, res, next) => {
  try {
    const template = await prisma.checklistTemplate.findUnique({ where: { id: req.params.id } });
    if (!template) return res.status(404).json({ error: 'Template not found' });
    template.items = typeof template.items === 'string' ? JSON.parse(template.items) : template.items;
    res.json(template);
  } catch (error) { next(error); }
});

// Apply template to trip
router.post('/templates/:id/apply/:tripId', authenticate, async (req, res, next) => {
  try {
    const template = await prisma.checklistTemplate.findUnique({ where: { id: req.params.id } });
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const trip = await prisma.trip.findUnique({ where: { id: req.params.tripId } });
    if (!trip || trip.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const items = typeof template.items === 'string' ? JSON.parse(template.items) : template.items;

    // Get existing labels to avoid duplicates
    const existing = await prisma.packingItem.findMany({
      where: { tripId: req.params.tripId },
      select: { label: true }
    });
    const existingLabels = new Set(existing.map(e => e.label.toLowerCase()));

    const toCreate = items
      .filter(item => !existingLabels.has(item.label.toLowerCase()))
      .map(item => ({
        tripId: req.params.tripId,
        label: item.label,
        category: item.cat || 'misc'
      }));

    if (toCreate.length > 0) {
      await prisma.packingItem.createMany({ data: toCreate });
    }

    const allItems = await prisma.packingItem.findMany({
      where: { tripId: req.params.tripId },
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }]
    });

    res.json({ added: toCreate.length, items: allItems });
  } catch (error) { next(error); }
});

export default router;

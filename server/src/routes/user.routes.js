import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get user profile
router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        city: true,
        country: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        trips: {
          where: { isPublic: true },
          select: {
            id: true,
            title: true,
            coverPhotoUrl: true,
            startDate: true,
            endDate: true,
            status: true
          },
          take: 6
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { firstName, lastName, phone, city, country, bio, avatarUrl } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { firstName, lastName, phone, city, country, bio, avatarUrl },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        city: true,
        country: true,
        bio: true,
        avatarUrl: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Delete user (soft delete)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({ message: 'Account deactivated' });
  } catch (error) {
    next(error);
  }
});

// Get saved destinations
router.get('/:id/saved-destinations', authenticate, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const saved = await prisma.savedDestination.findMany({
      where: { userId: req.params.id },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            country: true,
            imageUrl: true
          }
        }
      }
    });

    res.json(saved.map(s => s.city));
  } catch (error) {
    next(error);
  }
});

// Save destination
router.post('/:id/saved-destinations/:cityId', authenticate, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.savedDestination.create({
      data: {
        userId: req.params.id,
        cityId: req.params.cityId
      }
    });

    res.status(201).json({ message: 'Destination saved' });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Already saved' });
    }
    next(error);
  }
});

// Remove saved destination
router.delete('/:id/saved-destinations/:cityId', authenticate, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.savedDestination.delete({
      where: {
        userId_cityId: {
          userId: req.params.id,
          cityId: req.params.cityId
        }
      }
    });

    res.json({ message: 'Destination removed' });
  } catch (error) {
    next(error);
  }
});

export default router;

import { Router } from 'express';
import prisma from '../config/db.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Get posts
router.get('/posts', optionalAuth, async (req, res, next) => {
  try {
    const { sort = 'recent', city, limit = 10, offset = 0 } = req.query;

    const where = {};

    if (city) {
      where.trip = { stops: { some: { city: { name: { contains: city, mode: 'insensitive' } } } } };
    }

    const orderBy = sort === 'trending'
      ? { likesCount: 'desc' }
      : { createdAt: 'desc' };

    const posts = await prisma.communityPost.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        trip: {
          select: {
            id: true,
            title: true,
            isPublic: true,
            stops: { include: { city: { select: { name: true } } }, take: 3 }
          }
        },
        _count: { select: { comments: true } },
        likes: req.user ? { where: { userId: req.user.id } } : false
      },
      orderBy,
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const formatted = posts.map(post => ({
      ...post,
      isLiked: req.user ? post.likes?.length > 0 : false,
      likes: undefined
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

// Create post
router.post('/posts', authenticate, async (req, res, next) => {
  try {
    const { content, tripId, imageUrl } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content required' });
    }

    // Check if user has completed trip (optional enforcement)
    const completedTrips = await prisma.trip.count({
      where: { userId: req.user.id, status: 'completed' }
    });

    if (completedTrips === 0) {
      return res.status(403).json({ error: 'Complete a trip before posting' });
    }

    const post = await prisma.communityPost.create({
      data: {
        userId: req.user.id,
        tripId,
        content,
        imageUrl
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        trip: { select: { id: true, title: true } }
      }
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

// Get single post
router.get('/posts/:id', optionalAuth, async (req, res, next) => {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        trip: {
          select: {
            id: true,
            title: true,
            isPublic: true,
            stops: { include: { city: { select: { name: true } } } }
          }
        },
        comments: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        likes: req.user ? { where: { userId: req.user.id } } : false
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      ...post,
      isLiked: req.user ? post.likes?.length > 0 : false,
      likes: undefined
    });
  } catch (error) {
    next(error);
  }
});

// Delete post
router.delete('/posts/:id', authenticate, async (req, res, next) => {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.communityPost.delete({ where: { id: req.params.id } });

    res.json({ message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
});

// Like post
router.post('/posts/:id/like', authenticate, async (req, res, next) => {
  try {
    await prisma.$transaction([
      prisma.postLike.create({
        data: { userId: req.user.id, postId: req.params.id }
      }),
      prisma.communityPost.update({
        where: { id: req.params.id },
        data: { likesCount: { increment: 1 } }
      })
    ]);

    res.json({ message: 'Liked' });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Already liked' });
    }
    next(error);
  }
});

// Unlike post
router.delete('/posts/:id/like', authenticate, async (req, res, next) => {
  try {
    await prisma.$transaction([
      prisma.postLike.delete({
        where: { userId_postId: { userId: req.user.id, postId: req.params.id } }
      }),
      prisma.communityPost.update({
        where: { id: req.params.id },
        data: { likesCount: { decrement: 1 } }
      })
    ]);

    res.json({ message: 'Unliked' });
  } catch (error) {
    next(error);
  }
});

// Get comments
router.get('/posts/:id/comments', async (req, res, next) => {
  try {
    const comments = await prisma.postComment.findMany({
      where: { postId: req.params.id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(comments);
  } catch (error) {
    next(error);
  }
});

// Add comment
router.post('/posts/:id/comments', authenticate, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content required' });
    }

    const comment = await prisma.postComment.create({
      data: {
        postId: req.params.id,
        userId: req.user.id,
        content
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

// Delete comment
router.delete('/posts/:id/comments/:commentId', authenticate, async (req, res, next) => {
  try {
    const comment = await prisma.postComment.findUnique({
      where: { id: req.params.commentId }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.postComment.delete({ where: { id: req.params.commentId } });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;

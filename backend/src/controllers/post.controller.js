import { prisma } from '../app.js';
import { postSchema } from '../utils/validation.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.middleware.js';

/**
 * Get all posts with filters
 * GET /api/posts?type=&status=&author=&page=&limit=
 */
export const getPosts = asyncHandler(async (req, res) => {
  const { type, status, author, page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    isDeleted: false,
    ...(type && { type }),
    ...(status && { status }),
    ...(author && { authorId: author }),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            studentId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.post.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/**
 * Get single post by ID
 * GET /api/posts/:id
 */
export const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          studentId: true,
        },
      },
      interactions: true,
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!post || post.isDeleted) {
    throw new AppError('Post not found', 404);
  }

  // Track view if user is authenticated
  if (req.user) {
    await prisma.interaction.upsert({
      where: {
        userId_postId_type: {
          userId: req.user.id,
          postId: id,
          type: 'view',
        },
      },
      update: {},
      create: {
        userId: req.user.id,
        postId: id,
        type: 'view',
      },
    });

    // Increment view count
    await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  res.status(200).json({
    success: true,
    data: { post },
  });
});

/**
 * Create new post
 * POST /api/posts
 * Requires: creator or admin role
 */
export const createPost = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  if (!['creator', 'admin'].includes(req.user.role)) {
    throw new AppError('Only creators and admins can create posts', 403);
  }

  // Validate request body
  postSchema.parse(req.body);

  const { type, title, description, media_url, thumbnail_url, duration } = req.body;

  const post = await prisma.post.create({
    data: {
      authorId: req.user.id,
      type,
      title,
      description,
      mediaUrl: media_url,
      thumbnailUrl: thumbnail_url,
      duration: duration ? parseInt(duration) : null,
      status: req.user.role === 'admin' ? 'approved' : 'pending',
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          studentId: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: { post },
  });
});

/**
 * Update post
 * PUT /api/posts/:id
 * Requires: owner or admin
 */
export const updatePost = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // Check authorization
  if (post.authorId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only edit your own posts', 403);
  }

  // Don't allow editing rejected or deleted posts
  if (post.status === 'rejected' || post.isDeleted) {
    throw new AppError('Cannot edit this post', 400);
  }

  const { type, title, description, media_url, thumbnail_url, duration } = req.body;

  const updatedPost = await prisma.post.update({
    where: { id },
    data: {
      ...(type && { type }),
      ...(title && { title }),
      ...(description && { description }),
      ...(media_url && { mediaUrl: media_url }),
      ...(thumbnail_url && { thumbnailUrl: thumbnail_url }),
      ...(duration && { duration: parseInt(duration) }),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          studentId: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    data: { post: updatedPost },
  });
});

/**
 * Soft delete post (move to garbage bin)
 * DELETE /api/posts/:id
 * Requires: owner or admin
 */
export const deletePost = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;
  const { reason } = req.body;

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // Check authorization
  if (post.authorId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You can only delete your own posts', 403);
  }

  const deletedPost = await prisma.post.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletionReason: reason || null,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Post moved to garbage bin',
    data: { post: deletedPost },
  });
});

/**
 * Record interaction (view, like, rating)
 * POST /api/posts/:id/interact
 */
export const recordInteraction = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const { id } = req.params;
  const { type, value } = req.body;

  // Validate type
  if (!['view', 'like', 'rating'].includes(type)) {
    throw new AppError('Invalid interaction type', 400);
  }

  // Validate rating value
  if (type === 'rating' && (!value || value < 1 || value > 5)) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post || post.isDeleted) {
    throw new AppError('Post not found', 404);
  }

  // Record interaction
  const interaction = await prisma.interaction.upsert({
    where: {
      userId_postId_type: {
        userId: req.user.id,
        postId: id,
        type,
      },
    },
    update: {
      value: type === 'rating' ? value : null,
    },
    create: {
      userId: req.user.id,
      postId: id,
      type,
      value: type === 'rating' ? value : null,
    },
  });

  // Update post rating if it's a rating interaction
  if (type === 'rating') {
    const ratings = await prisma.interaction.findMany({
      where: {
        postId: id,
        type: 'rating',
      },
    });

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + (r.value || 0), 0) / ratings.length
        : 0;

    await prisma.post.update({
      where: { id },
      data: { rating: averageRating },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Interaction recorded',
    data: { interaction },
  });
});

/**
 * Get post interactions
 * GET /api/posts/:id/interactions
 */
export const getPostInteractions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const where = {
    postId: id,
    ...(type && { type }),
  };

  const interactions = await prisma.interaction.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  const stats = {
    total: interactions.length,
    views: interactions.filter((i) => i.type === 'view').length,
    likes: interactions.filter((i) => i.type === 'like').length,
    ratings: interactions.filter((i) => i.type === 'rating').length,
    averageRating: post.rating,
  };

  res.status(200).json({
    success: true,
    data: {
      interactions,
      stats,
    },
  });
});

import { prisma } from '../app.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.middleware.js';

/**
 * Get deleted posts (garbage bin)
 * GET /api/admin/garbage-bin
 * Requires: admin role
 */
export const getGarbageBin = asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    isDeleted: true,
    ...(type && { type }),
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
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { deletedAt: 'desc' },
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
 * Restore post from garbage bin
 * PUT /api/admin/garbage-bin/:id/restore
 * Requires: admin role
 */
export const restorePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (!post.isDeleted) {
    throw new AppError('Post is not in garbage bin', 400);
  }

  const restoredPost = await prisma.post.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null,
      deletionReason: null,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: 'Post restored successfully',
    data: { post: restoredPost },
  });
});

/**
 * Permanently delete post
 * DELETE /api/admin/garbage-bin/:id/permanent
 * Requires: admin role
 */
export const permanentlyDeletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      interactions: true,
      comments: true,
    },
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // Delete in cascade: interactions and comments will be deleted automatically
  await prisma.post.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Post permanently deleted',
  });
});

/**
 * Get pending posts for moderation
 * GET /api/admin/pending-posts
 * Requires: admin role
 */
export const getPendingPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: 'pending',
        isDeleted: false,
      },
      skip,
      take: parseInt(limit),
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            studentId: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.post.count({
      where: {
        status: 'pending',
        isDeleted: false,
      },
    }),
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
 * Approve post
 * PATCH /api/admin/posts/:id/approve
 * Requires: admin role
 */
export const approvePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.status !== 'pending') {
    throw new AppError(`Cannot approve a post with status: ${post.status}`, 400);
  }

  const approvedPost = await prisma.post.update({
    where: { id },
    data: { status: 'approved' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: 'Post approved successfully',
    data: { post: approvedPost },
  });
});

/**
 * Reject post
 * PATCH /api/admin/posts/:id/reject
 * Requires: admin role
 */
export const rejectPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new AppError('Rejection reason is required', 400);
  }

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.status !== 'pending') {
    throw new AppError(`Cannot reject a post with status: ${post.status}`, 400);
  }

  const rejectedPost = await prisma.post.update({
    where: { id },
    data: {
      status: 'rejected',
      deletionReason: reason,
      isDeleted: true,
      deletedAt: new Date(),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: 'Post rejected successfully',
    data: { post: rejectedPost },
  });
});

/**
 * Get moderation dashboard stats
 * GET /api/admin/dashboard
 * Requires: admin role
 */
export const getModerationDashboard = asyncHandler(async (req, res) => {
  // Total posts
  const totalPosts = await prisma.post.count();

  // Pending posts
  const pendingPosts = await prisma.post.count({
    where: { status: 'pending' },
  });

  // Approved posts
  const approvedPosts = await prisma.post.count({
    where: { status: 'approved' },
  });

  // Rejected posts
  const rejectedPosts = await prisma.post.count({
    where: { status: 'rejected' },
  });

  // Deleted posts
  const deletedPosts = await prisma.post.count({
    where: { isDeleted: true },
  });

  // Total users
  const totalUsers = await prisma.user.count();

  // Users by role
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: {
      id: true,
    },
  });

  // Recent posts
  const recentPosts = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalPosts,
        totalUsers,
        posts: {
          pending: pendingPosts,
          approved: approvedPosts,
          rejected: rejectedPosts,
          deleted: deletedPosts,
        },
        usersByRole: Object.fromEntries(
          usersByRole.map((u) => [u.role, u._count.id])
        ),
      },
      recentPosts,
    },
  });
});

/**
 * Get all users
 * GET /api/admin/users
 * Requires: admin role
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    ...(role && { role }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentId: true,
        avatarUrl: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
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
 * Update user role
 * PUT /api/admin/users/:id/role
 * Requires: admin role
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['viewer', 'creator', 'admin'].includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      studentId: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: { user: updatedUser },
  });
});

/**
 * Get user details with stats
 * GET /api/admin/users/:id
 * Requires: admin role
 */
export const getUserDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      studentId: true,
      avatarUrl: true,
      createdAt: true,
      lastLogin: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get user stats
  const posts = await prisma.post.findMany({
    where: { authorId: id },
    select: {
      id: true,
      status: true,
      views: true,
      rating: true,
      createdAt: true,
      isDeleted: true,
    },
  });

  const postStats = {
    total: posts.length,
    pending: posts.filter((p) => p.status === 'pending').length,
    approved: posts.filter((p) => p.status === 'approved').length,
    rejected: posts.filter((p) => p.status === 'rejected').length,
    totalViews: posts.reduce((sum, p) => sum + p.views, 0),
    averageRating: posts.length > 0
      ? parseFloat(
          (posts.reduce((sum, p) => sum + p.rating, 0) / posts.length).toFixed(2)
        )
      : 0,
  };

  res.status(200).json({
    success: true,
    data: {
      user,
      stats: postStats,
    },
  });
});

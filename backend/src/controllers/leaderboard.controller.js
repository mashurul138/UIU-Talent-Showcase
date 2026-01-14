import { prisma } from '../app.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.middleware.js';

/**
 * Calculate leaderboard score
 * Formula: (total_views * 0.6) + (average_rating * 0.4)
 */
const calculateScore = (views, rating) => {
  return views * 0.6 + rating * 0.4;
};

/**
 * Get global leaderboard
 * GET /api/leaderboard
 */
export const getGlobalLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;

  // Get all approved posts grouped by author with stats
  const creators = await prisma.post.groupBy({
    by: ['authorId'],
    where: {
      status: 'approved',
      isDeleted: false,
    },
    _sum: {
      views: true,
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  // Calculate scores and fetch user details
  const leaderboardData = await Promise.all(
    creators.map(async (creator) => {
      const user = await prisma.user.findUnique({
        where: { id: creator.authorId },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          studentId: true,
        },
      });

      const totalViews = creator._sum.views || 0;
      const avgRating = creator._avg.rating || 0;
      const postCount = creator._count.id || 0;

      const score = calculateScore(totalViews, avgRating);

      return {
        ...user,
        stats: {
          totalPosts: postCount,
          totalViews,
          averageRating: parseFloat(avgRating.toFixed(2)),
          score: parseFloat(score.toFixed(2)),
        },
      };
    })
  );

  // Sort by score descending
  leaderboardData.sort((a, b) => b.stats.score - a.stats.score);

  // Add rank
  const rankedData = leaderboardData.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));

  // Apply limit and offset
  const paginatedData = rankedData.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      leaderboard: paginatedData,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: rankedData.length,
      },
    },
  });
});

/**
 * Get leaderboard by portal type (video/audio/blog)
 * GET /api/leaderboard/:type
 */
export const getPortalLeaderboard = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  // Validate type
  if (!['video', 'audio', 'blog'].includes(type)) {
    throw new AppError('Invalid portal type. Must be video, audio, or blog', 400);
  }

  // Get creators with approved posts of specific type
  const creators = await prisma.post.groupBy({
    by: ['authorId'],
    where: {
      type,
      status: 'approved',
      isDeleted: false,
    },
    _sum: {
      views: true,
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  // Calculate scores and fetch user details
  const leaderboardData = await Promise.all(
    creators.map(async (creator) => {
      const user = await prisma.user.findUnique({
        where: { id: creator.authorId },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          studentId: true,
        },
      });

      const totalViews = creator._sum.views || 0;
      const avgRating = creator._avg.rating || 0;
      const postCount = creator._count.id || 0;

      const score = calculateScore(totalViews, avgRating);

      return {
        ...user,
        stats: {
          totalPosts: postCount,
          totalViews,
          averageRating: parseFloat(avgRating.toFixed(2)),
          score: parseFloat(score.toFixed(2)),
        },
      };
    })
  );

  // Sort by score descending
  leaderboardData.sort((a, b) => b.stats.score - a.stats.score);

  // Add rank
  const rankedData = leaderboardData.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));

  // Apply limit and offset
  const paginatedData = rankedData.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      portal: type,
      leaderboard: paginatedData,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: rankedData.length,
      },
    },
  });
});

/**
 * Get user ranking
 * GET /api/leaderboard/user/:userId
 */
export const getUserRanking = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get user's approved posts stats
  const userPosts = await prisma.post.aggregate({
    where: {
      authorId: userId,
      status: 'approved',
      isDeleted: false,
    },
    _sum: {
      views: true,
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  const totalViews = userPosts._sum.views || 0;
  const avgRating = userPosts._avg.rating || 0;
  const postCount = userPosts._count.id || 0;
  const score = calculateScore(totalViews, avgRating);

  // Get global ranking
  const creators = await prisma.post.groupBy({
    by: ['authorId'],
    where: {
      status: 'approved',
      isDeleted: false,
    },
    _sum: {
      views: true,
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  const allScores = creators.map((creator) => {
    const v = creator._sum.views || 0;
    const r = creator._avg.rating || 0;
    return { authorId: creator.authorId, score: calculateScore(v, r) };
  });

  allScores.sort((a, b) => b.score - a.score);
  const rank = allScores.findIndex((s) => s.authorId === userId) + 1;

  // Get portal rankings
  const portalRankings = {};
  for (const portal of ['video', 'audio', 'blog']) {
    const portalPosts = await prisma.post.aggregate({
      where: {
        authorId: userId,
        type: portal,
        status: 'approved',
        isDeleted: false,
      },
      _sum: {
        views: true,
      },
      _avg: {
        rating: true,
      },
    });

    const creators = await prisma.post.groupBy({
      by: ['authorId'],
      where: {
        type: portal,
        status: 'approved',
        isDeleted: false,
      },
      _sum: {
        views: true,
      },
      _avg: {
        rating: true,
      },
    });

    const scores = creators.map((creator) => {
      const v = creator._sum.views || 0;
      const r = creator._avg.rating || 0;
      return { authorId: creator.authorId, score: calculateScore(v, r) };
    });

    scores.sort((a, b) => b.score - a.score);
    const portalRank = scores.findIndex((s) => s.authorId === userId) + 1;

    portalRankings[portal] = {
      rank: portalRank,
      views: portalPosts._sum.views || 0,
      averageRating: parseFloat((portalPosts._avg.rating || 0).toFixed(2)),
    };
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        studentId: user.studentId,
      },
      globalRanking: {
        rank,
        totalPosts: postCount,
        totalViews,
        averageRating: parseFloat(avgRating.toFixed(2)),
        score: parseFloat(score.toFixed(2)),
      },
      portalRankings,
    },
  });
});

/**
 * Get leaderboard stats
 * GET /api/leaderboard/stats
 */
export const getLeaderboardStats = asyncHandler(async (req, res) => {
  // Total creators
  const totalCreators = await prisma.user.count({
    where: { role: 'creator' },
  });

  // Total posts
  const totalPosts = await prisma.post.count({
    where: {
      status: 'approved',
      isDeleted: false,
    },
  });

  // Total views
  const totalViews = await prisma.post.aggregate({
    where: {
      status: 'approved',
      isDeleted: false,
    },
    _sum: {
      views: true,
    },
  });

  // Average rating
  const avgRating = await prisma.post.aggregate({
    where: {
      status: 'approved',
      isDeleted: false,
    },
    _avg: {
      rating: true,
    },
  });

  // Posts by type
  const postsByType = await prisma.post.groupBy({
    by: ['type'],
    where: {
      status: 'approved',
      isDeleted: false,
    },
    _count: {
      id: true,
    },
  });

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalCreators,
        totalPosts,
        totalViews: totalViews._sum.views || 0,
        averageRating: parseFloat((avgRating._avg.rating || 0).toFixed(2)),
        postsByType: Object.fromEntries(
          postsByType.map((p) => [p.type.toLowerCase(), p._count.id])
        ),
      },
    },
  });
});

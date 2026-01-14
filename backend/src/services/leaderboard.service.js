import { prisma } from '../app.js';

/**
 * Leaderboard Service
 * Contains leaderboard calculation logic
 */

const calculateScore = (views, rating) => {
  return views * 0.6 + rating * 0.4;
};

export const LeaderboardService = {
  /**
   * Get global leaderboard with caching consideration
   */
  getGlobalLeaderboard: async (limit = 10, offset = 0) => {
    const creators = await prisma.post.groupBy({
      by: ['authorId'],
      where: {
        status: 'approved',
        isDeleted: false,
      },
      _sum: { views: true },
      _avg: { rating: true },
      _count: { id: true },
    });

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

    leaderboardData.sort((a, b) => b.stats.score - a.stats.score);

    return leaderboardData
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }))
      .slice(offset, offset + limit);
  },

  /**
   * Get portal-specific leaderboard
   */
  getPortalLeaderboard: async (type, limit = 10, offset = 0) => {
    const creators = await prisma.post.groupBy({
      by: ['authorId'],
      where: {
        type,
        status: 'approved',
        isDeleted: false,
      },
      _sum: { views: true },
      _avg: { rating: true },
      _count: { id: true },
    });

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

    leaderboardData.sort((a, b) => b.stats.score - a.stats.score);

    return leaderboardData
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }))
      .slice(offset, offset + limit);
  },

  /**
   * Get user's rank globally
   */
  getUserGlobalRank: async (userId) => {
    const allScores = await this.getAllScores();
    const rank = allScores.findIndex((s) => s.userId === userId) + 1;
    return rank || -1;
  },

  /**
   * Get user's rank in portal
   */
  getUserPortalRank: async (userId, type) => {
    const allScores = await this.getAllPortalScores(type);
    const rank = allScores.findIndex((s) => s.userId === userId) + 1;
    return rank || -1;
  },

  /**
   * Get all scores (for ranking)
   */
  getAllScores: async () => {
    const creators = await prisma.post.groupBy({
      by: ['authorId'],
      where: {
        status: 'approved',
        isDeleted: false,
      },
      _sum: { views: true },
      _avg: { rating: true },
    });

    const scores = creators
      .map((creator) => {
        const v = creator._sum.views || 0;
        const r = creator._avg.rating || 0;
        return {
          userId: creator.authorId,
          score: calculateScore(v, r),
        };
      })
      .sort((a, b) => b.score - a.score);

    return scores;
  },

  /**
   * Get all scores for a specific portal
   */
  getAllPortalScores: async (type) => {
    const creators = await prisma.post.groupBy({
      by: ['authorId'],
      where: {
        type,
        status: 'approved',
        isDeleted: false,
      },
      _sum: { views: true },
      _avg: { rating: true },
    });

    const scores = creators
      .map((creator) => {
        const v = creator._sum.views || 0;
        const r = creator._avg.rating || 0;
        return {
          userId: creator.authorId,
          score: calculateScore(v, r),
        };
      })
      .sort((a, b) => b.score - a.score);

    return scores;
  },

  /**
   * Get stats for dashboard
   */
  getLeaderboardStats: async () => {
    const totalCreators = await prisma.user.count({
      where: { role: 'creator' },
    });

    const totalPosts = await prisma.post.count({
      where: {
        status: 'approved',
        isDeleted: false,
      },
    });

    const totalViews = await prisma.post.aggregate({
      where: {
        status: 'approved',
        isDeleted: false,
      },
      _sum: { views: true },
    });

    const avgRating = await prisma.post.aggregate({
      where: {
        status: 'approved',
        isDeleted: false,
      },
      _avg: { rating: true },
    });

    const postsByType = await prisma.post.groupBy({
      by: ['type'],
      where: {
        status: 'approved',
        isDeleted: false,
      },
      _count: { id: true },
    });

    return {
      totalCreators,
      totalPosts,
      totalViews: totalViews._sum.views || 0,
      averageRating: parseFloat((avgRating._avg.rating || 0).toFixed(2)),
      postsByType: Object.fromEntries(
        postsByType.map((p) => [p.type.toLowerCase(), p._count.id])
      ),
    };
  },
};

export default LeaderboardService;

import { prisma } from '../app.js';

/**
 * Post Service
 * Contains post-related business logic
 */

export const PostService = {
  /**
   * Get posts by author
   */
  getPostsByAuthor: async (authorId, options = {}) => {
    const { status = 'approved', isDeleted = false, limit = 10, offset = 0 } = options;

    return await prisma.post.findMany({
      where: {
        authorId,
        status,
        isDeleted,
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Count posts by author
   */
  countPostsByAuthor: async (authorId, status = 'approved') => {
    return await prisma.post.count({
      where: {
        authorId,
        status,
        isDeleted: false,
      },
    });
  },

  /**
   * Get posts by type
   */
  getPostsByType: async (type, options = {}) => {
    const { status = 'approved', limit = 10, offset = 0 } = options;

    return await prisma.post.findMany({
      where: {
        type,
        status,
        isDeleted: false,
      },
      skip: offset,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { views: 'desc' },
    });
  },

  /**
   * Get trending posts
   */
  getTrendingPosts: async (limit = 5) => {
    return await prisma.post.findMany({
      where: {
        status: 'approved',
        isDeleted: false,
      },
      take: limit,
      orderBy: { views: 'desc' },
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
  },

  /**
   * Get recent posts
   */
  getRecentPosts: async (limit = 10) => {
    return await prisma.post.findMany({
      where: {
        status: 'approved',
        isDeleted: false,
      },
      take: limit,
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
  },

  /**
   * Calculate post engagement score
   */
  calculateEngagementScore: (views, likes, ratings) => {
    const viewScore = views * 0.1;
    const likeScore = likes * 1;
    const ratingScore = (ratings.average || 0) * 5;
    return viewScore + likeScore + ratingScore;
  },
};

export default PostService;

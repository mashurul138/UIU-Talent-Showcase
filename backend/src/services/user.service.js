import { prisma } from '../app.js';

/**
 * User Service
 * Contains user-related business logic
 */

export const UserService = {
  /**
   * Get user profile with stats
   */
  getUserWithStats: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) return null;

    // Get user stats
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
    });

    const stats = {
      totalPosts: posts.length,
      totalViews: posts.reduce((sum, p) => sum + p.views, 0),
      averageRating:
        posts.length > 0
          ? parseFloat(
              (posts.reduce((sum, p) => sum + p.rating, 0) / posts.length).toFixed(2)
            )
          : 0,
    };

    return { ...user, stats };
  },

  /**
   * Get creators by activity
   */
  getCreatorsByActivity: async (limit = 10) => {
    return await prisma.user.findMany({
      where: { role: 'creator' },
      take: limit,
      orderBy: { lastLogin: 'desc' },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        studentId: true,
        createdAt: true,
        lastLogin: true,
      },
    });
  },

  /**
   * Check if email exists
   */
  emailExists: async (email) => {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return !!user;
  },

  /**
   * Check if student ID exists
   */
  studentIdExists: async (studentId) => {
    const user = await prisma.user.findUnique({
      where: { studentId },
    });
    return !!user;
  },

  /**
   * Get user engagement
   */
  getUserEngagement: async (userId) => {
    const views = await prisma.interaction.count({
      where: { userId, type: 'view' },
    });

    const likes = await prisma.interaction.count({
      where: { userId, type: 'like' },
    });

    const ratings = await prisma.interaction.count({
      where: { userId, type: 'rating' },
    });

    const comments = await prisma.comment.count({
      where: { userId },
    });

    return { views, likes, ratings, comments };
  },
};

export default UserService;

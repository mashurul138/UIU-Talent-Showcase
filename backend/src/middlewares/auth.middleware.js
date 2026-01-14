import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../app.js';
import { AppError, asyncHandler } from './errorHandler.middleware.js';

/**
 * Verify JWT token middleware
 * Extracts and verifies the access token from Authorization header
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401);
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyAccessToken(token);
    
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired', 401);
    }
    throw new AppError('Invalid token', 401);
  }
});

/**
 * Role-based authorization middleware
 * @param {...string} allowedRoles - Roles allowed to access the route
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
};

/**
 * Check if user is the owner of a resource or admin
 * @param {Function} getResourceUserId - Function to get userId from resource
 */
export const isOwnerOrAdmin = (getResourceUserId) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const resourceUserId = await getResourceUserId(req);

    if (req.user.id !== resourceUserId) {
      throw new AppError('Access denied. You can only modify your own resources', 403);
    }

    next();
  });
};

/**
 * Optional authentication middleware
 * Doesn't throw error if token is missing, but verifies if present
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Silently ignore auth errors in optional auth
  }

  next();
});

import { prisma } from '../app.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, deleteRefreshToken, deleteAllUserTokens } from '../utils/jwt.js';
import { registerSchema, loginSchema } from '../utils/validation.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.middleware.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  // Validate request body
  registerSchema.parse(req.body);

  const { email, password, name, role = 'viewer', student_id, avatar_url } = req.body;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
      studentId: student_id,
      avatarUrl: avatar_url,
    },
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

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  // Validate request body
  loginSchema.parse(req.body);

  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Verify password
  const passwordMatch = await comparePassword(password, user.passwordHash);

  if (!passwordMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  // Return user without password
  const userResponse = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    studentId: user.studentId,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
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

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  try {
    const decoded = await verifyRefreshToken(refreshToken);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const newAccessToken = generateAccessToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
});

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { refreshToken } = req.body;

  if (refreshToken) {
    await deleteRefreshToken(refreshToken);
  }

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * Logout from all devices
 * POST /api/auth/logout-all
 */
export const logoutAll = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  await deleteAllUserTokens(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Logged out from all devices',
  });
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const { name, avatar_url } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name && { name }),
      ...(avatar_url && { avatarUrl: avatar_url }),
    },
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
    message: 'Profile updated successfully',
    data: { user: updatedUser },
  });
});

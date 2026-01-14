import { z } from 'zod';

// Auth Schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['viewer', 'creator', 'admin']).optional(),
  student_id: z.string().optional(),
  avatar_url: z.string().url('Invalid URL').optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar_url: z.string().url().optional(),
});

// Post Schemas
const postSchema = z.object({
  type: z.enum(['video', 'audio', 'blog'], {
    errorMap: () => ({ message: 'Type must be video, audio, or blog' }),
  }),
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  media_url: z.string().url('Invalid media URL'),
  thumbnail_url: z.string().url('Invalid thumbnail URL').optional(),
  duration: z.number().int().positive('Duration must be positive').optional(),
});

const updatePostSchema = z.object({
  type: z.enum(['video', 'audio', 'blog']).optional(),
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(10).optional(),
  media_url: z.string().url().optional(),
  thumbnail_url: z.string().url().optional(),
  duration: z.number().int().positive().optional(),
});

const deletePostSchema = z.object({
  reason: z.string().optional(),
});

// Interaction Schemas
const interactionSchema = z.object({
  type: z.enum(['view', 'like', 'rating']),
  value: z.number().int().min(1).max(5).optional(), // For rating (1-5)
});

// Admin Schemas
const rejectPostSchema = z.object({
  reason: z.string().min(3, 'Rejection reason must be at least 3 characters'),
});

const updateUserRoleSchema = z.object({
  role: z.enum(['viewer', 'creator', 'admin']),
});

// Comment Schema (for future use)
const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
});

/**
 * Generic validation middleware
 * @param {z.ZodSchema} schema - Zod schema to validate against
 */
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    });
  }
};

export {
  // Auth
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  // Posts
  postSchema,
  updatePostSchema,
  deletePostSchema,
  // Interactions
  interactionSchema,
  // Admin
  rejectPostSchema,
  updateUserRoleSchema,
  // Comments
  commentSchema,
  // Middleware
  validate,
};

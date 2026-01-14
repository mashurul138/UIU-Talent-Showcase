import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  recordInteraction,
  getPostInteractions,
} from '../controllers/post.controller.js';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../middlewares/errorHandler.middleware.js';

const router = express.Router();

/**
 * Post Routes
 */

// Public routes
router.get('/', asyncHandler(optionalAuth), asyncHandler(getPosts));
router.get('/:id', asyncHandler(optionalAuth), asyncHandler(getPostById));
router.get('/:id/interactions', asyncHandler(getPostInteractions));

// Protected routes
router.post(
  '/',
  asyncHandler(authenticate),
  asyncHandler(authorize('creator', 'admin')),
  asyncHandler(createPost)
);

router.put(
  '/:id',
  asyncHandler(authenticate),
  asyncHandler(updatePost)
);

router.delete(
  '/:id',
  asyncHandler(authenticate),
  asyncHandler(deletePost)
);

router.post(
  '/:id/interact',
  asyncHandler(authenticate),
  asyncHandler(recordInteraction)
);

export default router;

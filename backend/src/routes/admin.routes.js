import express from 'express';
import {
  getGarbageBin,
  restorePost,
  permanentlyDeletePost,
  getPendingPosts,
  approvePost,
  rejectPost,
  getModerationDashboard,
  getAllUsers,
  updateUserRole,
  getUserDetails,
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../middlewares/errorHandler.middleware.js';

const router = express.Router();

/**
 * Admin Routes
 * All routes require admin authentication
 */

// Apply admin authorization to all routes
router.use(asyncHandler(authenticate));
router.use(asyncHandler(authorize('admin')));

/**
 * Moderation & Moderation Dashboard
 */
router.get('/dashboard', asyncHandler(getModerationDashboard));
router.get('/pending-posts', asyncHandler(getPendingPosts));
router.patch('/posts/:id/approve', asyncHandler(approvePost));
router.patch('/posts/:id/reject', asyncHandler(rejectPost));

/**
 * Garbage Bin Management
 */
router.get('/garbage-bin', asyncHandler(getGarbageBin));
router.put('/garbage-bin/:id/restore', asyncHandler(restorePost));
router.delete('/garbage-bin/:id/permanent', asyncHandler(permanentlyDeletePost));

/**
 * User Management
 */
router.get('/users', asyncHandler(getAllUsers));
router.get('/users/:id', asyncHandler(getUserDetails));
router.put('/users/:id/role', asyncHandler(updateUserRole));

export default router;

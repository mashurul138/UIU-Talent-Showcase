import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  refreshAccessToken,
  logout,
  logoutAll,
  updateProfile,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../middlewares/errorHandler.middleware.js';

const router = express.Router();

/**
 * Auth Routes
 */

// Public routes
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refreshAccessToken));

// Protected routes
router.get('/me', asyncHandler(authenticate), asyncHandler(getCurrentUser));
router.post('/logout', asyncHandler(authenticate), asyncHandler(logout));
router.post('/logout-all', asyncHandler(authenticate), asyncHandler(logoutAll));
router.put('/profile', asyncHandler(authenticate), asyncHandler(updateProfile));

export default router;

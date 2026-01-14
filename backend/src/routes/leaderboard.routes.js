import express from 'express';
import {
  getGlobalLeaderboard,
  getPortalLeaderboard,
  getUserRanking,
  getLeaderboardStats,
} from '../controllers/leaderboard.controller.js';
import { asyncHandler } from '../middlewares/errorHandler.middleware.js';

const router = express.Router();

/**
 * Leaderboard Routes
 */

// Public routes
router.get('/', asyncHandler(getGlobalLeaderboard));
router.get('/stats', asyncHandler(getLeaderboardStats));
router.get('/portal/:type', asyncHandler(getPortalLeaderboard));
router.get('/user/:userId', asyncHandler(getUserRanking));

export default router;

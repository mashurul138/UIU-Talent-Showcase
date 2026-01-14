-- ============================================================================
-- UIU TALENT SHOWCASE DASHBOARD - MYSQL DATABASE SCHEMA
-- Production-ready multi-portal system (Video, Audio, Blog)
-- ============================================================================
-- Database: uiu_talent_showcase
-- Character Set: utf8mb4 (supports emoji and international characters)
-- Engine: InnoDB (for transactions and foreign keys)
-- ============================================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS uiu_talent_showcase 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE uiu_talent_showcase;

-- ============================================================================
-- ENUMS (as separate reference for clarity)
-- ============================================================================
-- Role enum values: viewer, creator, admin
-- PostType enum values: video, audio, blog
-- PostStatus enum values: pending, approved, rejected
-- InteractionType enum values: view, like, rating
-- ============================================================================

-- ============================================================================
-- TABLE 1: users
-- Purpose: Store user accounts, profiles, roles
-- Supports: Authentication, authorization, profile management
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id                    VARCHAR(36)    NOT NULL PRIMARY KEY COMMENT 'UUID primary key',
  email                 VARCHAR(255)   NOT NULL UNIQUE COMMENT 'User email (unique identifier)',
  password_hash         VARCHAR(255)   NOT NULL COMMENT 'Bcrypt hashed password',
  name                  VARCHAR(255)   NOT NULL COMMENT 'User full name',
  role                  ENUM('viewer', 'creator', 'admin') 
                        NOT NULL DEFAULT 'viewer' COMMENT 'User role (viewer=read-only, creator=can upload, admin=moderation)',
  student_id            VARCHAR(100)   UNIQUE COMMENT 'Optional student ID (for educational institutions)',
  avatar_url            VARCHAR(500)   COMMENT 'URL to user profile picture',
  created_at            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation date',
  last_login            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP 
                        ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last login timestamp',
  
  -- Indexes for common queries
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_created_at (created_at),
  INDEX idx_student_id (student_id)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='User accounts with role-based access control';

-- ============================================================================
-- TABLE 2: posts
-- Purpose: Store all content (videos, audio files, blog articles)
-- Supports: Multi-type content, status workflow, soft delete, engagement metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS posts (
  id                    VARCHAR(36)    NOT NULL PRIMARY KEY COMMENT 'UUID primary key',
  author_id             VARCHAR(36)    NOT NULL COMMENT 'FK to users.id (post creator)',
  type                  ENUM('video', 'audio', 'blog') 
                        NOT NULL COMMENT 'Content type portal (video/audio/blog)',
  title                 VARCHAR(255)   NOT NULL COMMENT 'Post title',
  description           LONGTEXT       NOT NULL COMMENT 'Post description/content (supports HTML)',
  media_url             VARCHAR(500)   NOT NULL COMMENT 'URL to video/audio/content file',
  thumbnail_url         VARCHAR(500)   COMMENT 'Optional thumbnail image URL',
  status                ENUM('pending', 'approved', 'rejected') 
                        NOT NULL DEFAULT 'pending' COMMENT 'Moderation status',
  views                 INT            NOT NULL DEFAULT 0 COMMENT 'View count (auto-incremented)',
  rating                DECIMAL(3,2)   NOT NULL DEFAULT 0 COMMENT 'Average rating (0-5.00)',
  duration              INT            COMMENT 'Media duration in seconds (for video/audio)',
  created_at            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Post creation date',
  updated_at            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP 
                        ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  is_deleted            BOOLEAN        NOT NULL DEFAULT FALSE COMMENT 'Soft delete flag (for garbage bin)',
  deleted_at            TIMESTAMP      NULL COMMENT 'Soft delete timestamp',
  deletion_reason       VARCHAR(500)   COMMENT 'Reason for deletion (admin/user initiated)',
  
  -- Foreign key to users
  CONSTRAINT fk_posts_author_id 
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes for common queries
  INDEX idx_author_id (author_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_is_deleted (is_deleted),
  INDEX idx_author_status (author_id, status),
  INDEX idx_type_status_created (type, status, created_at),
  FULLTEXT INDEX idx_title_description (title, description)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='All content (videos, audio, blogs) with moderation workflow';

-- ============================================================================
-- TABLE 3: interactions
-- Purpose: Track user engagement (views, likes, ratings)
-- Supports: Leaderboard calculations, engagement metrics, per-user tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS interactions (
  id                    VARCHAR(36)    NOT NULL PRIMARY KEY COMMENT 'UUID primary key',
  user_id               VARCHAR(36)    NOT NULL COMMENT 'FK to users.id (who interacted)',
  post_id               VARCHAR(36)    NOT NULL COMMENT 'FK to posts.id (which post)',
  type                  ENUM('view', 'like', 'rating') 
                        NOT NULL COMMENT 'Type of interaction',
  value                 INT            COMMENT 'Interaction value (1-5 for ratings, NULL for views/likes)',
  created_at            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Interaction timestamp',
  
  -- Foreign keys
  CONSTRAINT fk_interactions_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_interactions_post_id 
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  
  -- Unique constraint: One view/like/rating per user per post
  UNIQUE KEY unique_user_post_type (user_id, post_id, type),
  
  -- Indexes for common queries
  INDEX idx_user_id (user_id),
  INDEX idx_post_id (post_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at),
  INDEX idx_post_type (post_id, type)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='User interactions: views, likes, ratings for leaderboard and engagement';

-- ============================================================================
-- TABLE 4: comments
-- Purpose: User comments on posts
-- Supports: Discussion, feedback, engagement
-- ============================================================================
CREATE TABLE IF NOT EXISTS comments (
  id                    VARCHAR(36)    NOT NULL PRIMARY KEY COMMENT 'UUID primary key',
  post_id               VARCHAR(36)    NOT NULL COMMENT 'FK to posts.id (which post)',
  user_id               VARCHAR(36)    NOT NULL COMMENT 'FK to users.id (who commented)',
  content               LONGTEXT       NOT NULL COMMENT 'Comment text (supports HTML)',
  created_at            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Comment creation date',
  
  -- Foreign keys
  CONSTRAINT fk_comments_post_id 
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes for common queries
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='User comments on posts for discussion and feedback';

-- ============================================================================
-- TABLE 5: refresh_tokens
-- Purpose: JWT refresh token management
-- Supports: Stateful token revocation, persistent sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id                    VARCHAR(36)    NOT NULL PRIMARY KEY COMMENT 'UUID primary key',
  user_id               VARCHAR(36)    NOT NULL COMMENT 'FK to users.id (token owner)',
  token                 VARCHAR(500)   NOT NULL UNIQUE COMMENT 'Actual JWT token',
  expires_at            TIMESTAMP      NOT NULL COMMENT 'Token expiration time',
  created_at            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Token creation date',
  
  -- Foreign key
  CONSTRAINT fk_refresh_tokens_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes for common queries
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  INDEX idx_token (token)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='JWT refresh tokens for session management and token revocation';

-- ============================================================================
-- VIEWS (For efficient leaderboard queries)
-- ============================================================================

-- View: Global Leaderboard (Creator rankings based on all posts)
CREATE OR REPLACE VIEW vw_global_leaderboard AS
SELECT 
  u.id AS user_id,
  u.name,
  u.avatar_url,
  u.role,
  COUNT(DISTINCT p.id) AS total_posts,
  COALESCE(SUM(p.views), 0) AS total_views,
  COALESCE(AVG(p.rating), 0) AS avg_rating,
  ROUND(
    (COALESCE(SUM(p.views), 0) * 0.6) + 
    (COALESCE(AVG(p.rating), 0) * 0.4), 
    2
  ) AS leaderboard_score,
  RANK() OVER (ORDER BY 
    (COALESCE(SUM(p.views), 0) * 0.6) + 
    (COALESCE(AVG(p.rating), 0) * 0.4) DESC
  ) AS rank_position
FROM users u
LEFT JOIN posts p ON u.id = p.author_id 
  AND p.status = 'approved' 
  AND p.is_deleted = FALSE
WHERE u.role IN ('creator', 'admin')
GROUP BY u.id, u.name, u.avatar_url, u.role
ORDER BY leaderboard_score DESC;

-- View: Portal-wise Leaderboard (Per type: video, audio, blog)
CREATE OR REPLACE VIEW vw_portal_leaderboard AS
SELECT 
  p.type AS portal,
  u.id AS user_id,
  u.name,
  u.avatar_url,
  COUNT(DISTINCT p.id) AS total_posts,
  COALESCE(SUM(p.views), 0) AS total_views,
  COALESCE(AVG(p.rating), 0) AS avg_rating,
  ROUND(
    (COALESCE(SUM(p.views), 0) * 0.6) + 
    (COALESCE(AVG(p.rating), 0) * 0.4), 
    2
  ) AS leaderboard_score,
  RANK() OVER (PARTITION BY p.type ORDER BY 
    (COALESCE(SUM(p.views), 0) * 0.6) + 
    (COALESCE(AVG(p.rating), 0) * 0.4) DESC
  ) AS rank_position
FROM users u
LEFT JOIN posts p ON u.id = p.author_id 
  AND p.status = 'approved' 
  AND p.is_deleted = FALSE
WHERE u.role IN ('creator', 'admin')
GROUP BY p.type, u.id, u.name, u.avatar_url
ORDER BY p.type, leaderboard_score DESC;

-- View: Content Performance Dashboard
CREATE OR REPLACE VIEW vw_content_performance AS
SELECT 
  DATE(p.created_at) AS date,
  p.type AS post_type,
  p.status,
  COUNT(*) AS post_count,
  SUM(p.views) AS total_views,
  AVG(p.rating) AS avg_rating,
  COUNT(DISTINCT p.author_id) AS creator_count
FROM posts p
GROUP BY DATE(p.created_at), p.type, p.status
ORDER BY DATE(p.created_at) DESC, p.type;

-- ============================================================================
-- STORED PROCEDURES (For common operations)
-- ============================================================================

-- Procedure: Increment post views (atomic operation)
DELIMITER $$
CREATE PROCEDURE sp_increment_post_views(IN p_post_id VARCHAR(36))
BEGIN
  UPDATE posts 
  SET views = views + 1 
  WHERE id = p_post_id;
END $$
DELIMITER ;

-- Procedure: Calculate and update post rating
DELIMITER $$
CREATE PROCEDURE sp_update_post_rating(IN p_post_id VARCHAR(36))
BEGIN
  DECLARE avg_rating DECIMAL(3,2);
  
  SELECT COALESCE(AVG(value), 0) INTO avg_rating
  FROM interactions 
  WHERE post_id = p_post_id AND type = 'rating';
  
  UPDATE posts 
  SET rating = avg_rating 
  WHERE id = p_post_id;
END $$
DELIMITER ;

-- Procedure: Get user ranking (global and per portal)
DELIMITER $$
CREATE PROCEDURE sp_get_user_ranking(IN p_user_id VARCHAR(36))
BEGIN
  -- Global ranking
  SELECT 
    'global' AS ranking_type,
    u.id,
    u.name,
    u.avatar_url,
    COUNT(DISTINCT p.id) AS total_posts,
    COALESCE(SUM(p.views), 0) AS total_views,
    COALESCE(AVG(p.rating), 0) AS avg_rating,
    ROUND(
      (COALESCE(SUM(p.views), 0) * 0.6) + 
      (COALESCE(AVG(p.rating), 0) * 0.4), 
      2
    ) AS score,
    (SELECT COUNT(*) FROM vw_global_leaderboard 
     WHERE leaderboard_score > (
       SELECT leaderboard_score FROM vw_global_leaderboard 
       WHERE user_id = p_user_id
     )) + 1 AS rank
  FROM users u
  LEFT JOIN posts p ON u.id = p.author_id 
    AND p.status = 'approved' 
    AND p.is_deleted = FALSE
  WHERE u.id = p_user_id
  GROUP BY u.id;
  
  -- Portal-wise rankings
  SELECT 
    CONCAT('portal_', p.type) AS ranking_type,
    u.id,
    u.name,
    u.avatar_url,
    p.type AS portal,
    COUNT(DISTINCT p.id) AS total_posts,
    COALESCE(SUM(p.views), 0) AS total_views,
    COALESCE(AVG(p.rating), 0) AS avg_rating,
    ROUND(
      (COALESCE(SUM(p.views), 0) * 0.6) + 
      (COALESCE(AVG(p.rating), 0) * 0.4), 
      2
    ) AS score
  FROM users u
  LEFT JOIN posts p ON u.id = p.author_id 
    AND p.status = 'approved' 
    AND p.is_deleted = FALSE
  WHERE u.id = p_user_id
  GROUP BY p.type, u.id;
END $$
DELIMITER ;

-- ============================================================================
-- INDEXES SUMMARY
-- ============================================================================
-- users table: 
--   - email (UNIQUE), role, created_at, student_id
--
-- posts table: 
--   - author_id, type, status, created_at, is_deleted
--   - Combined: (author_id, status), (type, status, created_at)
--   - FULLTEXT: (title, description)
--
-- interactions table: 
--   - user_id, post_id, type, created_at
--   - UNIQUE: (user_id, post_id, type) - prevents duplicates
--   - Combined: (post_id, type)
--
-- comments table: 
--   - post_id, user_id, created_at
--
-- refresh_tokens table: 
--   - user_id, expires_at, token (UNIQUE)

-- ============================================================================
-- FOREIGN KEY RELATIONSHIPS
-- ============================================================================
-- users → (1-to-many)
--   ├─ posts (author_id) - User creates posts
--   ├─ interactions (user_id) - User interacts with posts
--   ├─ comments (user_id) - User comments on posts
--   └─ refresh_tokens (user_id) - User has refresh tokens
--
-- posts → (1-to-many)
--   ├─ interactions (post_id) - Post receives interactions
--   └─ comments (post_id) - Post receives comments
--
-- Cascading deletes:
--   - Delete user → deletes their posts, interactions, comments, refresh tokens
--   - Delete post → deletes its interactions and comments

-- ============================================================================
-- DATABASE CONSTRAINTS & BUSINESS RULES
-- ============================================================================
-- 1. Email uniqueness: Each user has unique email
-- 2. Student ID uniqueness: Each student ID appears once (optional)
-- 3. Token uniqueness: Each refresh token is unique
-- 4. Interaction uniqueness: One view/like/rating per user per post (prevents duplicates)
-- 5. Soft delete: Posts marked as deleted but not removed (is_deleted flag)
-- 6. Post rating: Average of all ratings (1-5) for a post
-- 7. Post views: Auto-incremented when user views post
-- 8. Post status: Pending → Approved/Rejected (admin moderation)
-- 9. Role-based access: viewer (read), creator (upload), admin (all)
-- 10. UUID primary keys: Distributed unique identifiers across systems

-- ============================================================================
-- LEADERBOARD SCORING FORMULA
-- ============================================================================
-- Score = (Total Views × 0.6) + (Average Rating × 0.4)
--
-- Weight Distribution:
--   - 60% Views     → Encourages engagement/reach
--   - 40% Rating    → Ensures quality
--
-- Applied at:
--   - Global level: All approved posts by user
--   - Portal level: Approved posts of specific type (video/audio/blog)
--
-- Example:
--   Views: 1000, Rating: 4.5/5
--   Score = (1000 × 0.6) + (4.5 × 0.4) = 601.8

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
-- Total Tables: 5
-- Total Views: 3
-- Total Procedures: 3
-- Total Relationships: 8
-- Total Indexes: 20+
-- Engine: InnoDB (supports transactions, foreign keys, cascading deletes)
-- ============================================================================

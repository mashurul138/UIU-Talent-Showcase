-- UIU Talent Showcase: database schema + seed data (merged)

DROP DATABASE IF EXISTS uiu_talent_show;
CREATE DATABASE uiu_talent_show CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE uiu_talent_show;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- USERS TABLE
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('viewer','creator','admin') NOT NULL DEFAULT 'viewer',
  student_id VARCHAR(50) NULL,
  avatar VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- POSTS TABLE
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('blog','video','audio') NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  duration VARCHAR(20) DEFAULT '0:00',
  views INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- MEDIA TABLE
CREATE TABLE media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- POST VOTES
CREATE TABLE votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  rating DECIMAL(3,1) NOT NULL DEFAULT 5.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_vote (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- USER VOTES (LEADERBOARD)
CREATE TABLE user_votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  voter_id INT NOT NULL,
  candidate_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_vote (voter_id, candidate_id),
  FOREIGN KEY (voter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- INDEXES
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_media_post_id ON media(post_id);
CREATE INDEX idx_votes_post_id ON votes(post_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_user_votes_candidate_id ON user_votes(candidate_id);
CREATE INDEX idx_user_votes_voter_id ON user_votes(voter_id);

-- SEED USERS (EXPORTED DATA)
INSERT INTO users (id, name, email, password, role, created_at) VALUES
(4, 'Viewer User', 'viewer@uiu.ac.bd', '$2y$12$88.T8XGfLxu6SVWYl1/o7eImg9xnuaPOYoqn/D6a3ozntLY9afJmS', 'viewer', '2026-01-19 16:07:43'),
(5, 'Admin User', 'admin@uiu.ac.bd', '$2y$12$7sIX9hf5beens4mUwHgw8ulaKVbMETsUgYG/1N29SpGZ3/KVIy7fq', 'admin', '2026-01-19 16:07:43'),
(6, 'First Creator', 'creator@uiu.ac.bd', '$2y$12$6xwvfXeVg2EN.RFlNVHa0uugq94Z.zFV.oqXdJgGPHOXS2GmfJE4C', 'creator', '2026-01-19 16:07:43'),
(8, 'creator1', 'creator1@uiu.ac.bd', '$2y$12$TlEEHPTFbx2YZe1GwrMyGOr4tlt6uyYRP4i0JvYMlhu0BgLIExblS', 'creator', '2026-01-21 18:24:12');

-- SEED POSTS (EXPORTED DATA)
INSERT INTO posts (id, user_id, title, description, type, created_at, status, duration, views) VALUES
(7, 6, 'Functional Programming', 'what is functional Programming', 'video', '2026-01-19 19:41:56', 'approved', '0:59', 26),
(8, 6, 'New Year', 'New year song', 'audio', '2026-01-19 19:42:43', 'approved', '2:50', 16),
(11, 6, 'First blog post', 'test post to check is it works', 'blog', '2026-01-21 15:41:50', 'approved', '', 3),
(12, 6, 'Is writing blog works?', 'it should work lets see, is the edits works?\n', 'blog', '2026-01-21 16:01:49', 'approved', '', 10),
(15, 8, 'This is from 2nd creator', 'fjsnfewij', 'blog', '2026-01-21 18:25:16', 'approved', '', 7);

-- SEED MEDIA (EXPORTED DATA)
INSERT INTO media (id, post_id, file_path, file_type, file_size, created_at) VALUES
(4, 7, 'uploads/1768851716_Functional_Programming_in_60_Seconds_tech_programming_software_python_javascript.mp4', 'mp4', 4244007, '2026-01-19 19:41:56'),
(5, 8, 'uploads/1768851763_chinese-lunar-new-year-465871.mp3', 'mp3', 5462726, '2026-01-19 19:42:43'),
(8, 11, 'uploads/1769010110_Gemini_Generated_Image_fnnvu5fnnvu5fnnv.png', 'png', 1106958, '2026-01-21 15:41:50');

-- SEED VOTES (EXPORTED DATA)
INSERT INTO votes (id, user_id, post_id, created_at, rating) VALUES
(6, 6, 7, '2026-01-20 06:15:29', 5.0),
(13, 6, 8, '2026-01-21 15:38:08', 5.0),
(15, 6, 12, '2026-01-21 18:05:49', 5.0),
(17, 8, 15, '2026-01-21 18:30:14', 5.0),
(33, 8, 7, '2026-01-21 20:38:53', 5.0),
(40, 6, 15, '2026-01-21 20:39:32', 5.0);

-- SEED USER VOTES (EXPORTED DATA)
INSERT INTO user_votes (id, voter_id, candidate_id, created_at) VALUES
(2, 8, 6, '2026-01-21 19:25:01');

-- AUTO_INCREMENT
ALTER TABLE media AUTO_INCREMENT=10;
ALTER TABLE posts AUTO_INCREMENT=16;
ALTER TABLE users AUTO_INCREMENT=9;
ALTER TABLE user_votes AUTO_INCREMENT=3;
ALTER TABLE votes AUTO_INCREMENT=41;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

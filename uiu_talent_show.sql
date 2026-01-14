-- Create database
CREATE DATABASE IF NOT EXISTS uiu_talent_show;
USE uiu_talent_show;

-- USERS TABLE
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POSTS TABLE
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  type ENUM('blog','video','audio') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- MEDIA TABLE
CREATE TABLE media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_media_post_id ON media(post_id);
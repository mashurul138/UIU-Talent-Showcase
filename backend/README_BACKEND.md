# 🎯 UIU Talent Showcase Dashboard - Backend API

A production-ready Node.js + Express.js + MySQL backend for a multi-portal content management platform with JWT authentication, role-based access control, and intelligent leaderboard system.

---

## 📋 Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Quick Start](#quick-start)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Authentication](#authentication)
7. [Project Structure](#project-structure)
8. [Development](#development)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Core Features
- ✅ **JWT-based Authentication** - Access & Refresh tokens
- ✅ **Role-Based Access Control** - Viewer, Creator, Admin
- ✅ **Multi-Portal Content** - Video, Audio, Blog posts
- ✅ **Smart Leaderboard System** - Global & portal-wise rankings with intelligent scoring
- ✅ **Admin Moderation** - Approve/reject posts, garbage bin management
- ✅ **User Interactions** - Views, likes, ratings tracking
- ✅ **Soft Delete System** - Recoverable deletion via garbage bin
- ✅ **Comprehensive Comments** - User interactions on posts

### Security Features
- 🔒 Bcrypt password hashing
- 🔐 Secure JWT tokens with expiration
- 🛡️ CORS protection
- 🚫 Role-based middleware
- ⚠️ Input validation with Zod
- 📝 Error handling & logging

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MySQL |
| **ORM** | Prisma |
| **Authentication** | JWT (jsonwebtoken) |
| **Password Hash** | Bcryptjs |
| **Validation** | Zod |
| **Config** | dotenv |
| **Dev Tools** | Nodemon |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MySQL 8.0+ installed and running
- npm or yarn package manager

### 1. Clone & Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

**Example .env:**
```env
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="mysql://root:password@localhost:3306/uiu_talent_showcase?schema=public"

# JWT
JWT_ACCESS_SECRET=your_super_secret_access_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt
BCRYPT_ROUNDS=10

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Database Setup

```bash
# Create database and run migrations
npm run prisma:migrate

# Seed database with sample data
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on http://localhost:5000
```

### 5. Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@uiu.edu | admin123 |
| Creator | creator1@uiu.edu | creator1123 |
| Creator | creator2@uiu.edu | creator2123 |
| Viewer | viewer1@uiu.edu | viewer1123 |
| Viewer | viewer2@uiu.edu | viewer2123 |

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('viewer', 'creator', 'admin') DEFAULT 'viewer',
  student_id VARCHAR(50) UNIQUE,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
  id VARCHAR(36) PRIMARY KEY,
  author_id VARCHAR(36) NOT NULL,
  type ENUM('video', 'audio', 'blog') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  media_url VARCHAR(255) NOT NULL,
  thumbnail_url VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  views INT DEFAULT 0,
  rating FLOAT DEFAULT 0,
  duration INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP NULL,
  deletion_reason VARCHAR(255),
  FOREIGN KEY (author_id) REFERENCES users(id)
);
```

### Interactions Table
```sql
CREATE TABLE interactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  type ENUM('view', 'like', 'rating') NOT NULL,
  value INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_interaction (user_id, post_id, type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 📡 API Endpoints Overview

### Authentication (7 endpoints)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/logout-all` - Logout all sessions
- `PUT /api/auth/profile` - Update user profile

### Posts (7 endpoints)
- `GET /api/posts` - Get all posts (paginated, filterable)
- `GET /api/posts/:id` - Get post details
- `POST /api/posts` - Create post (creator/admin)
- `PUT /api/posts/:id` - Update post (owner/admin)
- `DELETE /api/posts/:id` - Soft delete post
- `POST /api/posts/:id/interact` - Record interaction
- `GET /api/posts/:id/interactions` - Get post interactions

### Leaderboard (4 endpoints)
- `GET /api/leaderboard` - Global leaderboard
- `GET /api/leaderboard/portal/:type` - Portal-specific leaderboard
- `GET /api/leaderboard/user/:userId` - User rankings
- `GET /api/leaderboard/stats` - Leaderboard statistics

### Admin (10 endpoints)
- `GET /api/admin/dashboard` - Moderation dashboard
- `GET /api/admin/pending-posts` - Get pending posts
- `PATCH /api/admin/posts/:id/approve` - Approve post
- `PATCH /api/admin/posts/:id/reject` - Reject post
- `GET /api/admin/garbage-bin` - Get deleted posts
- `PUT /api/admin/garbage-bin/:id/restore` - Restore post
- `DELETE /api/admin/garbage-bin/:id/permanent` - Permanently delete
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id/role` - Update user role

**Total: 28 endpoints** ✅

---

## 🔐 Authentication

### JWT Token Structure

**Access Token** (15 minutes)
```json
{
  "userId": "uuid",
  "iat": 1705240800,
  "exp": 1705241700
}
```

**Refresh Token** (7 days)
- Stored in database
- Can be revoked
- Used to get new access tokens

### Authentication Flow

```
1. User Login
   ↓
2. Generate Access Token + Refresh Token
   ↓
3. Store Refresh Token in DB
   ↓
4. Send Both Tokens to Client
   ↓
5. Client Uses Access Token in Header: Authorization: Bearer <token>
   ↓
6. When Access Token Expires, Use Refresh Token
   ↓
7. Server Issues New Access Token
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                          # Main Express app
│   ├── controllers/
│   │   ├── auth.controller.js          # Auth logic
│   │   ├── post.controller.js          # Post CRUD
│   │   ├── leaderboard.controller.js   # Leaderboard logic
│   │   └── admin.controller.js         # Admin features
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── post.routes.js
│   │   ├── leaderboard.routes.js
│   │   └── admin.routes.js
│   ├── middlewares/
│   │   ├── auth.middleware.js          # JWT verification
│   │   └── errorHandler.middleware.js  # Error handling
│   ├── prisma/
│   │   ├── schema.prisma               # Database schema
│   │   └── seed.js                     # Database seeding
│   ├── utils/
│   │   ├── jwt.js                      # JWT utilities
│   │   ├── password.js                 # Password hashing
│   │   └── validation.js               # Zod schemas
│   └── services/                       # Business logic (optional)
├── .env.example
├── .gitignore
├── package.json
├── API_DOCUMENTATION.md
└── README.md
```

---

## 👨‍💻 Development

### Available Scripts

```bash
# Start development server (auto-reload with nodemon)
npm run dev

# Start production server
npm start

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio (GUI database explorer)
npm run prisma:studio

# Seed database with test data
npm run seed
```

### Debugging

Enable debug logs by setting in `.env`:
```env
DEBUG=*
```

### Database Explorer

```bash
npm run prisma:studio
```

Opens http://localhost:5555 for visual database management.

---

## 🏭 Production Deployment

### Before Deployment

1. **Update .env**
   ```env
   NODE_ENV=production
   JWT_ACCESS_SECRET=<strong-secret-key>
   JWT_REFRESH_SECRET=<strong-secret-key>
   ```

2. **Run migrations**
   ```bash
   npm run prisma:migrate
   ```

3. **Build (optional)**
   ```bash
   npm install --production
   ```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backed up
- [ ] API documentation reviewed
- [ ] Error handling tested
- [ ] CORS properly configured
- [ ] Rate limiting implemented (optional)
- [ ] Logging system in place
- [ ] HTTPS enabled

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_ACCESS_SECRET=your-secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Deploy to AWS/Azure/DigitalOcean

1. Setup database (MySQL managed service)
2. Configure environment variables
3. Run migrations: `npm run prisma:migrate`
4. Start server: `npm start`

---

## 🐛 Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution:**
- Verify MySQL is running: `mysql -u root -p`
- Check DATABASE_URL in .env
- Ensure database exists

### Prisma Migration Error

```
Error: The database URL is invalid
```

**Solution:**
```bash
# Reset and re-migrate
npx prisma db push --skip-generate
npm run seed
```

### JWT Token Expired

```
Error: Token expired
```

**Solution:**
- Use refresh token to get new access token
- POST `/api/auth/refresh` with refresh token

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
Update `app.js` CORS configuration:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Prisma Client Error

```
error: PrismaClientInitializationError
```

**Solution:**
```bash
# Regenerate Prisma client
npm run prisma:generate

# Clear cache
rm -rf node_modules/.prisma
npm install
```

---

## 📈 Performance Optimization

### Indexing

Already configured in `schema.prisma`:
- Primary keys
- Foreign keys
- Unique constraints

### Caching (Optional)

```javascript
// Add Redis for session caching
npm install redis
```

### Pagination

All list endpoints support pagination:
```
?page=1&limit=10
```

### Query Optimization

Prisma automatically optimizes queries. For complex queries:
```javascript
// Use Prisma groupBy instead of raw SQL
const results = await prisma.post.groupBy({
  by: ['authorId'],
  _sum: { views: true },
  _avg: { rating: true }
});
```

---

## 📚 Learning Resources

- [Express.js Documentation](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT.io](https://jwt.io)
- [MySQL Documentation](https://dev.mysql.com/doc)
- [Zod Validation](https://zod.dev)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -m 'Add feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Create Pull Request

---

## 📝 License

ISC License - See LICENSE file for details

---

## 👥 Support

For issues and questions:
- Email: support@uiu.edu
- Documentation: See `API_DOCUMENTATION.md`
- Issues: Create GitHub issue

---

## 🎉 Summary

This production-ready backend provides:
- ✅ Complete authentication system
- ✅ Multi-role authorization
- ✅ Content management with moderation
- ✅ Intelligent leaderboard with custom scoring
- ✅ Comprehensive error handling
- ✅ Database persistence with Prisma
- ✅ 28 RESTful API endpoints
- ✅ Full API documentation
- ✅ Sample data with seeding

**Ready to connect with the React frontend!** 🚀

---

Generated: 2024-01-14
Last Updated: 2024-01-14

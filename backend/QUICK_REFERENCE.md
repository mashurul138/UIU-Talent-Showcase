# ⚡ Backend Quick Reference

## 🚀 Quick Start

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run prisma:migrate
npm run seed
npm run dev
```

Server runs on: `http://localhost:5000`

---

## 🔐 Authentication

### Login & Get Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@uiu.edu",
    "password": "admin123"
  }'
```

### Use Token in Requests

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/auth/me
```

---

## 📝 Key Endpoints

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get post details
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Leaderboard
- `GET /api/leaderboard` - Global ranking
- `GET /api/leaderboard/portal/:type` - Portal ranking
- `GET /api/leaderboard/user/:userId` - User ranking

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/pending-posts` - Posts to approve
- `PATCH /api/admin/posts/:id/approve` - Approve post
- `PATCH /api/admin/posts/:id/reject` - Reject post

---

## 📦 Project Structure

```
backend/src/
├── controllers/     # Business logic
├── routes/         # API endpoints
├── middlewares/    # Auth, errors
├── prisma/         # Database
├── utils/          # Helpers
└── app.js          # Main server
```

---

## 🧪 Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@uiu.edu | admin123 |
| Creator | creator1@uiu.edu | creator1123 |
| Viewer | viewer1@uiu.edu | viewer1123 |

---

## 🔧 Common Commands

```bash
npm run dev                # Development server
npm start                  # Production server
npm run prisma:studio      # Database GUI
npm run seed               # Reset with sample data
npm run prisma:migrate     # Run migrations
```

---

## 📊 Database

### Tables
- `users` - User accounts
- `posts` - Content (video/audio/blog)
- `interactions` - Views, likes, ratings
- `comments` - Post comments
- `refresh_tokens` - JWT tokens

### Reset Database

```bash
npm run prisma:migrate -- --skip-generate
npm run seed
```

---

## 🎯 Score Formula

**Leaderboard Score:**
```
score = (total_views × 0.6) + (average_rating × 0.4)
```

Example:
- Views: 1000
- Rating: 4.5/5
- Score = (1000 × 0.6) + (4.5 × 0.4) = **601.8**

---

## 🔒 Roles & Permissions

| Action | Viewer | Creator | Admin |
|---|---|---|---|
| View Posts | ✅ | ✅ | ✅ |
| Create Posts | ❌ | ✅ | ✅ |
| Edit Own Posts | ❌ | ✅ | ✅ |
| Delete Posts | ❌ | ✅ | ✅ |
| Moderate | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |

---

## ⚠️ Common Issues

**Port in use:**
```bash
lsof -ti:5000 | xargs kill -9
PORT=5001 npm run dev
```

**Database error:**
```bash
mysql -u root -p
CREATE DATABASE uiu_talent_showcase;
```

**Prisma error:**
```bash
npm run prisma:generate
npm install
```

---

## 📚 Documentation

- **Full Setup:** See `SETUP_GUIDE.md`
- **All Endpoints:** See `API_DOCUMENTATION.md`
- **Full README:** See `README_BACKEND.md`

---

## 🎯 Frontend Integration

### Environment Variables (.env in frontend)

```
VITE_API_URL=http://localhost:5000/api
```

### Example API Call

```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
localStorage.setItem('accessToken', data.data.tokens.accessToken);

// Use Token
fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
})
```

---

## 🚀 Deployment

```bash
# Production build
NODE_ENV=production npm start

# Heroku
heroku config:set JWT_ACCESS_SECRET=<secret>
git push heroku main
```

---

## 📞 Support

- Check error logs: `npm run dev`
- View database: `npm run prisma:studio`
- Read docs: See markdown files
- Test API: Use Postman/cURL

---

**Last Updated:** 2024-01-14
**Version:** 1.0.0

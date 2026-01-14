# UIU Talent Showcase Dashboard - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication via Bearer token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication Endpoints

### 1. Register
**POST** `/auth/register`

Register a new user.

**Request Body:**
```json
{
  "email": "user@uiu.edu",
  "password": "password123",
  "name": "John Doe",
  "role": "viewer", // optional: viewer (default), creator, admin
  "student_id": "STU001", // optional
  "avatar_url": "https://..." // optional
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@uiu.edu",
      "name": "John Doe",
      "role": "viewer",
      "studentId": "STU001",
      "avatarUrl": "https://...",
      "createdAt": "2024-01-14T10:00:00Z"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

---

### 2. Login
**POST** `/auth/login`

Authenticate user and get tokens.

**Request Body:**
```json
{
  "email": "user@uiu.edu",
  "password": "password123"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@uiu.edu",
      "name": "John Doe",
      "role": "viewer",
      "lastLogin": "2024-01-14T10:05:00Z"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

---

### 3. Get Current User
**GET** `/auth/me`

Get authenticated user's profile.

**Headers:** Authorization required

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@uiu.edu",
      "name": "John Doe",
      "role": "viewer",
      "studentId": "STU001",
      "lastLogin": "2024-01-14T10:05:00Z"
    }
  }
}
```

---

### 4. Refresh Access Token
**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "..."
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "..."
  }
}
```

---

### 5. Logout
**POST** `/auth/logout`

Logout from current session.

**Headers:** Authorization required

**Request Body:**
```json
{
  "refreshToken": "..."
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 6. Logout All Devices
**POST** `/auth/logout-all`

Logout from all active sessions.

**Headers:** Authorization required

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Logged out from all devices"
}
```

---

### 7. Update Profile
**PUT** `/auth/profile`

Update user profile information.

**Headers:** Authorization required

**Request Body:**
```json
{
  "name": "Jane Doe", // optional
  "avatar_url": "https://..." // optional
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { ... }
  }
}
```

---

## 📝 Posts Endpoints

### 1. Get All Posts
**GET** `/posts?type=&status=&author=&page=1&limit=10`

Get posts with optional filters.

**Query Parameters:**
- `type`: `video`, `audio`, or `blog`
- `status`: `pending`, `approved`, or `rejected`
- `author`: Author user ID
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "type": "video",
        "title": "Amazing Tutorial",
        "description": "...",
        "mediaUrl": "https://...",
        "views": 150,
        "rating": 4.5,
        "status": "approved",
        "author": {
          "id": "uuid",
          "name": "John Doe",
          "avatarUrl": "https://...",
          "studentId": "STU001"
        },
        "createdAt": "2024-01-14T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

---

### 2. Get Single Post
**GET** `/posts/:id`

Get post details by ID. Also records a view for authenticated users.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      "type": "video",
      "title": "Amazing Tutorial",
      "description": "...",
      "mediaUrl": "https://...",
      "thumbnailUrl": "https://...",
      "duration": 15,
      "views": 151,
      "rating": 4.5,
      "status": "approved",
      "author": { ... },
      "interactions": [...],
      "comments": [
        {
          "id": "uuid",
          "content": "Great tutorial!",
          "user": { ... },
          "createdAt": "2024-01-14T10:30:00Z"
        }
      ],
      "createdAt": "2024-01-14T10:00:00Z"
    }
  }
}
```

---

### 3. Create Post
**POST** `/posts`

Create a new post (Requires: creator or admin role)

**Headers:** Authorization required

**Request Body:**
```json
{
  "type": "video",
  "title": "My Tutorial",
  "description": "This is a detailed tutorial about...",
  "media_url": "https://example.com/video.mp4",
  "thumbnail_url": "https://example.com/thumb.jpg", // optional
  "duration": 15 // optional, in minutes
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "post": { ... }
  }
}
```

---

### 4. Update Post
**PUT** `/posts/:id`

Update post details. Only owner or admin can update.

**Headers:** Authorization required

**Request Body:** (Any fields to update)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "media_url": "https://...",
  "thumbnail_url": "https://..."
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": { "post": { ... } }
}
```

---

### 5. Delete Post (Soft Delete)
**DELETE** `/posts/:id`

Move post to garbage bin (soft delete).

**Headers:** Authorization required

**Request Body:**
```json
{
  "reason": "No longer relevant" // optional
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Post moved to garbage bin",
  "data": { "post": { ... } }
}
```

---

### 6. Record Interaction
**POST** `/posts/:id/interact`

Record user interaction (view, like, rating).

**Headers:** Authorization required

**Request Body:**
```json
{
  "type": "rating", // view, like, or rating
  "value": 4 // required for rating (1-5), optional for others
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "message": "Interaction recorded",
  "data": {
    "interaction": {
      "id": "uuid",
      "userId": "uuid",
      "postId": "uuid",
      "type": "rating",
      "value": 4,
      "createdAt": "2024-01-14T10:45:00Z"
    }
  }
}
```

---

### 7. Get Post Interactions
**GET** `/posts/:id/interactions?type=`

Get all interactions for a post.

**Query Parameters:**
- `type`: `view`, `like`, or `rating` (optional)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "interactions": [
      {
        "id": "uuid",
        "type": "rating",
        "value": 5,
        "user": {
          "id": "uuid",
          "name": "Viewer Name",
          "avatarUrl": "https://..."
        }
      }
    ],
    "stats": {
      "total": 156,
      "views": 150,
      "likes": 4,
      "ratings": 2,
      "averageRating": 4.5
    }
  }
}
```

---

## 🏆 Leaderboard Endpoints

### 1. Get Global Leaderboard
**GET** `/leaderboard?limit=10&offset=0`

Get top creators globally.

**Query Parameters:**
- `limit`: Number of results (default: 10)
- `offset`: Pagination offset (default: 0)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "id": "uuid",
        "name": "Top Creator",
        "avatarUrl": "https://...",
        "studentId": "STU001",
        "stats": {
          "totalPosts": 15,
          "totalViews": 5000,
          "averageRating": 4.8,
          "score": 3200.0
        }
      }
    ],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 25
    }
  }
}
```

---

### 2. Get Portal Leaderboard
**GET** `/leaderboard/portal/:type?limit=10&offset=0`

Get top creators for a specific portal (video/audio/blog).

**Path Parameters:**
- `type`: `video`, `audio`, or `blog`

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "portal": "video",
    "leaderboard": [ ... ],
    "pagination": { ... }
  }
}
```

---

### 3. Get User Ranking
**GET** `/leaderboard/user/:userId`

Get a user's global and portal rankings.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Creator Name",
      "avatarUrl": "https://...",
      "studentId": "STU001"
    },
    "globalRanking": {
      "rank": 5,
      "totalPosts": 12,
      "totalViews": 3500,
      "averageRating": 4.6,
      "score": 2400.0
    },
    "portalRankings": {
      "video": {
        "rank": 3,
        "views": 2000,
        "averageRating": 4.7
      },
      "audio": {
        "rank": 8,
        "views": 1200,
        "averageRating": 4.5
      },
      "blog": {
        "rank": 1,
        "views": 300,
        "averageRating": 4.9
      }
    }
  }
}
```

---

### 4. Get Leaderboard Stats
**GET** `/leaderboard/stats`

Get overall leaderboard statistics.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalCreators": 45,
      "totalPosts": 250,
      "totalViews": 125000,
      "averageRating": 4.3,
      "postsByType": {
        "video": 100,
        "audio": 80,
        "blog": 70
      }
    }
  }
}
```

---

## 🛡️ Admin Endpoints

All admin endpoints require admin role and authentication.

### 1. Get Moderation Dashboard
**GET** `/admin/dashboard`

Get moderation statistics and recent activity.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalPosts": 250,
      "totalUsers": 100,
      "posts": {
        "pending": 5,
        "approved": 200,
        "rejected": 25,
        "deleted": 20
      },
      "usersByRole": {
        "viewer": 60,
        "creator": 35,
        "admin": 5
      }
    },
    "recentPosts": [ ... ]
  }
}
```

---

### 2. Get Pending Posts
**GET** `/admin/pending-posts?page=1&limit=10`

Get posts awaiting approval.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "posts": [ ... ],
    "pagination": { ... }
  }
}
```

---

### 3. Approve Post
**PATCH** `/admin/posts/:id/approve`

Approve a pending post.

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Post approved successfully",
  "data": { "post": { ... } }
}
```

---

### 4. Reject Post
**PATCH** `/admin/posts/:id/reject`

Reject a pending post.

**Request Body:**
```json
{
  "reason": "Violates content policy"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Post rejected successfully",
  "data": { "post": { ... } }
}
```

---

### 5. Get Garbage Bin
**GET** `/admin/garbage-bin?type=&page=1&limit=10`

Get deleted posts.

**Query Parameters:**
- `type`: Filter by post type (optional)
- `page`: Page number
- `limit`: Items per page

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "posts": [ ... ],
    "pagination": { ... }
  }
}
```

---

### 6. Restore Post
**PUT** `/admin/garbage-bin/:id/restore`

Restore a deleted post from garbage bin.

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Post restored successfully",
  "data": { "post": { ... } }
}
```

---

### 7. Permanently Delete Post
**DELETE** `/admin/garbage-bin/:id/permanent`

Permanently delete a post (cannot be undone).

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Post permanently deleted"
}
```

---

### 8. Get All Users
**GET** `/admin/users?role=&page=1&limit=10`

Get all users with optional role filter.

**Query Parameters:**
- `role`: Filter by role (`viewer`, `creator`, `admin`)
- `page`: Page number
- `limit`: Items per page

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@uiu.edu",
        "name": "User Name",
        "role": "creator",
        "studentId": "STU001",
        "avatarUrl": "https://...",
        "createdAt": "2024-01-14T10:00:00Z",
        "lastLogin": "2024-01-14T14:30:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 9. Get User Details
**GET** `/admin/users/:id`

Get detailed information about a specific user.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "stats": {
      "total": 15,
      "pending": 2,
      "approved": 12,
      "rejected": 1,
      "totalViews": 5000,
      "averageRating": 4.6
    }
  }
}
```

---

### 10. Update User Role
**PUT** `/admin/users/:id/role`

Change a user's role.

**Request Body:**
```json
{
  "role": "creator" // viewer, creator, or admin
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": { "user": { ... } }
```

---

## 🔍 Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE" // Optional
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate entry)
- **500**: Internal Server Error

---

## 🔒 Role-Based Access Control

| Endpoint Category | Viewer | Creator | Admin |
|---|---|---|---|
| View Posts | ✅ | ✅ | ✅ |
| Create Posts | ❌ | ✅ | ✅ |
| Edit Own Posts | ❌ | ✅ | ✅ |
| Delete Own Posts | ❌ | ✅ | ✅ |
| View Leaderboard | ✅ | ✅ | ✅ |
| Moderate Posts | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Access Garbage Bin | ❌ | ❌ | ✅ |

---

## 📊 Scoring Algorithm

**Global Score Formula:**
```
score = (total_views × 0.6) + (average_rating × 0.4)
```

- **Weight on Views (60%)**: More engagement through views
- **Weight on Rating (40%)**: Quality matters

Example:
- Total Views: 1000
- Average Rating: 4.5/5
- Score = (1000 × 0.6) + (4.5 × 0.4) = 600 + 1.8 = **601.8**

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Setup Database
```bash
npm run prisma:migrate
npm run seed
```

### 4. Start Server
```bash
npm run dev
```

### 5. Test Credentials
```
Admin: admin@uiu.ac.bd / admin123
Creator: creator1@uiu.ac.bd / creator1123
Viewer: viewer1@uiu.ac.bd / viewer1123
```

---

Generated: 2026-01-14

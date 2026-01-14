# 🔧 Backend Setup Guide

## Step-by-Step Installation & Configuration

### 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** v16 or higher ([Download](https://nodejs.org))
- **npm** v7 or higher (comes with Node.js)
- **MySQL** 8.0+ ([Download](https://www.mysql.com/downloads/mysql/))
- **Git** ([Download](https://git-scm.com))

Verify installations:
```bash
node --version
npm --version
mysql --version
git --version
```

---

## 🚀 Installation Steps

### 1. Navigate to Backend Directory

```bash
cd /path/to/WEB_PROJECT-main/backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `@prisma/client` - Database ORM
- `prisma` - Database migrations
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variables
- `zod` - Schema validation
- `nodemon` - Development auto-reload

### 3. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

This creates a new `.env` file in the `backend` directory.

### 4. Configure Environment Variables

Open `.env` with your text editor:

```bash
# Using nano
nano .env

# Or using Visual Studio Code
code .env
```

**Update the following variables:**

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
# Change 'password' to your MySQL root password
DATABASE_URL="mysql://root:password@localhost:3306/uiu_talent_showcase?schema=public"

# JWT Configuration (Generate random strings for production)
JWT_ACCESS_SECRET=your_super_secret_access_key_change_in_production_12345
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production_67890
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt Configuration
BCRYPT_ROUNDS=10

# Cloudinary Configuration (Optional - for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 5. Create MySQL Database

**Option A: Using MySQL CLI**

```bash
# Connect to MySQL
mysql -u root -p

# Inside MySQL console, run:
CREATE DATABASE uiu_talent_showcase;
EXIT;
```

**Option B: Using MySQL Workbench**

1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Create new schema: `uiu_talent_showcase`

### 6. Run Database Migrations

```bash
# Generate Prisma client and create database schema
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

When prompted:
- Enter a name for the migration (e.g., `init`)
- Confirm the creation

**Output should show:**
```
✅ Successfully created migrations folder
✅ Executed migrations
```

### 7. Seed Database with Test Data

```bash
npm run seed
```

**Output:**
```
🌱 Starting seed...
✅ Created admin user: admin@uiu.edu
✅ Created 5 creator users
✅ Created 5 viewer users
✅ Created 9 approved posts
✅ Created 2 pending posts
✅ Created interactions (views, likes, ratings)
✅ Updated post statistics
✅ Created sample comments
✨ Seed completed successfully!
```

---

## ▶️ Starting the Development Server

### Start with Auto-Reload

```bash
npm run dev
```

**Expected output:**
```
✅ Database connected successfully
🚀 Server running on http://localhost:5000
📊 API Documentation: http://localhost:5000/api/health
```

### Verify Server is Running

```bash
# In another terminal, test the health endpoint
curl http://localhost:5000/api/health
```

You should receive:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-14T10:00:00.000Z",
  "environment": "development"
}
```

---

## 🧪 Testing the API

### Using cURL

**1. Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@uiu.edu",
    "password": "test123456",
    "name": "Test User"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@uiu.edu",
    "password": "test123456"
  }'
```

**3. Get current user (using token from login):**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your_access_token>"
```

### Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import the collection (if available)
3. Create requests for each endpoint

---

## 🗄️ Database Management

### View Database in GUI

```bash
npm run prisma:studio
```

Opens http://localhost:5555 where you can:
- View all tables
- Edit records
- Create new entries
- Delete records

### Reset Database

**⚠️ Warning: This will delete all data!**

```bash
# Drop database
mysql -u root -p uiu_talent_showcase < /dev/null

# Recreate and migrate
npm run prisma:migrate

# Reseed
npm run seed
```

### Backup Database

```bash
# Export database
mysqldump -u root -p uiu_talent_showcase > backup.sql

# Import database
mysql -u root -p uiu_talent_showcase < backup.sql
```

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── app.js                          # Main application
│   ├── controllers/                    # Business logic
│   │   ├── auth.controller.js
│   │   ├── post.controller.js
│   │   ├── leaderboard.controller.js
│   │   └── admin.controller.js
│   ├── routes/                         # API routes
│   │   ├── auth.routes.js
│   │   ├── post.routes.js
│   │   ├── leaderboard.routes.js
│   │   └── admin.routes.js
│   ├── middlewares/                    # Custom middleware
│   │   ├── auth.middleware.js
│   │   └── errorHandler.middleware.js
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema
│   │   └── seed.js                    # Sample data
│   └── utils/
│       ├── jwt.js                      # JWT helpers
│       ├── password.js                 # Password utilities
│       └── validation.js               # Input validation
├── .env                                # Environment variables (create)
├── .env.example                        # Example environment
├── .gitignore                          # Git ignore rules
├── package.json                        # Dependencies
├── package-lock.json                   # Lock file
├── API_DOCUMENTATION.md               # API docs
└── README_BACKEND.md                  # Backend README
```

---

## 🔑 Test Credentials

After seeding, use these credentials:

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@uiu.edu | admin123 |
| **Creator** | creator1@uiu.edu | creator1123 |
| **Creator** | creator2@uiu.edu | creator2123 |
| **Creator** | creator3@uiu.edu | creator3123 |
| **Creator** | creator4@uiu.edu | creator4123 |
| **Creator** | creator5@uiu.edu | creator5123 |
| **Viewer** | viewer1@uiu.edu | viewer1123 |
| **Viewer** | viewer2@uiu.edu | viewer2123 |
| **Viewer** | viewer3@uiu.edu | viewer3123 |
| **Viewer** | viewer4@uiu.edu | viewer4123 |
| **Viewer** | viewer5@uiu.edu | viewer5123 |

---

## 🛠️ Useful Commands

### Development

```bash
# Start development server
npm run dev

# Start production server
npm start

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio (GUI)
npm run prisma:studio

# Seed database
npm run seed
```

### Debugging

```bash
# Enable debug mode
DEBUG=* npm run dev

# View all tables
npm run prisma:studio

# Check database connection
npm run prisma:db push
```

### Database

```bash
# Access MySQL
mysql -u root -p uiu_talent_showcase

# Show all tables
SHOW TABLES;

# Describe a table
DESCRIBE users;
DESC posts;

# View data
SELECT * FROM users;
SELECT * FROM posts;
```

---

## ⚠️ Common Issues & Solutions

### Issue: Database Connection Refused

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions:**
1. Verify MySQL is running:
   ```bash
   mysql -u root -p
   ```
2. Check `.env` DATABASE_URL is correct
3. Restart MySQL service:
   ```bash
   # macOS
   brew services restart mysql
   
   # Windows
   net stop MySQL80
   net start MySQL80
   
   # Linux
   sudo systemctl restart mysql
   ```

### Issue: Database Already Exists

**Error:**
```
Database `uiu_talent_showcase` already exists
```

**Solution:**
```bash
# Use existing database
npm run prisma:migrate
```

### Issue: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Kill process on port 5000
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm run dev
```

### Issue: Prisma Client Error

**Error:**
```
error: PrismaClientInitializationError
```

**Solution:**
```bash
# Regenerate Prisma client
npm run prisma:generate

# Clear node_modules cache
rm -rf node_modules/.prisma
npm install
```

### Issue: JWT Token Errors

**Error:**
```
Error: Invalid or expired token
```

**Solutions:**
1. Ensure JWT secrets are set in `.env`
2. Check token hasn't expired (15 minutes)
3. Use refresh token to get new access token

---

## 🔒 Security Setup

### For Production

1. **Generate Strong Secrets:**
   ```bash
   # Generate random secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update .env:**
   ```env
   NODE_ENV=production
   JWT_ACCESS_SECRET=<generated-secret-1>
   JWT_REFRESH_SECRET=<generated-secret-2>
   ```

3. **Enable HTTPS:**
   - Use reverse proxy (nginx, Apache)
   - Implement SSL/TLS certificates
   - Use services like Heroku or AWS

4. **Database Security:**
   - Use strong passwords
   - Don't expose DATABASE_URL
   - Regular backups

5. **Environment Variables:**
   - Never commit `.env` to git
   - Use `.env.example` as template
   - Rotate secrets regularly

---

## 📦 Deployment Preparation

### Before Deploying

- [ ] Test all endpoints
- [ ] Update JWT secrets
- [ ] Configure production database
- [ ] Set NODE_ENV=production
- [ ] Review error handling
- [ ] Test authentication flow
- [ ] Verify CORS configuration
- [ ] Setup logging

### Deploy Commands

```bash
# Install production dependencies
npm install --production

# Run migrations on production DB
npm run prisma:migrate -- --skip-generate

# Start production server
npm start
```

---

## 📚 Next Steps

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Read API Documentation:**
   See `API_DOCUMENTATION.md`

3. **Connect Frontend:**
   Update React `.env` with backend URL:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Explore Database:**
   ```bash
   npm run prisma:studio
   ```

5. **Test Endpoints:**
   Use Postman or cURL to test APIs

---

## 🆘 Need Help?

- Check `API_DOCUMENTATION.md` for endpoint details
- Review error messages carefully
- Check database connection
- Verify environment variables
- Check server logs: `npm run dev`
- Review Prisma documentation: https://www.prisma.io/docs

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `npm install` completed successfully
- [ ] `.env` file created and configured
- [ ] MySQL database created
- [ ] `npm run prisma:migrate` successful
- [ ] `npm run seed` completed
- [ ] Server starts: `npm run dev`
- [ ] Health check works: `curl http://localhost:5000/api/health`
- [ ] Can login with test credentials
- [ ] Prisma Studio opens: `npm run prisma:studio`

---

**🎉 Setup Complete! Your backend is ready to use.**

For more information, see:
- `API_DOCUMENTATION.md` - Complete API reference
- `README_BACKEND.md` - Backend overview

Generated: 2024-01-14

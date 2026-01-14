# 🚀 Backend Deployment Guide

## Cloud Deployment Options

### Option 1: Heroku (Recommended for Beginners)

#### Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed
- Git repository

#### Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Add MySQL Database**
   ```bash
   # Using JawsDB (free MySQL provider)
   heroku addons:create jawsdb:kitefin
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_ACCESS_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   heroku config:set JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   heroku config:set BCRYPT_ROUNDS=10
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Run Migrations**
   ```bash
   heroku run npm run prisma:migrate
   heroku run npm run seed
   ```

7. **View Logs**
   ```bash
   heroku logs --tail
   ```

#### Verify Deployment
```bash
curl https://your-app-name.herokuapp.com/api/health
```

---

### Option 2: AWS (EC2 + RDS)

#### Prerequisites
- AWS account
- EC2 instance (Ubuntu 20.04 LTS)
- RDS MySQL database
- SSH access to EC2

#### Steps

1. **SSH into EC2**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

2. **Install Node.js and npm**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone Repository**
   ```bash
   cd /home/ec2-user
   git clone your-repo-url
   cd WEB_PROJECT-main/backend
   npm install
   ```

5. **Configure Environment**
   ```bash
   nano .env
   # Add RDS database URL and JWT secrets
   ```

6. **Run Migrations**
   ```bash
   npm run prisma:migrate
   npm run seed
   ```

7. **Start with PM2**
   ```bash
   pm2 start "npm start" --name "backend"
   pm2 save
   pm2 startup
   ```

8. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt-get install nginx
   sudo nano /etc/nginx/sites-available/default
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

9. **Setup SSL with Certbot**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

### Option 3: DigitalOcean (App Platform)

#### Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Create App in DigitalOcean Console**
   - Go to Apps > Create App
   - Connect GitHub repository
   - Select backend folder

3. **Configure Environment**
   - Add environment variables in App Platform UI
   - DATABASE_URL, JWT secrets, etc.

4. **Deploy**
   - Click Deploy
   - Wait for build and deployment

5. **Access Your App**
   - Copy provided URL
   - Test health endpoint

---

### Option 4: Docker + Any Cloud

#### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN npm run prisma:generate

EXPOSE 5000

CMD ["npm", "start"]
```

#### Build and Run

```bash
# Build image
docker build -t uiu-backend .

# Run container
docker run -p 5000:5000 \
  -e DATABASE_URL="mysql://..." \
  -e JWT_ACCESS_SECRET="..." \
  uiu-backend

# Push to Docker Hub
docker tag uiu-backend:latest your-dockerhub/uiu-backend:latest
docker push your-dockerhub/uiu-backend:latest
```

---

## Environment Setup for Production

### Security Checklist

```env
# MUST CHANGE
PORT=5000
NODE_ENV=production
DATABASE_URL=mysql://user:strong_password@prod-db.example.com:3306/uiu_talent_showcase

# Generate these with crypto
JWT_ACCESS_SECRET=<generate-random-256-bit-string>
JWT_REFRESH_SECRET=<generate-random-256-bit-string>

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12  # Higher for production

# Optional but recommended
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Logging (optional)
LOG_LEVEL=info
```

### Generate Secure Secrets

```bash
# Generate random 256-bit hex strings
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run twice for access and refresh secrets.

---

## Database Backup Strategy

### Automated Backup (MySQL)

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/backup"
DB_NAME="uiu_talent_showcase"
DB_USER="root"
DB_PASSWORD="your_password"

mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

### Restore from Backup

```bash
mysql -u root -p uiu_talent_showcase < backup_20240114_120000.sql
```

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs backend

# Get statistics
pm2 stats
```

### Application Logging

Add logging middleware in `app.js`:

```javascript
import fs from 'fs';

// Create logs directory
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Log requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${req.method} ${req.path}`;
  console.log(logMessage);
  
  fs.appendFileSync('logs/requests.log', logMessage + '\n');
  next();
});

// Log errors
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const errorLog = `${timestamp} - ERROR: ${err.message}\n${err.stack}`;
  
  fs.appendFileSync('logs/errors.log', errorLog + '\n');
  next(err);
});
```

---

## Health Checks & Uptime Monitoring

### Configure Health Check

```bash
# Heroku automatically checks /health endpoint
# AWS: Create health check pointing to /api/health
# DigitalOcean: Configure in App Platform

# Manual check
curl https://your-api.com/api/health
```

### Uptime Monitoring Services
- **Uptime Robot** (free tier)
- **Pingdom**
- **Datadog**
- **New Relic**

---

## Performance Optimization

### Enable Caching

```javascript
// Redis caching (optional)
import redis from 'redis';
const client = redis.createClient();

// Cache leaderboard (5 minutes)
app.get('/api/leaderboard', (req, res, next) => {
  const cacheKey = 'leaderboard:global';
  
  client.get(cacheKey, (err, data) => {
    if (data) return res.json(JSON.parse(data));
    
    // Fetch from DB and cache
    // ...
    client.setex(cacheKey, 300, JSON.stringify(result));
  });
});
```

### Database Optimization

```javascript
// Add indexes to frequently queried columns
// Already configured in Prisma schema:
// - Primary keys
// - Foreign keys
// - Unique constraints

// Add composite indexes if needed
// Example in schema.prisma:
// @@index([authorId, status])
```

---

## Scaling Considerations

### Horizontal Scaling

```bash
# Load balancing with Nginx
upstream backend {
  server backend1:5000;
  server backend2:5000;
  server backend3:5000;
}

server {
  listen 80;
  location / {
    proxy_pass http://backend;
  }
}
```

### Database Optimization

1. **Add Read Replicas**
2. **Implement Connection Pooling**
3. **Use Query Caching**
4. **Archive Old Data**

---

## Troubleshooting Deployment

### Logs Show Connection Error

```bash
# Check database URL
echo $DATABASE_URL

# Verify database is accessible
mysql -h host -u user -p

# Check firewall rules
```

### Server Not Starting

```bash
# Check port is available
lsof -i :5000

# View PM2 logs
pm2 logs backend

# Try manual start
npm start
```

### High Memory Usage

```bash
# Monitor memory
pm2 monitor

# Restart service
pm2 restart backend

# Check for memory leaks
node --inspect src/app.js
```

---

## Rollback Procedure

### If Deployment Fails

```bash
# Heroku rollback
heroku rollback

# Manual rollback
git revert HEAD
git push origin main
git push heroku main

# Or specific commit
git reset --hard <commit-hash>
git push -f heroku main
```

---

## SSL/TLS Certificate

### Using Let's Encrypt

```bash
# Certbot (Nginx)
sudo certbot --nginx -d your-api.com

# Manual renewal
sudo certbot renew

# Auto-renewal with cron
0 0 1 * * /usr/bin/certbot renew >> /var/log/letsencrypt/renewal.log
```

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Database backup strategy implemented
- [ ] SSL/TLS certificates installed
- [ ] Error logging set up
- [ ] Monitoring configured
- [ ] Health checks enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented (optional)
- [ ] Database replicas set up (optional)
- [ ] CDN configured (optional)
- [ ] Security headers added
- [ ] Database indexed appropriately
- [ ] API rate limiting
- [ ] Automated backups running
- [ ] Team access managed

---

## Post-Deployment

### Verify All Systems

```bash
# Health check
curl https://your-api.com/api/health

# Login test
curl -X POST https://your-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uiu.edu","password":"admin123"}'

# Get posts
curl https://your-api.com/api/posts

# Admin dashboard
curl -H "Authorization: Bearer TOKEN" \
  https://your-api.com/api/admin/dashboard
```

### Monitor for First 24 Hours

- Watch error logs
- Monitor database performance
- Check API response times
- Verify user authentication
- Test all major features

---

## Common Deployment Issues & Solutions

### Issue: Database Connection Timeout
**Solution:** Check security groups/firewall rules allow connection

### Issue: Out of Memory
**Solution:** Increase server RAM or implement caching

### Issue: Slow API Response
**Solution:** Add database indexes, implement caching

### Issue: SSL Certificate Error
**Solution:** Renew certificate or check domain configuration

### Issue: 502 Bad Gateway
**Solution:** Check if app process is running, view logs

---

## Support & Resources

- **Deployment Help:** See `SETUP_GUIDE.md`
- **API Documentation:** See `API_DOCUMENTATION.md`
- **Troubleshooting:** See `README_BACKEND.md`

---

**Deployment Ready!** 🚀

Generated: 2024-01-14

# UIU Talent Showcase

A React + PHP web app for showcasing student video, audio, and blog content with role-based access.

## Features
- Video, audio, and blog portals with approval workflow
- Role-based access (viewer, creator, admin) with backend login
- Media uploads stored in `backend/uploads` with safe filenames
- Global audio and video players with mini players on portal routes (click mini video to reopen full player)
- View counts increment once per visit
- Votes and leaderboard support (`votes`, `user_votes` tables)

## Project Structure

```
WEB_PROJECT/
  backend/               # PHP API and upload storage
  frontend/              # React frontend
  AUTHENTICATION_SYSTEM.md
  MEDIA_PLAYBACK.md
  TESTING_GUIDE.md
  uiu_talent_show.sql     # Database schema
```

## Setup

### Database
1. Create the database and tables:
   - Import `uiu_talent_show.sql` into MySQL.

### Backend
1. Ensure PHP can write to `backend/uploads`.
2. Update PHP upload limits in `php.ini`:
   - `upload_max_filesize = 4G`
   - `post_max_size = 4G`
3. Start the PHP server:

```bash
cd backend
php -S localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

### Media URL Base
The frontend resolves media from `frontend/src/utils/media.ts` (`MEDIA_BASE_URL`).
Make sure it matches the PHP server address (default `http://localhost:8000`).

## Test Accounts

- Viewer: `viewer@uiu.ac.bd` / `viewer123`
- Creator: `creator@uiu.ac.bd` / `creator123`
- Admin: `admin@uiu.ac.bd` / `admin123`

## Documentation
- Authentication and roles: `AUTHENTICATION_SYSTEM.md`
- Media playback and mini players: `MEDIA_PLAYBACK.md`
- Testing scenarios: `TESTING_GUIDE.md`
- Legacy UI notes: `frontend/src/PROJECT_DOCUMENTATION.md`

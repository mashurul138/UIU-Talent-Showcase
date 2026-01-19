# UIU Talent Showcase - Testing Guide

## Test Accounts

| Role | Email | Password |
| --- | --- | --- |
| Viewer | viewer@uiu.ac.bd | viewer123 |
| Creator | creator@uiu.ac.bd | creator123 |
| Admin | admin@uiu.ac.bd | admin123 |

## Core Scenarios

### 1. Viewer Permissions
- Login as viewer
- Can browse Video, Audio, Blogs, Leaderboard
- Upload buttons are hidden
- Edit/Delete controls are hidden
- Garbage Bin is not accessible

### 2. Creator Permissions
- Login as creator
- Upload buttons visible on portals
- Can edit/delete own posts only
- Creator dashboard shows their content

### 3. Admin Permissions
- Login as admin
- Pending posts are accessible
- Admin can approve/reject content
- Garbage Bin is accessible

### 4. Audio Mini Player
- Open an audio detail page and start playback
- Click "Back to Portal"
- Mini player appears and playback continues (or stays paused)
- Play/pause, seek, mute, and close work

### 5. Video Mini Player
- Open a video detail page and start playback
- Click "Back to Portal"
- Mini player appears and playback continues (or stays paused)
- Play/pause, seek, mute, and close work
- Clicking the mini video opens the full video page

### 6. View Counts
- Open a post detail page once
- Views increase once per visit
- Reloading the page increases views again

### 7. Upload and Playback
- Upload a video or audio
- Verify the file exists in `backend/uploads`
- Verify the media plays from the portal/detail page

## Notes
- Backend should run at `http://localhost:8000`.
- Frontend runs at `http://localhost:3000`.
- If uploads fail due to size limits, update `php.ini`:
  - `upload_max_filesize = 4G`
  - `post_max_size = 4G`

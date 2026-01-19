# Media Playback and Mini Players

## Overview
Media files are stored in `backend/uploads` and referenced by relative paths (for example, `uploads/123_video.mp4`).
The frontend builds URLs with `frontend/src/utils/media.ts` to ensure proper encoding.

## Audio Playback
- `frontend/src/contexts/AudioPlayerContext.tsx` owns a single global `<audio>` element.
- `frontend/src/components/AudioListenPage.tsx` loads the selected track into the global player.
- `frontend/src/components/MiniAudioPlayer.tsx` appears on non-detail routes when a track exists.
- Playback state (play/pause, time, volume) persists across navigation.

## Video Playback
- `frontend/src/contexts/VideoPlayerContext.tsx` owns a single global `<video>` element.
- The video element is portaled into the active view so playback continues during navigation.
- `frontend/src/components/VideoWatchPage.tsx` sets the portal target for the full player.
- `frontend/src/components/MiniVideoPlayer.tsx` sets the portal target on non-detail routes and links back to the full video page.

## Upload Handling
- `backend/api/posts/create.php` sanitizes filenames and stores relative paths.
- `frontend/src/utils/media.ts` encodes each path segment so spaces and special characters load correctly.

## Troubleshooting
- Ensure the PHP server is running at `http://localhost:8000`.
- Confirm media paths in the database are relative (start with `uploads/`).
- If playback does not start, click the play button in the UI (browser autoplay policies).

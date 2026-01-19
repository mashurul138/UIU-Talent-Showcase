import { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { buildMediaUrl } from '../utils/media';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1478737270239-2f52b27e9088?w=800&auto=format&fit=crop';

const isMediaFile = (value?: string) => {
  if (!value) return false;
  return /\.(mp3|wav|flac|aac|ogg|mp4|mov|avi|webm)$/i.test(value);
};

const isImageFile = (value?: string) => {
  if (!value) return false;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(value);
};

const getCoverImage = (thumbnail?: string) => {
  if (!thumbnail || isMediaFile(thumbnail) || !isImageFile(thumbnail)) {
    return DEFAULT_COVER;
  }
  return buildMediaUrl(thumbnail);
};

const formatTime = (time: number) => {
  if (isNaN(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function MiniAudioPlayer() {
  const location = useLocation();
  const { track, isPlaying, currentTime, duration, togglePlay, toggleMute, isMuted, stop, seek } = useAudioPlayer();
  const progressRef = useRef<HTMLDivElement>(null);

  if (!track) return null;
  if (location.pathname.startsWith('/audio/')) return null;

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const coverImage = getCoverImage(track.thumbnail);

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = progressRef.current;
    if (!container || duration <= 0) return;
    const rect = container.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: '1.5rem',
        bottom: '1.5rem',
        width: 'min(360px, calc(100vw - 2rem))',
        zIndex: 60,
      }}
      className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="flex items-center gap-3 p-4">
        <Link to={`/audio/${track.id}`} className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={coverImage}
            alt={track.title}
            className="w-full object-cover"
            style={{ height: '100%' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_COVER;
            }}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link to={`/audio/${track.id}`} className="block">
            <div className="text-gray-900 truncate">{track.title}</div>
            <div className="text-gray-500 text-sm truncate">{track.authorName}</div>
          </Link>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-md transition hover:shadow-lg"
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </button>
            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center transition"
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={stop}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center transition"
              aria-label="Close mini player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div ref={progressRef} className="cursor-pointer" onClick={handleProgressClick}>
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-1 bg-teal-600" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

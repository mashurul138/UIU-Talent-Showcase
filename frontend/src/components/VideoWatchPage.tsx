import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward, ChevronLeft, Star } from 'lucide-react';
import { usePosts } from '../contexts/PostContext';
import type { Post } from '../types/auth';

type QualityOption = '1080p' | '720p' | '480p' | '360p';

export function VideoWatchPage() {
    const { id } = useParams();
    const { posts } = usePosts();

    // Derive video directly to avoid first-render null state
    const video = useMemo(() => {
        if (!id || posts.length === 0) return null;
        return posts.find(p => String(p.id) === String(id)) || null;
    }, [id, posts]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const progressContainerRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [currentQuality, setCurrentQuality] = useState<QualityOption>('1080p');
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    const qualities: QualityOption[] = ['1080p', '720p', '480p', '360p'];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        const handleTimeUpdate = () => setCurrentTime(videoEl.currentTime);
        const handleLoadedMetadata = () => setDuration(videoEl.duration);
        const handleEnded = () => setIsPlaying(false);

        videoEl.addEventListener('timeupdate', handleTimeUpdate);
        videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoEl.addEventListener('ended', handleEnded);

        return () => {
            videoEl.removeEventListener('timeupdate', handleTimeUpdate);
            videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
            videoEl.removeEventListener('ended', handleEnded);
        };
    }, [video]);

    useEffect(() => {
        let controlsTimeout: NodeJS.Timeout;

        if (showControls && isPlaying) {
            controlsTimeout = setTimeout(() => setShowControls(false), 3000);
        }

        return () => clearTimeout(controlsTimeout);
    }, [showControls, isPlaying]);

    const togglePlay = () => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        if (isPlaying) {
            videoEl.pause();
        } else {
            videoEl.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = progressContainerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const videoEl = videoRef.current;

        if (videoEl) {
            videoEl.currentTime = percentage * videoEl.duration;
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);

        const videoEl = videoRef.current;
        if (videoEl) {
            videoEl.volume = newVolume;
            videoEl.muted = newVolume === 0;
        }
    };

    const toggleMute = () => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        if (isMuted) {
            videoEl.muted = false;
            videoEl.volume = volume || 1;
            setIsMuted(false);
        } else {
            videoEl.muted = true;
            setIsMuted(true);
        }
    };

    const toggleFullscreen = () => {
        const container = videoRef.current?.parentElement;
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const skipBackward = () => {
        const videoEl = videoRef.current;
        if (videoEl) {
            videoEl.currentTime = Math.max(0, videoEl.currentTime - 10);
        }
    };

    const skipForward = () => {
        const videoEl = videoRef.current;
        if (videoEl) {
            videoEl.currentTime = Math.min(duration, videoEl.currentTime + 10);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Handle loading state
    if (posts.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-gray-900">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-medium">Loading video...</h2>
                </div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-gray-900">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
                    <h2 className="text-2xl font-bold mb-4">Video not found</h2>
                    <p className="text-gray-500 mb-6 max-w-md">The video you're looking for doesn't exist or has been removed from our database.</p>
                    <Link to="/video" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-200">
                        Return to Video Portal
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <div className="flex items-center">
                <Link to="/video" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-medium">Back to Portal</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div
                        className="relative bg-black rounded-2xl overflow-hidden group shadow-2xl aspect-video"
                        onMouseEnter={() => setShowControls(true)}
                        onMouseLeave={() => isPlaying && setShowControls(false)}
                    >
                        <video
                            ref={videoRef}
                            src={video.thumbnail}
                            poster={video.thumbnail}
                            className="w-full h-full object-contain"
                            onClick={togglePlay}
                        />

                        {!isPlaying && (
                            <button
                                onClick={togglePlay}
                                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                            >
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                                    <Play className="w-10 h-10 text-white fill-white ml-1" />
                                </div>
                            </button>
                        )}

                        <div
                            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between text-white text-xs">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>

                                <div
                                    ref={progressContainerRef}
                                    className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress"
                                    onClick={handleProgressClick}
                                >
                                    <div
                                        className="absolute inset-y-0 left-0 bg-orange-600 rounded-full transition-all"
                                        style={{ width: `${progressPercentage}%` }}
                                    >
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-orange-600 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={skipBackward}
                                            className="p-2 text-white hover:text-orange-500 transition-colors"
                                            title="Skip back 10s"
                                        >
                                            <SkipBack className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={togglePlay}
                                            className="p-2 text-white hover:text-orange-500 transition-colors"
                                        >
                                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                                        </button>

                                        <button
                                            onClick={skipForward}
                                            className="p-2 text-white hover:text-orange-500 transition-colors"
                                            title="Skip forward 10s"
                                        >
                                            <SkipForward className="w-5 h-5" />
                                        </button>

                                        <div className="relative flex items-center gap-2">
                                            <button
                                                onClick={toggleMute}
                                                onMouseEnter={() => setShowVolumeSlider(true)}
                                                onMouseLeave={() => setShowVolumeSlider(false)}
                                                className="p-2 text-white hover:text-orange-500 transition-colors"
                                            >
                                                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                            </button>

                                            <div
                                                className={`absolute bottom-full left-0 mb-2 px-2 bg-black/90 rounded-lg transition-all duration-200 ${showVolumeSlider ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                                                onMouseEnter={() => setShowVolumeSlider(true)}
                                                onMouseLeave={() => setShowVolumeSlider(false)}
                                            >
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.1"
                                                    value={isMuted ? 0 : volume}
                                                    onChange={handleVolumeChange}
                                                    className="w-20 h-1 accent-orange-600"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowQualityMenu(!showQualityMenu)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs text-white hover:text-orange-500 transition-colors rounded"
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span>{currentQuality}</span>
                                            </button>

                                            {showQualityMenu && (
                                                <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-sm rounded-lg overflow-hidden min-w-[80px]">
                                                    {qualities.map((quality) => (
                                                        <button
                                                            key={quality}
                                                            onClick={() => {
                                                                setCurrentQuality(quality);
                                                                setShowQualityMenu(false);
                                                            }}
                                                            className={`block w-full px-3 py-2 text-xs text-left text-white hover:bg-orange-600 transition-colors ${currentQuality === quality ? 'bg-orange-600' : ''}`}
                                                        >
                                                            {quality}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={toggleFullscreen}
                                            className="p-2 text-white hover:text-orange-500 transition-colors"
                                            title="Fullscreen"
                                        >
                                            <Maximize className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Video Metadata */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-orange-500">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h1>
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-orange-600 font-bold text-xl">{video.authorName[0]}</span>
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{video.authorName}</div>
                                    <div className="text-sm text-gray-500">{video.authorRole}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-1 text-orange-500">
                                    <Star className="w-5 h-5 fill-current" />
                                    <span className="font-bold">{video.rating}</span>
                                </div>
                                <div className="text-gray-500">{video.views.toLocaleString()} views</div>
                            </div>
                        </div>
                        <p className="text-gray-600">
                            Uploaded on {new Date(video.uploadDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Sidebar/Suggestions */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 px-2">Up Next</h3>
                    <div className="space-y-4">
                        {posts
                            .filter(p => p.type === 'video' && String(p.id) !== String(id))
                            .slice(0, 5)
                            .map(v => (
                                <Link
                                    key={v.id}
                                    to={`/video/${v.id}`}
                                    className="flex gap-3 group"
                                >
                                    <div className="w-40 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">{v.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{v.authorName}</p>
                                        <p className="text-xs text-gray-400">{v.views.toLocaleString()} views</p>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

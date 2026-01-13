import { useState, useEffect, useRef } from 'react';
import { X, Camera, Mic, PenTool, CheckCircle2, AlertCircle } from 'lucide-react';

interface InteractiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'video' | 'audio' | 'blog';
}

export function InteractiveModal({ isOpen, onClose, type }: InteractiveModalProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [blogContent, setBlogContent] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const activeStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (!isOpen) {
            stopMedia();
            return;
        }

        if (type !== 'blog') {
            // Short delay to ensure browser doesn't block "pop-up" logic
            const timer = setTimeout(() => {
                startMedia();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen, type]);

    // Attach stream to video element
    useEffect(() => {
        if (videoRef.current && stream && type === 'video') {
            videoRef.current.srcObject = stream;
        }
    }, [stream, type]);

    const startMedia = async () => {
        console.log(`[InteractiveModal] Requesting hardware for: ${type}`);

        // Cleanup any existing stream first
        stopMedia();

        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Media hardware access is not supported in this browser. Please ensure you are using HTTPS.');
            }

            const constraints: MediaStreamConstraints = type === 'video'
                ? { video: { width: 1280, height: 720 }, audio: true }
                : { audio: true, video: false };

            const newStream = await navigator.mediaDevices.getUserMedia(constraints);

            activeStreamRef.current = newStream;
            setStream(newStream);
            setError(null);
        } catch (err: any) {
            console.error('[InteractiveModal] Media access failed:', err);

            let message = 'Could not access hardware. Please check your browser settings.';
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                message = 'Permissions were denied. Please click the camera/mic icon in your address bar to reset permissions.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                message = `No ${type === 'video' ? 'camera' : 'microphone'} found on this device.`;
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                message = 'Your hardware is already in use by another application.';
            }

            setError(message);
        }
    };

    const stopMedia = () => {
        if (activeStreamRef.current) {
            console.log('[InteractiveModal] Stopping hardware tracks');
            activeStreamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log(`[InteractiveModal] Stopped track: ${track.kind}`);
            });
            activeStreamRef.current = null;
        }
        setStream(null);
    };

    const handleClose = () => {
        stopMedia();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type === 'video' ? 'bg-orange-100 text-orange-600' :
                            type === 'audio' ? 'bg-teal-100 text-teal-600' :
                                'bg-indigo-100 text-indigo-600'
                            }`}>
                            {type === 'video' ? <Camera className="w-5 h-5" /> :
                                type === 'audio' ? <Mic className="w-5 h-5" /> :
                                    <PenTool className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {type === 'video' ? 'Start Broadcast' :
                                    type === 'audio' ? 'Start Recording' :
                                        'Write Blog'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {type === 'video' ? 'Going live on the platform' :
                                    type === 'audio' ? 'Recording your voice' :
                                        'Share your thoughts with the community'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-6 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-red-900 dark:text-red-400 mb-2">Access Error</h3>
                            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
                            <button
                                onClick={startMedia}
                                className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                            >
                                Retry Access
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {type === 'video' && (
                                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-inner ring-1 ring-black/5">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                    {!stream && !error && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/50 text-white p-6 text-center">
                                            <Camera className="w-12 h-12 mb-4 opacity-50" />
                                            <p className="mb-4">Camera access required</p>
                                            <button
                                                onClick={startMedia}
                                                className="px-6 py-2 bg-orange-600 rounded-xl font-bold hover:bg-orange-700 transition-colors"
                                            >
                                                Allow Camera
                                            </button>
                                        </div>
                                    )}
                                    {stream && (
                                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                            LIVE PREVIEW
                                        </div>
                                    )}
                                </div>
                            )}

                            {type === 'audio' && (
                                <div className="text-center py-12 bg-teal-50 dark:bg-teal-900/10 rounded-2xl border-2 border-dashed border-teal-200 dark:border-teal-800/50">
                                    <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-500 ${stream ? 'bg-teal-600 text-white scale-110 shadow-lg shadow-teal-500/20' : 'bg-teal-100 text-teal-600'
                                        }`}>
                                        <Mic className={`w-12 h-12 ${stream ? 'animate-bounce' : ''}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {stream ? 'Microphone Active' : 'Connecting Microphone...'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        {stream ? 'Your audio is being captured' : 'Please allow microphone access when prompted'}
                                    </p>

                                    {!stream && !error && (
                                        <button
                                            onClick={startMedia}
                                            className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors"
                                        >
                                            Allow Microphone
                                        </button>
                                    )}

                                    {stream && (
                                        <div className="mt-8 flex justify-center gap-1">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                                <div
                                                    key={i}
                                                    className="w-1.5 bg-teal-600 rounded-full animate-wave"
                                                    style={{
                                                        height: '24px',
                                                        animationDelay: `${i * 0.1}s`
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {type === 'blog' && (
                                <div className="space-y-4">
                                    <textarea
                                        autoFocus
                                        placeholder="Start typing your story here..."
                                        className="w-full h-64 p-6 bg-gray-50 dark:bg-zinc-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600 dark:text-white dark:placeholder-gray-500 text-lg resize-none"
                                        value={blogContent}
                                        onChange={(e) => setBlogContent(e.target.value)}
                                    />
                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                        <span>{blogContent.length} characters</span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Auto-saved
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-6 py-1.5 text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!stream && type !== 'blog' || (type === 'blog' && !blogContent.trim())}
                        className={`px-6 py-1.5 font-bold transition-all transform rounded-lg active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed ${type === 'video' ? 'text-orange-600 hover:bg-orange-50' :
                            type === 'audio' ? 'text-teal-600 hover:bg-teal-50' :
                                'text-indigo-600 hover:bg-indigo-50'
                            }`}
                    >
                        {type === 'video' ? 'Start Streaming' :
                            type === 'audio' ? 'Start Recording' :
                                'Publish Blog'}
                    </button>
                </div>
            </div>
        </div>
    );
}

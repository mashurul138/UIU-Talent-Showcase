import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Check, AlertCircle, FileText, Video, Mic } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostContext';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialType?: 'video' | 'audio' | 'blog';
}

export function UploadModal({ isOpen, onClose, initialType = 'video' }: UploadModalProps) {
    const { user } = useAuth();
    const { addPost } = usePosts();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState(''); // Mock file upload
    const [duration, setDuration] = useState('');
    const [type, setType] = useState(initialType);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Theme mapping
    const themeStyles = {
        video: {
            text: 'text-orange-600',
            icon: 'text-orange-500',
            bg: 'bg-orange-600',
            bgLight: 'bg-orange-50 dark:bg-orange-900/20',
            bgIcon: 'bg-orange-100 dark:bg-orange-900/40',
            border: 'border-orange-500',
            ring: 'focus:ring-orange-500',
            shadow: 'shadow-orange-500/30',
            hover: 'hover:bg-orange-700',
            hoverBorder: 'hover:border-orange-300'
        },
        audio: {
            text: 'text-teal-600',
            icon: 'text-teal-500',
            bg: 'bg-teal-600',
            bgLight: 'bg-teal-50 dark:bg-teal-900/20',
            bgIcon: 'bg-teal-100 dark:bg-teal-900/40',
            border: 'border-teal-500',
            ring: 'focus:ring-teal-500',
            shadow: 'shadow-teal-500/30',
            hover: 'hover:bg-teal-700',
            hoverBorder: 'hover:border-teal-300'
        },
        blog: {
            text: 'text-indigo-600',
            icon: 'text-indigo-500',
            bg: 'bg-indigo-600',
            bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
            bgIcon: 'bg-indigo-100 dark:bg-indigo-900/40',
            border: 'border-indigo-500',
            ring: 'focus:ring-indigo-500',
            shadow: 'shadow-indigo-500/30',
            hover: 'hover:bg-indigo-700',
            hoverBorder: 'hover:border-indigo-300'
        }
    };

    const s = themeStyles[type];

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setType(initialType);
            setTitle('');
            setDescription('');
            setLink('');
            setDuration('');
            setSuccess(false);
            setIsSubmitting(false);
        }
    }, [isOpen, initialType]);

    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root') || document.body;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);

        // Simulate upload delay
        setTimeout(() => {
            addPost({
                title,
                authorId: user.id,
                authorName: user.name,
                authorRole: user.role,
                type,
                thumbnail: `https://images.unsplash.com/photo-${type === 'video' ? '1498050108023-c5249f4df085' : type === 'audio' ? '1478737270239-2f02b77fc618' : '1486312338219-ce68d2c6f44d'}?w=400`,
                description,
                link,
                duration: (type === 'video' || type === 'audio') ? (duration || '10:00') : undefined,
            });

            setIsSubmitting(false);
            setSuccess(true);

            // Auto close after success
            setTimeout(() => {
                onClose();
            }, 2000);
        }, 1500);
    };

    return createPortal(
        <div
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999
            }}
        >
            <div
                className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 dark:border-zinc-800 transform transition-all animate-in fade-in zoom-in-95 duration-200 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Upload className={`w-5 h-5 ${s.icon}`} />
                        Submit New {type.charAt(0).toUpperCase() + type.slice(1)}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {success ? (
                        <div className="text-center py-8 animate-in fade-in zoom-in">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Request Submitted!</h3>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                Your post has been sent to the admin for approval.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Type Selection */}
                            {/* Type Selection - Horizontal Icon Grid */}
                            <div className="flex items-center gap-4 justify-center py-2">
                                {[
                                    { id: 'video', icon: Video, label: 'Video' },
                                    { id: 'audio', icon: Mic, label: 'Audio' },
                                    { id: 'blog', icon: FileText, label: 'Blog' }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setType(item.id as any)}
                                        className={`flex flex-col items-center justify-center gap-2 p-4 w-28 rounded-lg transition-all duration-200 group ${type === item.id
                                            ? `${s.bgLight} ${s.text} shadow-md transform scale-105`
                                            : `bg-white dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800`
                                            }`}
                                    >
                                        <div className="p-1.5 transition-colors">
                                            <item.icon className={`w-8 h-8 ${type === item.id ? s.text : `text-zinc-400 group-hover:${themeStyles[item.id as keyof typeof themeStyles].text}`}`} />
                                        </div>
                                        <span className={`font-bold text-sm ${type === item.id ? s.text : 'text-zinc-500'}`}>{item.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 ${s.ring} focus:border-transparent outline-none transition-all`}
                                    placeholder="Enter a catchy title..."
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 ${s.ring} focus:border-transparent outline-none transition-all min-h-[100px]`}
                                    placeholder="What is this content about?"
                                />
                            </div>

                            {/* Link / File Mock */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Content URL / File</label>
                                <input
                                    type="text" // Simplified for mock
                                    required
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 ${s.ring} focus:border-transparent outline-none transition-all`}
                                    placeholder="Paste a link or 'upload' URL..."
                                />
                            </div>

                            {/* Duration (Conditional) */}
                            {(type === 'video' || type === 'audio') && (
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Duration (MM:SS)</label>
                                    <input
                                        type="text"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className={`w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 ${s.ring} focus:border-transparent outline-none transition-all`}
                                        placeholder="e.g. 05:30"
                                    />
                                </div>
                            )}

                            {/* Info Note */}
                            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p>
                                    Your post will be reviewed by an admin before it becomes visible on the platform.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-2 font-bold transition-all transform rounded-lg active:scale-90 ${isSubmitting
                                    ? 'text-zinc-400 cursor-not-allowed'
                                    : `${s.text} ${s.bgLight} hover:scale-[1.02]`
                                    }`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>,
        modalRoot
    );
}


export function BackgroundAnimation() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Warm Orange Blob */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-400/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" />

            {/* Soft Rose Blob */}
            <div className="absolute top-0 -right-4 w-72 h-72 bg-rose-400/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />

            {/* Bright Amber Blob */}
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-amber-300/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000" />

            {/* Extra floating accent for depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse" />
        </div>
    );
}

import React from 'react';

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-zinc-200 dark:bg-zinc-800 ${className || ''}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent" />
  </div>
);

export default function TrackOrderLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full space-y-10 font-sans">
      {/* Header Title Skeleton */}
      <div className="text-center space-y-3">
        <SkeletonBlock className="h-3 w-32 mx-auto rounded-full" />
        <SkeletonBlock className="h-10 w-72 mx-auto rounded-xl" />
        <SkeletonBlock className="h-8 w-full max-w-md mx-auto rounded-xl" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
        <SkeletonBlock className="h-12 flex-1 rounded-full" />
        <SkeletonBlock className="h-12 w-32 rounded-full shrink-0" />
      </div>

      {/* Sample Order Card Skeleton */}
      <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 bg-white dark:bg-zinc-900/50 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
          <SkeletonBlock className="h-4 w-36 rounded-full" />
          <SkeletonBlock className="h-7 w-28 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-12 w-10 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <SkeletonBlock className="h-3 w-1/2 rounded-full" />
            <SkeletonBlock className="h-2 w-1/3 rounded-full" />
          </div>
        </div>
        <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3 flex justify-between items-center">
          <SkeletonBlock className="h-3 w-20 rounded-full" />
          <SkeletonBlock className="h-4 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}
import React from 'react';

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-zinc-200 dark:bg-zinc-800 ${className || ''}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent" />
  </div>
);

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden font-sans"
        >
          {/* Image Frame Skeleton */}
          <SkeletonBlock className="aspect-[3/4] w-full" />

          {/* Card Info Content Skeleton */}
          <div className="flex flex-col flex-1 p-4 space-y-4">
            <div className="space-y-2">
              <SkeletonBlock className="h-2 w-1/3 rounded-full" />
              <SkeletonBlock className="h-3 w-3/4 rounded-full" />
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center">
              <SkeletonBlock className="h-3 w-1/4 rounded-full" />
              <SkeletonBlock className="h-2 w-1/5 rounded-full" />
            </div>

            <div className="grid grid-cols-5 gap-2 pt-2 mt-auto">
              <SkeletonBlock className="col-span-3 h-8 rounded-full" />
              <SkeletonBlock className="col-span-2 h-8 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
import React from 'react';

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-zinc-200 dark:bg-zinc-800 ${className || ''}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent" />
  </div>
);

export default function ContactLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full space-y-10 font-sans">
      {/* Back Link Skeleton */}
      <SkeletonBlock className="h-4 w-28 rounded-full" />

      {/* Header Skeleton */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <SkeletonBlock className="h-3 w-32 mx-auto rounded-full" />
        <SkeletonBlock className="h-10 w-64 mx-auto rounded-xl" />
        <SkeletonBlock className="h-8 w-full mx-auto rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Info Cards Skeleton */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <SkeletonBlock className="h-3 w-28 rounded-full" />
            <div className="space-y-4">
              <SkeletonBlock className="h-10 w-full rounded-xl" />
              <SkeletonBlock className="h-10 w-full rounded-xl" />
              <SkeletonBlock className="h-10 w-full rounded-xl" />
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-2">
            <SkeletonBlock className="h-4 w-40 rounded-full" />
            <SkeletonBlock className="h-12 w-full rounded-xl" />
          </div>
        </div>

        {/* Right Side Form Skeleton */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <SkeletonBlock className="h-3 w-32 rounded-full mb-2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SkeletonBlock className="h-11 w-full rounded-full" />
            <SkeletonBlock className="h-11 w-full rounded-full" />
          </div>
          <SkeletonBlock className="h-11 w-full rounded-full" />
          <SkeletonBlock className="h-32 w-full rounded-2xl" />
          <SkeletonBlock className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
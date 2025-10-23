'use client';

import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Thumbnail skeleton */}
      <Skeleton className="w-full h-48" />

      {/* Content skeleton */}
      <div className="p-4">
        {/* Prompt text */}
        <Skeleton className="w-full h-4 mb-2" variant="text" />
        <Skeleton className="w-3/4 h-4 mb-3" variant="text" />

        {/* Badges */}
        <div className="flex gap-2 mb-3">
          <Skeleton className="w-20 h-6" />
          <Skeleton className="w-16 h-6" />
        </div>

        {/* Date */}
        <Skeleton className="w-32 h-3 mb-3" variant="text" />

        {/* Action buttons */}
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-9" />
          <Skeleton className="flex-1 h-9" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
};

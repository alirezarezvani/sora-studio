'use client';

import React, { useState } from 'react';
import { VideoCard } from './VideoCard';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { VideoJob } from '@/types';
import { useDeleteVideo } from '@/hooks/useVideos';

interface VideoGalleryProps {
  videos: VideoJob[];
  isLoading?: boolean;
}

type StatusFilter = 'all' | 'completed' | 'in_progress' | 'failed';
type SortOrder = 'newest' | 'oldest';

export const VideoGallery: React.FC<VideoGalleryProps> = ({ videos, isLoading }) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const deleteVideo = useDeleteVideo();

  // Filter videos
  const filteredVideos = videos.filter((video) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'in_progress') {
      return video.status === 'queued' || video.status === 'in_progress';
    }
    return video.status === statusFilter;
  });

  // Sort videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortOrder === 'newest') {
      return b.created_at - a.created_at;
    }
    return a.created_at - b.created_at;
  });

  const handleDelete = async (videoId: string) => {
    try {
      await deleteVideo.mutateAsync(videoId);
    } catch (error) {
      alert('Failed to delete video. Please try again.');
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="w-full h-48 bg-gray-300" />
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded mb-2" />
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-3" />
              <div className="flex gap-2">
                <div className="h-6 bg-gray-300 rounded w-20" />
                <div className="h-6 bg-gray-300 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Select
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            options={[
              { value: 'all', label: 'All Videos' },
              { value: 'completed', label: 'Completed' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'failed', label: 'Failed' },
            ]}
          />
        </div>
        <div className="flex-1">
          <Select
            label="Sort By"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
            ]}
          />
        </div>
      </div>

      {/* Video Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {sortedVideos.length} of {videos.length} videos
        </p>
      </div>

      {/* Empty State */}
      {sortedVideos.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
          <p className="text-gray-600 mb-4">
            {statusFilter !== 'all'
              ? `No ${statusFilter} videos to display`
              : 'Get started by creating your first video'}
          </p>
          {statusFilter !== 'all' && (
            <Button variant="secondary" onClick={() => setStatusFilter('all')}>
              Show All Videos
            </Button>
          )}
        </div>
      )}

      {/* Video Grid */}
      {sortedVideos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedVideos.map((video) => (
            <VideoCard key={video.id} video={video} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

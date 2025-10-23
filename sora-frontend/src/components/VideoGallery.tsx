'use client';

import React, { useState } from 'react';
import { VideoCard } from './VideoCard';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { VideoJob } from '@/types';
import { useDeleteVideo } from '@/hooks/useVideos';
import { SkeletonCard } from './ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import { Video } from 'lucide-react';

interface VideoGalleryProps {
  videos: VideoJob[];
  isLoading?: boolean;
  onRemixCreated?: (video: VideoJob) => void;
}

type StatusFilter = 'all' | 'completed' | 'in_progress' | 'failed';
type ModelFilter = 'all' | 'sora-2' | 'sora-2-pro';
type SortOrder = 'newest' | 'oldest' | 'cost_high' | 'cost_low';

export const VideoGallery: React.FC<VideoGalleryProps> = ({ videos, isLoading, onRemixCreated }) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modelFilter, setModelFilter] = useState<ModelFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const deleteVideo = useDeleteVideo();
  const toast = useToast();
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

  // Filter videos
  const filteredVideos = videos.filter((video) => {
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'in_progress') {
        if (video.status !== 'queued' && video.status !== 'in_progress') return false;
      } else if (video.status !== statusFilter) {
        return false;
      }
    }

    // Model filter
    if (modelFilter !== 'all' && video.model !== modelFilter) {
      return false;
    }

    return true;
  });

  // Sort videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortOrder) {
      case 'newest':
        return b.created_at - a.created_at;
      case 'oldest':
        return a.created_at - b.created_at;
      case 'cost_high':
        return (b.cost || 0) - (a.cost || 0);
      case 'cost_low':
        return (a.cost || 0) - (b.cost || 0);
      default:
        return b.created_at - a.created_at;
    }
  });

  const handleDelete = async (videoId: string) => {
    try {
      await deleteVideo.mutateAsync(videoId);
      toast.success('Video deleted successfully');
    } catch (error) {
      toast.error('Failed to delete video. Please try again.');
    }
  };

  const handleRemix = (remixedVideo: VideoJob) => {
    toast.success('Remix created! Find it in your video gallery.');
    if (onRemixCreated) {
      onRemixCreated(remixedVideo);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-gray-600">Loading your videos...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
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
              { value: 'all', label: 'All Status' },
              { value: 'completed', label: 'Completed' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'failed', label: 'Failed' },
            ]}
          />
        </div>
        <div className="flex-1">
          <Select
            label="Filter by Model"
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value as ModelFilter)}
            options={[
              { value: 'all', label: 'All Models' },
              { value: 'sora-2', label: 'Sora 2 (Fast)' },
              { value: 'sora-2-pro', label: 'Sora 2 Pro (Quality)' },
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
              { value: 'cost_high', label: 'Cost (High to Low)' },
              { value: 'cost_low', label: 'Cost (Low to High)' },
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
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-primary-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-md">
            <Video className="w-12 h-12 text-primary-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {statusFilter !== 'all' ? 'No matching videos' : 'No videos yet'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {statusFilter !== 'all'
              ? `No ${statusFilter === 'in_progress' ? 'videos in progress' : statusFilter + ' videos'} to display`
              : 'Create your first AI-generated video using the form above'}
          </p>
          {isMockMode && statusFilter === 'all' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-700">
                Demo Mode: Try creating a video to see the complete flow!
              </span>
            </div>
          )}
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
            <VideoCard key={video.id} video={video} onDelete={handleDelete} onRemix={handleRemix} />
          ))}
        </div>
      )}
    </div>
  );
};

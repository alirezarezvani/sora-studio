'use client';

import React from 'react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { VideoJob } from '@/types';
import { useVideoPolling } from '@/hooks/useVideoPolling';
import { videoApi } from '@/lib/api/videos';

interface VideoStatusProps {
  video: VideoJob;
  onDelete?: () => void;
  showActions?: boolean;
  autoRefresh?: boolean;
}

export const VideoStatus: React.FC<VideoStatusProps> = ({
  video,
  onDelete,
  showActions = true,
  autoRefresh = true,
}) => {
  // Auto-refresh when video is pending
  useVideoPolling(video, autoRefresh);

  const getStatusBadge = () => {
    const statusConfig = {
      queued: { variant: 'warning' as const, text: 'Queued' },
      in_progress: { variant: 'info' as const, text: 'In Progress' },
      completed: { variant: 'success' as const, text: 'Completed' },
      failed: { variant: 'danger' as const, text: 'Failed' },
    };

    const config = statusConfig[video.status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getElapsedTime = () => {
    const createdTime = video.created_at * 1000; // Convert to milliseconds
    const now = Date.now();
    const elapsed = Math.floor((now - createdTime) / 1000); // seconds

    if (elapsed < 60) return `${elapsed}s ago`;
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`;
    return `${Math.floor(elapsed / 3600)}h ago`;
  };

  const handleDownload = () => {
    const downloadUrl = videoApi.getDownloadUrl(video.id);
    window.open(downloadUrl, '_blank');
  };

  const isPending = video.status === 'queued' || video.status === 'in_progress';
  const isCompleted = video.status === 'completed';
  const isFailed = video.status === 'failed';

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getStatusBadge()}
            <Badge variant="default">{video.model}</Badge>
          </div>
          <p className="text-xs text-gray-500">
            ID: {video.id.slice(0, 12)}... • {getElapsedTime()}
          </p>
        </div>

        {/* Spinner for in-progress */}
        {isPending && (
          <div className="ml-2">
            <svg
              className="animate-spin h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Prompt */}
      <div className="mb-3">
        <p className="text-sm text-gray-700 line-clamp-2">{video.prompt || 'No prompt provided'}</p>
      </div>

      {/* Progress Bar (for in-progress videos) */}
      {isPending && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${video.progress || 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {video.status === 'queued' ? 'Waiting in queue...' : `Processing... ${video.progress || 0}%`}
          </p>
        </div>
      )}

      {/* Error Message */}
      {isFailed && video.error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-700">
            <strong>Error:</strong> {video.error.message}
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        {video.seconds && <span>{video.seconds}s</span>}
        {video.size && <span>{video.size}</span>}
        {video.completed_at && (
          <span>Completed {new Date(video.completed_at * 1000).toLocaleString()}</span>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          {isCompleted && (
            <Button size="sm" variant="primary" onClick={handleDownload}>
              Download
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="danger" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

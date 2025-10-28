'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { VideoJob } from '@/types';
import { videoApi } from '@/lib/api/videos';
import { useToast } from '@/hooks/useToast';

interface VideoCardProps {
  video: VideoJob;
  onDelete?: (id: string) => void;
  onRemix?: (remixedVideo: VideoJob) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onDelete, onRemix }) => {
  const toast = useToast();
  const [isRemixing, setIsRemixing] = useState(false);
  const [showRemixDialog, setShowRemixDialog] = useState(false);
  const [remixPrompt, setRemixPrompt] = useState('');
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

  const getStatusBadge = () => {
    const statusConfig = {
      queued: { variant: 'warning' as const, text: 'Queued' },
      in_progress: { variant: 'info' as const, text: 'In Progress' },
      completed: { variant: 'success' as const, text: 'Completed' },
      failed: { variant: 'danger' as const, text: 'Failed' },
      deleted: { variant: 'secondary' as const, text: 'Expired' },
    };

    const config = statusConfig[video.status] || { variant: 'secondary' as const, text: video.status || 'Unknown' };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return 'No prompt provided';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMockMode) {
      toast.info('Demo Mode: In a real environment, the video file would download now.');
      return;
    }

    const downloadUrl = videoApi.getDownloadUrl(video.id);
    window.open(downloadUrl, '_blank');
    toast.success('Download started!');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && confirm('Are you sure you want to delete this video?')) {
      onDelete(video.id);
    }
  };

  const handleRemix = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRemixDialog(true);
  };

  const submitRemix = async () => {
    if (!remixPrompt || remixPrompt.length < 10) {
      toast.error('Remix prompt must be at least 10 characters');
      return;
    }

    setIsRemixing(true);
    setShowRemixDialog(false);

    try {
      const remixedVideo = await videoApi.remix(video.id, { prompt: remixPrompt });
      toast.success('Remix video created successfully!');
      setRemixPrompt('');

      if (onRemix) {
        onRemix(remixedVideo);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remix video');
    } finally {
      setIsRemixing(false);
    }
  };

  return (
    <Link href={`/videos/${video.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden animate-slide-up hover:scale-[1.02]">
        {/* Thumbnail Placeholder */}
        <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <svg
                className="w-16 h-16 text-primary-400 mx-auto mb-2"
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
              <p className="text-sm text-primary-600 font-medium">
                {video.status === 'in_progress' ? 'Generating...' : 'Video'}
              </p>
            </div>
          )}

          {/* Status Badge Overlay */}
          <div className="absolute top-2 right-2">{getStatusBadge()}</div>

          {/* In-progress indicator */}
          {video.status === 'in_progress' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${video.progress || 0}%` }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Prompt */}
          <p className="text-sm text-gray-700 mb-3 line-clamp-2 min-h-[40px]">
            {truncateText(video.prompt || '', 100)}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant="default">{video.model}</Badge>
            {video.seconds && <span className="text-xs text-gray-500">{video.seconds}s</span>}
            {video.size && <span className="text-xs text-gray-500">{video.size}</span>}
          </div>

          {/* Date */}
          <p className="text-xs text-gray-500 mb-3">
            Created: {formatDate(video.created_at)}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            {video.status === 'completed' && (
              <>
                <Button size="sm" variant="primary" onClick={handleDownload} className="flex-1">
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleRemix}
                  className="flex-1"
                  disabled={isRemixing}
                >
                  {isRemixing ? 'Remixing...' : 'Remix'}
                </Button>
              </>
            )}
            <Button size="sm" variant="ghost" onClick={handleDelete} className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Remix Dialog */}
      {showRemixDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowRemixDialog(false);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Remix Video</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create a variation of this video with a new prompt
            </p>

            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
              rows={4}
              placeholder="Enter your remix prompt..."
              value={remixPrompt}
              onChange={(e) => setRemixPrompt(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />

            <p className="text-xs text-gray-500 mb-4 mt-1">{remixPrompt.length}/500 characters (min 10)</p>

            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  submitRemix();
                }}
                disabled={remixPrompt.length < 10}
                className="flex-1"
              >
                Create Remix
              </Button>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowRemixDialog(false);
                  setRemixPrompt('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};

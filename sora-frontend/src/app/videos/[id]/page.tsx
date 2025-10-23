'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useVideo, useDeleteVideo, useRemixVideo } from '@/hooks/useVideos';
import { useVideoPolling } from '@/hooks/useVideoPolling';
import { videoApi } from '@/lib/api/videos';

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const { data: video, isLoading } = useVideo(videoId);
  const deleteVideo = useDeleteVideo();
  const remixVideo = useRemixVideo();

  const [isRemixing, setIsRemixing] = useState(false);
  const [remixPrompt, setRemixPrompt] = useState('');

  // Auto-refresh when video is pending
  useVideoPolling(video, true);

  const handleDownload = () => {
    const downloadUrl = videoApi.getDownloadUrl(videoId);
    window.open(downloadUrl, '_blank');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await deleteVideo.mutateAsync(videoId);
      router.push('/dashboard');
    } catch (error) {
      alert('Failed to delete video. Please try again.');
    }
  };

  const handleRemix = async () => {
    if (!remixPrompt.trim()) {
      alert('Please enter a prompt for the remix');
      return;
    }

    try {
      await remixVideo.mutateAsync({ videoId, prompt: remixPrompt });
      alert('Remix video created successfully!');
      router.push('/dashboard');
    } catch (error) {
      alert('Failed to create remix. Please try again.');
    }
  };

  const getStatusBadge = () => {
    if (!video) return null;

    const statusConfig = {
      queued: { variant: 'warning' as const, text: 'Queued' },
      in_progress: { variant: 'info' as const, text: 'In Progress' },
      completed: { variant: 'success' as const, text: 'Completed' },
      failed: { variant: 'danger' as const, text: 'Failed' },
    };

    const config = statusConfig[video.status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading video details...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Video not found</h2>
          <p className="text-gray-600 mb-4">The video you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const isPending = video.status === 'queued' || video.status === 'in_progress';
  const isCompleted = video.status === 'completed';
  const isFailed = video.status === 'failed';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player / Placeholder */}
            <Card padding="none">
              <div className="w-full aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                {isCompleted && video.file_url ? (
                  <video
                    src={video.file_url}
                    controls
                    className="w-full h-full"
                    poster={video.thumbnail_url}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : isPending ? (
                  <div className="text-center">
                    <svg
                      className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4"
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
                    <p className="text-primary-700 font-medium">
                      {video.status === 'queued' ? 'Waiting in queue...' : 'Generating video...'}
                    </p>
                    <p className="text-sm text-primary-600 mt-2">
                      This may take several minutes
                    </p>
                    {video.progress > 0 && (
                      <div className="mt-4 w-64 mx-auto">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${video.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{video.progress}% complete</p>
                      </div>
                    )}
                  </div>
                ) : isFailed ? (
                  <div className="text-center px-4">
                    <svg
                      className="w-12 h-12 text-red-500 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-red-700 font-medium">Video generation failed</p>
                    {video.error && (
                      <p className="text-sm text-red-600 mt-2">{video.error.message}</p>
                    )}
                  </div>
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
                    <p className="text-primary-600">Video Preview</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Prompt */}
            <Card>
              <CardHeader>
                <CardTitle>Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {video.prompt || 'No prompt provided'}
                </p>
              </CardContent>
            </Card>

            {/* Remix Section */}
            {isCompleted && (
              <Card>
                <CardHeader>
                  <CardTitle>Remix This Video</CardTitle>
                </CardHeader>
                <CardContent>
                  {!isRemixing ? (
                    <Button variant="secondary" onClick={() => setIsRemixing(true)}>
                      Create Remix
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Prompt
                        </label>
                        <textarea
                          rows={4}
                          value={remixPrompt}
                          onChange={(e) => setRemixPrompt(e.target.value)}
                          placeholder="Enter your modified prompt..."
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          onClick={handleRemix}
                          isLoading={remixVideo.isPending}
                        >
                          Generate Remix
                        </Button>
                        <Button variant="ghost" onClick={() => setIsRemixing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge()}

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
                    {isCompleted && (
                      <Button variant="primary" onClick={handleDownload} className="w-full">
                        Download Video
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      onClick={handleDelete}
                      isLoading={deleteVideo.isPending}
                      className="w-full"
                    >
                      Delete Video
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata Card */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Video ID</dt>
                    <dd className="text-gray-900 font-mono text-xs break-all">{video.id}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Model</dt>
                    <dd className="text-gray-900">
                      <Badge variant="default">{video.model}</Badge>
                    </dd>
                  </div>
                  {video.seconds && (
                    <div>
                      <dt className="text-gray-500">Duration</dt>
                      <dd className="text-gray-900">{video.seconds} seconds</dd>
                    </div>
                  )}
                  {video.size && (
                    <div>
                      <dt className="text-gray-500">Resolution</dt>
                      <dd className="text-gray-900">{video.size}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-500">Created</dt>
                    <dd className="text-gray-900">
                      {new Date(video.created_at * 1000).toLocaleString()}
                    </dd>
                  </div>
                  {video.completed_at && (
                    <div>
                      <dt className="text-gray-500">Completed</dt>
                      <dd className="text-gray-900">
                        {new Date(video.completed_at * 1000).toLocaleString()}
                      </dd>
                    </div>
                  )}
                  {video.remixed_from_video_id && (
                    <div>
                      <dt className="text-gray-500">Remixed From</dt>
                      <dd className="text-gray-900 font-mono text-xs">
                        {video.remixed_from_video_id}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

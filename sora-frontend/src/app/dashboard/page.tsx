'use client';

import React from 'react';
import { VideoForm } from '@/components/VideoForm';
import { VideoGallery } from '@/components/VideoGallery';
import { QuotaDisplay } from '@/components/QuotaDisplay';
import { useVideos } from '@/hooks/useVideos';

export default function DashboardPage() {
  const { data: videos = [], isLoading, refetch } = useVideos(50, 0);

  // Mock quota data (replace with actual API call when quota endpoint is ready)
  const quotaData = {
    used: videos.length,
    limit: 50,
    costThisMonth: videos.length * 0.40, // Rough estimate
  };

  const handleVideoCreated = () => {
    // Refetch videos list after creating a new video
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sora Studio</h1>
              <p className="text-sm text-gray-600 mt-1">AI Video Generation Platform</p>
            </div>
            <div className="w-80">
              <QuotaDisplay
                used={quotaData.used}
                limit={quotaData.limit}
                costThisMonth={quotaData.costThisMonth}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Creation Form */}
        <div className="mb-8">
          <VideoForm
            onSuccess={handleVideoCreated}
            quotaRemaining={quotaData.limit - quotaData.used}
          />
        </div>

        {/* Recent Videos Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Videos</h2>
            <p className="text-gray-600 mt-1">
              Manage and download your generated videos
            </p>
          </div>

          <VideoGallery videos={videos} isLoading={isLoading} />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Sora Studio - Powered by OpenAI Sora 2 API
          </p>
        </div>
      </footer>
    </div>
  );
}

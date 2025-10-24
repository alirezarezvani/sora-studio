'use client';

import React, { useEffect, useState } from 'react';
import { VideoForm } from '@/components/VideoForm';
import { VideoGallery } from '@/components/VideoGallery';
import { QuotaDisplay } from '@/components/QuotaDisplay';
import { useVideos } from '@/hooks/useVideos';
import { useQuota } from '@/hooks/useQuota';
import { UserButton, useUser } from "@stackframe/stack";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const user = useUser();
  const [authChecked, setAuthChecked] = useState(false);
  const { data: videos = [], isLoading, refetch } = useVideos(50, 0);
  const { data: quotaData, isLoading: quotaLoading, error: quotaError } = useQuota();

  // Authentication guard - redirect to sign-in if not authenticated
  useEffect(() => {
    // Wait a moment for user state to load
    const timer = setTimeout(() => {
      if (!user) {
        router.push('/auth/sign-in');
      } else {
        setAuthChecked(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, router]);

  // Show loading state while checking authentication
  if (!authChecked && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleVideoCreated = () => {
    // Refetch videos list and quota after creating a new video
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sora Studio</h1>
              <p className="text-sm text-gray-600 mt-1">AI Video Generation Platform</p>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-end">
              {/* Auth Button */}
              <div className="flex items-center gap-2">
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">
                      {user.displayName || user.primaryEmail}
                    </span>
                    <UserButton />
                  </div>
                ) : (
                  <Link
                    href="/auth/sign-in"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Quota Display */}
              <div className="w-80">
                {quotaLoading ? (
                  <div className="text-sm text-gray-500">Loading quota...</div>
                ) : quotaError ? (
                  <div className="text-sm text-red-500">Error loading quota</div>
                ) : quotaData ? (
                  <QuotaDisplay
                    used={quotaData.videos_created}
                    limit={quotaData.videos_limit}
                    costThisMonth={quotaData.estimated_cost}
                  />
                ) : null}
              </div>
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
            quotaRemaining={quotaData ? quotaData.remaining : 0}
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

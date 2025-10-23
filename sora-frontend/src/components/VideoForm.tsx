'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { useCreateVideo } from '@/hooks/useVideos';
import { CreateVideoRequest } from '@/types';
import { useToast } from '@/hooks/useToast';

interface VideoFormProps {
  onSuccess?: () => void;
  quotaRemaining: number;
}

export const VideoForm: React.FC<VideoFormProps> = ({ onSuccess, quotaRemaining }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('sora-2');
  const [duration, setDuration] = useState('4');
  const [size, setSize] = useState('720p');
  const [errors, setErrors] = useState<{ prompt?: string }>({});

  const createVideo = useCreateVideo();
  const toast = useToast();
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

  // Calculate estimated cost
  const calculateCost = (): number => {
    const durationNum = parseInt(duration);
    const baseRate = model === 'sora-2-pro' ? 0.20 : 0.10; // per second
    return durationNum * baseRate;
  };

  const validateForm = (): boolean => {
    const newErrors: { prompt?: string } = {};

    if (!prompt || prompt.trim().length < 10) {
      newErrors.prompt = 'Prompt must be at least 10 characters';
    }

    if (prompt.length > 500) {
      newErrors.prompt = 'Prompt must not exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (quotaRemaining <= 0) {
      toast.warning('You have reached your monthly quota limit. Please upgrade or wait until next month.');
      return;
    }

    const videoData: CreateVideoRequest = {
      prompt: prompt.trim(),
      model,
      seconds: duration,
      size,
    };

    try {
      await createVideo.mutateAsync(videoData);

      // Show success message
      if (isMockMode) {
        toast.success('Demo video created! Watch it progress through the generation stages.');
      } else {
        toast.success('Video creation started! You can track its progress below.');
      }

      // Reset form
      setPrompt('');
      setErrors({});
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Failed to create video:', error);

      // Get error message from backend
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to create video';

      // Show user-friendly error messages
      if (errorMessage.includes('Billing hard limit') || errorMessage.includes('billing_hard_limit')) {
        toast.error('OpenAI Billing Limit Reached - Please add credits at platform.openai.com/account/billing', 7000);
      } else if (errorMessage.includes('billing')) {
        toast.error(`Billing Error: ${errorMessage}`, 7000);
      } else if (errorMessage.includes('Invalid value')) {
        toast.error(`Invalid Parameters: ${errorMessage}`, 7000);
      } else {
        toast.error(`Failed to create video: ${errorMessage}`, 7000);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Create New Video</CardTitle>
          {isMockMode && (
            <span className="text-xs font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              Demo Mode
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prompt Input */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Video Prompt <span className="text-red-500">*</span>
            </label>
            <textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to create... (e.g., 'Wide shot of a child flying a red kite in a grassy park, golden hour sunlight, camera slowly pans upward.')"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.prompt ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.prompt ? (
                <p className="text-sm text-red-600">{errors.prompt}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  {prompt.length}/500 characters (min 10)
                </p>
              )}
            </div>
          </div>

          {/* Model Selection */}
          <Select
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            options={[
              { value: 'sora-2', label: 'Sora 2 (Fast - Better for iteration)' },
              { value: 'sora-2-pro', label: 'Sora 2 Pro (High Quality - Production)' },
            ]}
          />

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <div className="flex gap-3">
              {['4', '8', '12'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 border-2 ${
                    duration === d
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                  }`}
                >
                  {d} seconds
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <Select
            label="Resolution (Optional)"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            options={[
              { value: '480p', label: '480p (854x480)' },
              { value: '720p', label: '720p (1280x720) - Recommended' },
              { value: '1080p', label: '1080p (1920x1080)' },
            ]}
          />

          {/* Cost Estimate */}
          <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Estimated Cost:</span>
              <span className="text-lg font-semibold text-primary-600">
                ${calculateCost().toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {model === 'sora-2-pro'
                ? 'Pro model: Higher quality, longer processing time'
                : 'Standard model: Faster generation, good for testing'}
            </p>
          </div>

          {/* Quota Warning */}
          {quotaRemaining <= 3 && quotaRemaining > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                Warning: Only {quotaRemaining} video{quotaRemaining !== 1 ? 's' : ''} remaining in your quota
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={createVideo.isPending}
            disabled={quotaRemaining <= 0}
          >
            {createVideo.isPending ? 'Creating Video...' : 'Generate Video'}
          </Button>

          {quotaRemaining <= 0 && (
            <p className="text-sm text-red-600 text-center">
              You have reached your monthly quota limit
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

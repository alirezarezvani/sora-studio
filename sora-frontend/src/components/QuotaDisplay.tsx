'use client';

import React from 'react';
import { Card, CardContent } from './ui/Card';

interface QuotaDisplayProps {
  used: number;
  limit: number;
  costThisMonth?: number;
}

export const QuotaDisplay: React.FC<QuotaDisplayProps> = ({
  used,
  limit,
  costThisMonth = 0,
}) => {
  const percentage = (used / limit) * 100;
  const isWarning = percentage >= 80;
  const isError = percentage >= 100;

  const getProgressColor = () => {
    if (isError) return 'bg-red-600';
    if (isWarning) return 'bg-yellow-500';
    return 'bg-primary-600';
  };

  return (
    <Card padding="sm" className="w-full">
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Monthly Quota</h4>
          <span className={`text-sm font-semibold ${isError ? 'text-red-600' : 'text-gray-900'}`}>
            {used} / {limit} videos
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        {/* Warning Messages */}
        {isError && (
          <p className="text-xs text-red-600 font-medium">
            Quota limit reached. Please upgrade your plan or wait until next month.
          </p>
        )}
        {isWarning && !isError && (
          <p className="text-xs text-yellow-700 font-medium">
            Warning: You are approaching your monthly limit ({percentage.toFixed(0)}% used)
          </p>
        )}

        {/* Cost Display */}
        {costThisMonth > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Estimated cost this month:</span>
              <span className="text-xs font-semibold text-gray-900">
                ${costThisMonth.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

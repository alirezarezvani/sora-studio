'use client';

import React from 'react';
import { Info, X } from 'lucide-react';

export const MockModeBanner: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(true);
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

  if (!isMockMode || !isVisible) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Info className="text-blue-600 flex-shrink-0 w-5 h-5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Demo Mode Active
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                No OpenAI API calls will be made. Videos are simulated for testing purposes.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

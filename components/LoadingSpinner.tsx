
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 border-4 border-slate-600 border-t-sky-500 rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-medium text-slate-300">Analyzing content & creating your guide...</p>
      <p className="text-sm text-slate-500">This may take a moment.</p>
    </div>
  );
};

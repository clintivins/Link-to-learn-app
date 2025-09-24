
import React from 'react';

interface URLInputFormProps {
  url: string;
  setUrl: (url: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export const URLInputForm: React.FC<URLInputFormProps> = ({ url, setUrl, onSubmit, isLoading }) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative w-full">
        <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste your article link here..."
          className="w-full bg-slate-700/50 border border-slate-600 rounded-full py-3 pr-4 pl-12 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 outline-none"
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 font-semibold text-white transition-all duration-300 bg-sky-600 rounded-full hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
      >
        {isLoading ? 'Generating...' : 'Create Guide'}
      </button>
    </form>
  );
};

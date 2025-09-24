import React, { useState, useCallback } from 'react';
import { URLInputForm } from './components/URLInputForm';
import { StudyGuideDisplay } from './components/StudyGuideDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { generateStudyGuide } from './services/geminiService';
import { MindMapDisplay } from './components/MindMapDisplay';
import type { GroundingChunk } from './types';

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [studyGuide, setStudyGuide] = useState<string | null>(null);
  const [mindMap, setMindMap] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid URL.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setStudyGuide(null);
    setMindMap(null);
    setSources([]);

    try {
      const result = await generateStudyGuide(url);
      const [guideContent, mindMapContent] = result.guide.split('|||---MINDMAP---|||');

      setStudyGuide(guideContent);
      if (mindMapContent && mindMapContent.trim()) {
        setMindMap(mindMapContent.trim());
      }
      setSources(result.sources);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Failed to generate study guide: ${err.message}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center my-8 md:my-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500">
                Link to Learn
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
                Paste any article or documentation link and our AI will generate a concise study guide to supercharge your learning.
            </p>
        </header>

        <main>
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-700">
            <URLInputForm 
              url={url}
              setUrl={setUrl}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>

          <div className="mt-8">
            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {studyGuide && <StudyGuideDisplay guide={studyGuide} sources={sources} />}
            {mindMap && <MindMapDisplay markdown={mindMap} />}
          </div>
        </main>
        
        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>Powered by Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
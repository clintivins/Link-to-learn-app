import React, { useMemo, useCallback, useRef } from 'react';
import type { GroundingChunk } from '../types';

declare global {
    interface Window {
        marked: {
            parse: (markdown: string) => string;
        };
        jspdf: any;
        html2canvas: any;
    }
}

interface StudyGuideDisplayProps {
  guide: string;
  sources: GroundingChunk[];
}

export const StudyGuideDisplay: React.FC<StudyGuideDisplayProps> = ({ guide, sources }) => {
  const guideContentRef = useRef<HTMLDivElement>(null);
  
  const sections = useMemo(() => guide.split('|||---|||').filter(s => s.trim()), [guide]);

  const headingColors = useMemo(() => [
    'text-sky-400', 'text-emerald-400', 'text-amber-400', 
    'text-violet-400', 'text-rose-400', 'text-cyan-400'
  ], []);

  const handleDownload = useCallback(() => {
    const blob = new Blob([guide.replace(/\|\|\|---\|\|\|/g, '\n\n---\n\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'study-guide.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [guide]);

  const handlePdfDownload = useCallback(async () => {
    if (!guideContentRef.current) return;
    const { jsPDF } = window.jspdf;
    const canvas = await window.html2canvas(guideContentRef.current, { 
        scale: 2,
        backgroundColor: '#0f172a' // slate-900 bg
    });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const ratio = canvasWidth / pdfWidth;
    const scaledHeight = canvasHeight / ratio;
    
    let heightLeft = scaledHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
    }
    
    pdf.save('study-guide.pdf');
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold text-sky-400">Your Study Guide</h2>
        <div className="flex items-center gap-2">
           <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-300 bg-sky-900/50 border border-sky-700 rounded-full hover:bg-sky-800/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-all duration-200"
            aria-label="Download study guide as a markdown file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download .md
          </button>
          <button
            onClick={handlePdfDownload}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-300 bg-rose-900/50 border border-rose-700 rounded-full hover:bg-rose-800/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-rose-500 transition-all duration-200"
            aria-label="Download study guide as a PDF file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            Download .pdf
          </button>
        </div>
      </div>
      
      <div ref={guideContentRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((sectionContent, index) => {
            const lines = sectionContent.trim().split('\n');
            const titleLine = lines.shift() || '';
            const title = titleLine.replace(/^#+\s*/, '');
            const bodyMarkdown = lines.join('\n');
            const bodyHtml = window.marked.parse(bodyMarkdown);
            const colorClass = headingColors[index % headingColors.length];

            return (
              <div 
                key={index} 
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700 transition-all duration-300 hover:border-sky-600/80 break-inside-avoid"
              >
                <div className="p-6">
                  <h2 className={`text-xl font-bold border-b border-slate-600 pb-2 mb-4 mt-0 ${colorClass}`}>
                    {title}
                  </h2>
                  <div
                    className="prose prose-invert max-w-none 
                              prose-strong:text-slate-100
                              prose-ul:list-disc prose-ul:pl-5
                              prose-li:text-slate-300 prose-li:my-1"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {sources.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-700">
            <h3 className="text-xl font-semibold text-sky-400 mb-3">Sources</h3>
            <ul className="space-y-2">
              {sources.map((source, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-sky-500 mt-1">&#10148;</span>
                  <a
                    href={source.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-sky-400 transition-colors duration-200 break-all"
                  >
                    {source.web.title || source.web.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
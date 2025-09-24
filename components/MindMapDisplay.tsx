import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        markmapLib: {
            Transformer: any;
        };
        markmapView: {
            Markmap: any;
        };
    }
}

interface MindMapDisplayProps {
    markdown: string;
}

export const MindMapDisplay: React.FC<MindMapDisplayProps> = ({ markdown }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const mmRef = useRef<any>(null); // To hold the markmap instance

    useEffect(() => {
        if (!svgRef.current || !window.markmapLib || !window.markmapView) return;

        const { Transformer } = window.markmapLib;
        const { Markmap } = window.markmapView;
        const transformer = new Transformer();

        // If a mindmap instance already exists, just update its data to avoid re-creating it
        if (mmRef.current) {
            const { root } = transformer.transform(markdown);
            mmRef.current.setData(root);
            mmRef.current.fit();
            return;
        }

        // Otherwise, create a new one
        const { root } = transformer.transform(markdown);
        const mm = Markmap.create(svgRef.current, {
            autoFit: true,
            duration: 500,
            nodeFont: '16px sans-serif',
            color: (d: { depth: number }) => { // Change color based on depth
                const colors = ['#818cf8', '#34d399', '#fde047', '#fb923c'];
                return colors[d.depth % colors.length];
            }
        });
        mm.setData(root);
        mmRef.current = mm;

        // Cleanup function to destroy the instance when the component unmounts
        return () => {
            if (mmRef.current) {
                mmRef.current.destroy();
                mmRef.current = null;
            }
        };

    }, [markdown]);

    return (
        <div className="mt-12 animate-fade-in">
             <h2 className="text-2xl font-bold text-amber-400 mb-4">Mind Map</h2>
             <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700 p-4">
                 <svg ref={svgRef} className="w-full h-[500px]" />
             </div>
        </div>
    );
};
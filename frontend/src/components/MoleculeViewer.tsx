import React, { useEffect, useRef } from 'react';

interface MoleculeViewerProps {
  pdbData: string;
  height?: string;
}

export const MoleculeViewer: React.FC<MoleculeViewerProps> = ({ pdbData, height = '400px' }) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real app, this would use 3Dmol.js or NGL
    console.log('Rendering PDB Data structure...', pdbData.slice(0, 100));
  }, [pdbData]);

  return (
    <div 
      ref={viewerRef} 
      className="bg-black rounded-xl border border-gray-800 relative overflow-hidden flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-xs text-gray-500 uppercase tracking-widest animate-pulse">
        3D Molecular View: ESMFold Prediction
      </div>
      <div className="absolute bottom-4 left-4 flex gap-2">
        <div className="px-2 py-1 bg-gray-900/80 rounded text-[10px] text-blue-400 border border-blue-500/30">ROTATE</div>
        <div className="px-2 py-1 bg-gray-900/80 rounded text-[10px] text-blue-400 border border-blue-500/30">ZOOM</div>
      </div>
    </div>
  );
};


import React from 'react';
import { X, Swords, Zap, Download } from 'lucide-react';
import { CapturedFrame } from '../types';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  frames: CapturedFrame[];
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, frames }) => {
  if (!isOpen || frames.length < 2) return null;

  const [frameA, frameB] = frames;

  const downloadFrame = (frame: CapturedFrame) => {
    const link = document.createElement('a');
    link.href = frame.dataUrl;
    link.download = frame.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8 bg-black/40">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-7xl bg-white border-gray-200 rounded-md p-[3px] shadow-2xl flex flex-col max-h-full font-sans select-none text-black">
        {/* Title Bar */}
        <div className="h-[22px] bg-transparent text-gray-800 border-b border-gray-100 flex items-center justify-between px-1.5 select-none font-bold text-xs tracking-normal">
          <div className="flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-gray-800" />
            <span>FRAME COMPARISON</span>
          </div>
          <button 
            onClick={onClose} 
            className="w-4 h-4 bg-white border-gray-200 rounded-md text-black font-bold text-xs flex items-center justify-center active:scale-95 transition-transform"
          >
            ✕
          </button>
        </div>

        {/* Comparison Desk */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row gap-4 p-4 bg-white">
          {/* Frame A */}
          <div className="flex-1 flex flex-col bg-white border-gray-200 rounded-md p-1.5">
            <div className="px-2 py-1 text-sm font-bold flex justify-between items-center border-gray-200 mb-2 bg-gray-100">
              <span className="truncate max-w-[200px] ">{frameA.fileName}</span>
              <span className="font-bold">{formatTime(frameA.timestamp)}</span>
            </div>
            
            {/* Inset Screen Frame */}
            <div className="flex-1 relative min-h-[220px] bg-gray-100 border-gray-200 rounded-md p-1 flex items-center justify-center">
              <img src={frameA.dataUrl} className="max-w-full max-h-full object-contain" alt="Frame A" />
            </div>

            <div className="mt-2 flex justify-end">
              <button 
                onClick={() => downloadFrame(frameA)}
                className="h-7 px-4 bg-white border-gray-200 rounded-md text-black font-bold text-sm flex items-center gap-1.5 active:scale-95 transition-transform"
                title="Download Frame"
              >
                <Download className="w-3.5 h-3.5" />
                <span>SAVE FRAME</span>
              </button>
            </div>
          </div>

          {/* VS Indicator */}
          <div className="flex items-center justify-center md:flex-col gap-2 py-1 shrink-0">
            <div className="h-[2px] flex-1 md:w-[2px] md:h-auto border-t border-gray-200 border-b border-white" />
            <div className="w-10 h-8 flex items-center justify-center font-bold text-xs bg-white border-gray-200 rounded-md select-none">
              VS
            </div>
            <div className="h-[2px] flex-1 md:w-[2px] md:h-auto border-t border-gray-200 border-b border-white" />
          </div>

          {/* Frame B */}
          <div className="flex-1 flex flex-col bg-white border-gray-200 rounded-md p-1.5">
            <div className="px-2 py-1 text-sm font-bold flex justify-between items-center border-gray-200 mb-2 bg-gray-100">
              <span className="truncate max-w-[200px] ">{frameB.fileName}</span>
              <span className="font-bold">{formatTime(frameB.timestamp)}</span>
            </div>
            
            {/* Inset Screen Frame */}
            <div className="flex-1 relative min-h-[220px] bg-gray-100 border-gray-200 rounded-md p-1 flex items-center justify-center">
              <img src={frameB.dataUrl} className="max-w-full max-h-full object-contain" alt="Frame B" />
            </div>

            <div className="mt-2 flex justify-end">
              <button 
                onClick={() => downloadFrame(frameB)}
                className="h-7 px-4 bg-white border-gray-200 rounded-md text-black font-bold text-sm flex items-center gap-1.5 active:scale-95 transition-transform"
                title="Download Frame"
              >
                <Download className="w-3.5 h-3.5" />
                <span>SAVE FRAME</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2 font-bold  tracking-normalr text-xs text-blue-900">
            <Zap className="w-3.5 h-3.5 text-blue-900" />
            <span>Dual Screen Analyzer</span>
          </div>
          <button 
            onClick={onClose}
            className="w-24 h-7 font-bold text-sm bg-white border-gray-200 rounded-md text-black active:scale-95 transition-transform"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;

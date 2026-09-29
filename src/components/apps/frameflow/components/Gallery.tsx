import React from 'react';
import { Download, Trash2, LayoutTemplate, Info, Film, Sparkles, Star, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CapturedFrame } from '../types';

interface GalleryProps {
  frames: CapturedFrame[];
  onRemove: (id: string) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onBatchRename: (ids: string[], prefix: string) => void;
  onExportGif?: () => void;
  onOpenEditor?: (frameId?: string) => void;
  onSeekTo?: (timestamp: number) => void;
}

const Gallery: React.FC<GalleryProps> = ({ 
  frames, 
  onRemove, 
  selectedIds = [], 
  onToggleSelect,
  onBatchRename,
  onExportGif,
  onOpenEditor,
  onSeekTo
}) => {
  const [showMetadataId, setShowMetadataId] = React.useState<string | null>(null);
  const [hoveredFrameId, setHoveredFrameId] = React.useState<string | null>(null);
  const [renamePrefix, setRenamePrefix] = React.useState('');
  const [filterTag, setFilterTag] = React.useState<string | null>(null);

  const downloadFrame = (frame: CapturedFrame) => {
    if (!frame || !frame.dataUrl) return;
    const link = document.createElement('a');
    link.href = frame.dataUrl;
    link.download = frame.fileName || 'capture.webp';
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

  const safeFrames = frames || [];
  const safeSelectedIds = selectedIds || [];
  
  const allTags = Array.from(new Set(safeFrames.flatMap(f => f.tags || []))).sort();
  const filteredFrames = filterTag ? safeFrames.filter(f => f.tags?.includes(filterTag)) : safeFrames;

  return (
    <div className="flex flex-col gap-4 pb-4">
      
      {/* Batch Operations Toolbar */}
      <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
            <span>Batch & Teaser Tools</span>
          </span>
          <span className="text-[11px] font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full">
            {safeSelectedIds.length > 0 ? `${safeSelectedIds.length} Selected` : `${safeFrames.length} in Buffer`}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 items-end">
          <div className="flex-1 min-w-[120px]">
            <input 
              type="text" 
              value={renamePrefix}
              onChange={(e) => setRenamePrefix(e.target.value.toUpperCase())}
              placeholder="PREFIX_NAME"
              className="w-full h-7 px-2 bg-white border border-gray-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-zinc-400 focus:outline-none uppercase"
            />
          </div>
          
          <button 
            onClick={() => {
              if (renamePrefix.trim()) {
                const targetIds = safeSelectedIds.length > 0 ? safeSelectedIds : safeFrames.map(f => f.id);
                onBatchRename(targetIds, renamePrefix.trim());
                setRenamePrefix('');
              } else {
                alert("Please enter a rename prefix.");
              }
            }}
            className="h-7 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold active:scale-95 transition-transform disabled:opacity-50 shadow-xs"
            disabled={!renamePrefix.trim()}
          >
            Rename
          </button>
        </div>
      </div>

      {/* Filter by tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-1">
          <span className="text-xs font-bold text-gray-500 self-center mr-1">Filter:</span>
          <button
            onClick={() => setFilterTag(null)}
            className={`px-2 py-0.5 text-xs font-bold rounded-lg transition-colors ${
              filterTag === null ? 'bg-zinc-900 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ALL ({safeFrames.length})
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-2 py-0.5 text-xs font-bold rounded-lg transition-colors ${
                filterTag === tag ? 'bg-zinc-900 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {filteredFrames.map((frame) => {
        if (!frame) return null;
        const isSelected = safeSelectedIds.includes(frame.id);
        
        return (
          <div 
            key={frame.id} 
            className={`p-2 bg-white rounded-xl border transition-all ${
              isSelected 
                ? 'border-zinc-900 ring-2 ring-zinc-200 shadow-md' 
                : 'border-gray-200 shadow-xs hover:border-gray-300'
            }`}
          >
            {/* Hover Preview Card */}
            <AnimatePresence>
              {hoveredFrameId === frame.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 10 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-full mr-4 top-0 w-[280px] z-50 pointer-events-none hidden lg:block"
                >
                  <div className="bg-white rounded-xl p-2 shadow-2xl border border-gray-200">
                    <div className="bg-black aspect-video rounded-lg overflow-hidden">
                      <img src={frame.dataUrl} className="w-full h-full object-contain" alt="Large Preview" />
                    </div>
                    <div className="mt-2 flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-zinc-800">ENLARGED PREVIEW</span>
                      <span className="text-xs font-mono text-gray-600">{formatTime(frame.timestamp)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Thumbnail Frame */}
            <div 
              onMouseEnter={() => setHoveredFrameId(frame.id)}
              onMouseLeave={() => setHoveredFrameId(null)}
              onClick={() => onToggleSelect(frame.id)}
              className="aspect-video relative overflow-hidden bg-black rounded-lg cursor-pointer group"
            >
              <img 
                src={frame.dataUrl} 
                alt={`Capture at ${frame.timestamp}`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Timestamp label */}
              <button
                type="button"
                onClick={(e) => {
                  if (onSeekTo) {
                    e.stopPropagation();
                    onSeekTo(frame.timestamp || 0);
                  }
                }}
                className="absolute top-2 left-2 px-2 py-0.5 text-[11px] font-mono font-bold bg-black/70 hover:bg-black/90 backdrop-blur-xs rounded text-white flex items-center gap-1 transition-colors z-10"
                title="Click to jump video to this timestamp"
              >
                <PlayCircle className="w-3 h-3 text-amber-400" />
                <span>{formatTime(frame.timestamp || 0)}</span>
              </button>

              {/* Quality score badge */}
              {frame.qualityScore && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold bg-zinc-800 text-white rounded flex items-center gap-0.5 shadow-xs border border-zinc-700">
                  <Star className="w-2.5 h-2.5 fill-white" />
                  <span>{frame.qualityScore}%</span>
                </div>
              )}
            </div>

            {/* File info and Action Button Deck */}
            <div className="mt-2.5 space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-bold truncate text-gray-900 max-w-[180px]">
                  {frame.fileName}
                </p>
                <span className="text-[10px] text-gray-400 font-mono">
                  {frame.width && frame.height ? `${frame.width}×${frame.height}` : ''}
                </span>
              </div>

              {/* Tags Display */}
              {frame.tags && frame.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 px-1">
                  {frame.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-zinc-100 text-zinc-700 border border-zinc-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Buttons */}
              <div className="flex gap-1">
                {onOpenEditor && (
                  <button 
                    onClick={() => onOpenEditor(frame.id)}
                    className="h-7 px-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg flex items-center justify-center gap-1 text-xs font-bold active:scale-95 transition-transform"
                    title="Edit in Photo Studio"
                  >
                    <Sparkles className="w-3 h-3 text-zinc-600" />
                    <span>Edit</span>
                  </button>
                )}
                <button 
                  onClick={() => downloadFrame(frame)}
                  className="flex-1 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-1 text-xs font-bold text-gray-700 active:scale-95 transition-transform"
                  title="Save Image"
                >
                  <Download className="w-3 h-3" />
                  <span>Save</span>
                </button>
                <button 
                  onClick={() => setShowMetadataId(showMetadataId === frame.id ? null : frame.id)}
                  className={`h-7 px-2 rounded-lg flex items-center justify-center gap-1 text-xs font-bold transition-colors ${
                    showMetadataId === frame.id 
                      ? 'bg-zinc-200 text-zinc-900' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95'
                  }`}
                  title="View Metadata"
                >
                  <Info className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => onToggleSelect(frame.id)}
                  className={`h-7 px-2 rounded-lg flex items-center justify-center gap-1 text-xs font-bold transition-colors ${
                    isSelected 
                      ? 'bg-zinc-900 text-white shadow-xs' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95'
                  }`}
                  title="Select for compare / GIF"
                >
                  <LayoutTemplate className="w-3 h-3" />
                  <span>{isSelected ? 'Selected' : 'Select'}</span>
                </button>
                <button 
                  onClick={() => onRemove(frame.id)}
                  className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 flex items-center justify-center active:scale-95 transition-transform"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {showMetadataId === frame.id && (
                <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-gray-200 text-xs font-sans space-y-1 animate-in fade-in duration-150">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-1 mb-1 font-bold text-gray-700">
                    <span>FRAME SPECS</span>
                    <button onClick={() => setShowMetadataId(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Captured At:</span>
                    <span className="font-mono text-gray-800">{new Date(frame.captureTime).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Video Source:</span>
                    <span className="font-semibold text-gray-800 truncate max-w-[120px]">{frame.sourceFile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Video Timestamp:</span>
                    <span className="font-mono font-bold text-zinc-800">{formatTime(frame.timestamp)}</span>
                  </div>
                  {frame.qualityScore && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">AI Quality Score:</span>
                      <span className="font-bold text-emerald-600">{frame.qualityScore}% (Optimal Exposure & Sharpness)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Gallery;

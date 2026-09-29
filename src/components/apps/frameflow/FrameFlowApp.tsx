import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  Video,
  Image as ImageIcon,
  Flame,
  Bomb,
  Swords,
  X,
  Minus,
  Maximize2,
  Monitor,
  Crown,
  Sparkles,
  Film
} from 'lucide-react';
import VideoPlayer, { VideoPlayerHandle } from './components/VideoPlayer';
import Gallery from './components/Gallery';
import Shelf from './components/Shelf';
import SettingsModal from './components/SettingsModal';
import SplashScreen from './components/SplashScreen';
import Terminal from './components/Terminal';
import MenuBar from './components/MenuBar';
import ComparisonModal from './components/ComparisonModal';
import AnalysisModal from './components/AnalysisModal';
import ImageEditorModal from './components/ImageEditorModal';
import ProUpgradeModal from './components/ProUpgradeModal';
import GifTeaserModal from './components/GifTeaserModal';
import { AboutModal } from './components/AboutModal';
import GoogleMediaModal from './components/GoogleMediaModal';
import { CapturedFrame, VideoMetadata, ExportSettings } from './types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const FrameFlowApp: React.FC = () => {
  const [showSplash, setShowSplash] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [frames, setFrames] = useState<CapturedFrame[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isGifTeaserOpen, setIsGifTeaserOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleInitialTab, setGoogleInitialTab] = useState<'drive' | 'photos'>('drive');

  // Standard Community Edition
  const [isPro, setIsPro] = useState<boolean>(false);

  const handleTogglePro = useCallback((status: boolean) => {
    setIsPro(status);
  }, []);

  const videoPlayerRef = useRef<VideoPlayerHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'image/webp',
    quality: 0.9,
    prefix: 'FRAME',
    includeTimestamp: true,
    autoCaptureEnabled: false,
    autoCaptureInterval: 5,
    scale: 1.0,
    watermarkConfig: {
      enabled: false,
      text: '',
      position: 'bottom-right',
      opacity: 0.8,
      fontSize: 16,
      color: '#ffffff',
      removeDefaultWatermark: true
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setMetadata(null);
      setFrames([]);
      setSelectedForComparison([]);
      setExportSettings(prev => ({
        ...prev,
        prefix: file.name.split('.')[0].toUpperCase()
      }));
    }
  };

  const handleSelectGoogleVideo = useCallback((file: File, url: string) => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(file);
    setVideoUrl(url);
    setMetadata(null);
    setFrames([]);
    setSelectedForComparison([]);
    setExportSettings(prev => ({
      ...prev,
      prefix: file.name.split('.')[0].toUpperCase()
    }));
  }, [videoUrl]);

  const handleCapture = useCallback((frame: CapturedFrame) => {
    setFrames(prev => {
      const currentFrames = prev || [];
      const newFrame = { ...frame, frameNumber: currentFrames.length + 1 };
      return [newFrame, ...currentFrames];
    });
  }, []);

  const handleImportFrames = useCallback((imported: CapturedFrame[]) => {
    setFrames(prev => (prev ? [...imported, ...prev] : imported));
  }, []);

  const handleUpdateFrame = useCallback((updatedFrame: CapturedFrame) => {
    setFrames(prev => (prev || []).map(f => f.id === updatedFrame.id ? updatedFrame : f));
  }, []);

  const handleBatchRename = useCallback((ids: string[], prefix: string) => {
    setFrames(prev => {
      if (!prev) return prev;
      let count = 1;
      return prev.map(frame => {
        if (ids.includes(frame.id)) {
          const extension = frame.fileName.includes('.') ? frame.fileName.split('.').pop() : 'webp';
          const newName = `${prefix}_${count.toString().padStart(2, '0')}.${extension}`;
          count++;
          return { ...frame, fileName: newName.toUpperCase() };
        }
        return frame;
      });
    });
  }, []);

  const handleExportAll = useCallback(async (customFrames?: CapturedFrame[]) => {
    const safeFrames = customFrames || frames || [];
    if (safeFrames.length === 0) {
      alert("No frames captured in buffer to export.");
      return;
    }

    setIsExporting(true);

    try {
      const isIframe = window.self !== window.top;

      if ('showDirectoryPicker' in window && !isIframe) {
        try {
          const directoryHandle = await (window as any).showDirectoryPicker({
            mode: 'readwrite'
          });

          for (let i = 0; i < safeFrames.length; i++) {
            const frame = safeFrames[i];
            const fileName = frame.fileName || `capture_${i}.webp`;
            try {
              const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
              const writable = await fileHandle.createWritable();
              const res = await fetch(frame.dataUrl);
              const blob = await res.blob();
              await writable.write(blob);
              await writable.close();
            } catch (fileErr) {
              console.error(`Failed to save frame ${i}:`, fileErr);
            }
          }
          alert(`SUCCESS: Exported ${safeFrames.length} frames directly to folder.`);
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
        }
      }

      // ZIP Download fallback
      const zip = new JSZip();
      for (let i = 0; i < safeFrames.length; i++) {
        const frame = safeFrames[i];
        const fileName = frame.fileName || `capture_${i}.webp`;
        const base64Data = frame.dataUrl.split(',')[1];
        zip.file(fileName, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `FRAMES_${Date.now()}.zip`);

    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [frames]);

  const handleRemoveFrame = useCallback((id: string) => {
    setFrames(prev => (prev || []).filter(f => f.id !== id));
    setSelectedForComparison(prev => (prev || []).filter(sid => sid !== id));
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedForComparison(prev => {
      const current = prev || [];
      if (current.includes(id)) {
        return current.filter(sid => sid !== id);
      }
      return [...current, id];
    });
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || isExporting) return;

      if (e.key === 'Delete') {
        const safeSelected = selectedForComparison || [];
        if (safeSelected.length > 0) {
          setFrames(prev => (prev || []).filter(f => !safeSelected.includes(f.id)));
          setSelectedForComparison([]);
        }
      } else if (e.code === 'KeyE') {
        const safeSelected = selectedForComparison || [];
        const safeFrames = frames || [];
        const selectedFrames = safeFrames.filter(f => safeSelected.includes(f.id));

        if (selectedFrames.length > 0) {
          handleExportAll(selectedFrames);
        } else if (safeFrames.length > 0) {
          handleExportAll(safeFrames);
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        videoPlayerRef.current?.togglePlay?.();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        videoPlayerRef.current?.capture?.();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        videoPlayerRef.current?.step?.(1, 1);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        videoPlayerRef.current?.step?.(-1, 1);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedForComparison, frames, isExporting, handleExportAll]);

  const framesToCompare = useMemo(() => {
    const safeSelected = selectedForComparison || [];
    const safeFrames = frames || [];
    return safeFrames.filter(f => f && f.id && safeSelected.includes(f.id));
  }, [frames, selectedForComparison]);

  const executeCommand = (input: string): string => {
    const args = (input || '').toLowerCase().split(' ');
    const cmd = args[0];
    if (!cmd) return '';

    switch (cmd) {
      case 'help':
        return 'CMDS: SNAP, PRO, GIF, DRIVE, PHOTOS, FORMAT [PNG|JPG|WEBP], QUALITY [0-100], SCALE [0.1-4], ZOOM [LVL], CLASH, CLEAR, PLAY, PAUSE';

      case 'drive':
      case 'gdrive':
        setGoogleInitialTab('drive');
        setIsGoogleModalOpen(true);
        return 'OPENING GOOGLE DRIVE CLOUD BROWSER...';

      case 'photos':
      case 'gphotos':
        setGoogleInitialTab('photos');
        setIsGoogleModalOpen(true);
        return 'OPENING GOOGLE PHOTOS LIBRARY...';

      case 'pro':
        setIsProModalOpen(true);
        return 'OPENING CREATOR PRO LICENSE DECK...';

      case 'gif':
      case 'teaser':
        if (frames.length < 2) return 'ERROR: NEED AT LEAST 2 FRAMES FOR GIF';
        setIsGifTeaserOpen(true);
        return 'LAUNCHING ANIMATED GIF TEASER STUDIO...';

      case 'snap':
      case 'capture':
        if (!videoUrl) return 'ERROR: NO VIDEO LOADED';
        videoPlayerRef.current?.capture();
        return 'FRAME CAPTURED!';

      case 'zoom':
        const zVal = parseFloat(args[1]);
        if (isNaN(zVal) || zVal < 1) return 'ERROR: ZOOM MIN IS 1';
        videoPlayerRef.current?.setZoom(zVal);
        return `ZOOM LEVEL SET TO ${zVal}X`;

      case 'format':
        const fmt = args[1];
        if (fmt === 'png') {
          setExportSettings(s => ({ ...s, format: 'image/png' }));
          return 'OUTPUT SET TO PNG (LOSSLESS)';
        } else if (fmt === 'jpg' || fmt === 'jpeg') {
          setExportSettings(s => ({ ...s, format: 'image/jpeg' }));
          return 'OUTPUT SET TO JPEG (COMPRESSED)';
        } else if (fmt === 'webp') {
          setExportSettings(s => ({ ...s, format: 'image/webp' }));
          return 'OUTPUT SET TO WEBP (OPTIMIZED)';
        }
        return 'ERROR: UNKNOWN FORMAT. USE PNG, JPG, OR WEBP.';

      case 'scale':
        const sVal = parseFloat(args[1]);
        if (isNaN(sVal) || sVal < 0.1 || sVal > 4) return 'ERROR: SCALE 0.1-4.0';
        if (sVal > 1.0 && !isPro) {
          setIsProModalOpen(true);
          return 'NOTICE: 4K / 8K RESOLUTIONS REQUIRE CREATOR PRO.';
        }
        setExportSettings(s => ({ ...s, scale: sVal }));
        return `RESOLUTION SCALE SET TO ${sVal}x`;

      case 'clash':
      case 'vs':
        const currentFrames = frames || [];
        const currentSelected = selectedForComparison || [];
        if (currentFrames.length >= 2) {
          if (currentSelected.length < 2) {
            setSelectedForComparison([currentFrames[1].id, currentFrames[0].id]);
          }
          setIsCompareOpen(true);
          return 'CLASHING...';
        }
        return 'ERROR: NEED 2 CAPTURES.';

      case 'play':
        videoPlayerRef.current?.play();
        return 'PLAYING...';

      case 'pause':
        videoPlayerRef.current?.pause();
        return 'PAUSED.';

      case 'clear':
        setFrames([]);
        setSelectedForComparison([]);
        return 'BUFFER WIPED.';

      default:
        return `UNKNOWN CMD: ${cmd.toUpperCase()}`;
    }
  };

  const handleBulkExportTrigger = (fps: number) => {
    setIsSettingsOpen(false);
    videoPlayerRef.current?.bulkExport(fps);
  };

  const frameCount = (frames || []).length;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setVideoUrl(URL.createObjectURL(file));
      } else {
        alert("Please drop a valid video file.");
      }
    }
  };

  if (showSplash) {
    return <SplashScreen onEnter={() => setShowSplash(false)} />;
  }

  return (
    <div
      className={`h-full w-full relative flex flex-col bg-[#f8fafc] text-slate-900 font-sans overflow-hidden ${isDragging ? 'ring-4 ring-purple-500' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >

      {/* Permanent hidden file input for menu bar and desktop actions */}
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <MenuBar
        fileName={videoFile?.name}
        isPro={isPro}
        onPreferences={() => setIsSettingsOpen(true)}
        onAbout={() => setIsAboutOpen(true)}
        onOpenMedia={() => fileInputRef.current?.click()}
        onImportDrive={() => {
          setGoogleInitialTab('drive');
          setIsGoogleModalOpen(true);
        }}
        onImportPhotos={() => {
          setGoogleInitialTab('photos');
          setIsGoogleModalOpen(true);
        }}
        onClearBuffer={() => { setFrames([]); setSelectedForComparison([]); }}
        onToggleFullscreen={() => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen().catch(err => console.error(err));
          }
        }}
        onZoomIn={() => videoPlayerRef.current?.setZoom(4)}
        onZoomOut={() => videoPlayerRef.current?.setZoom(1)}
        onResetView={() => videoPlayerRef.current?.setZoom(1)}
        onOpenEditor={() => setIsEditorOpen(true)}
        onAnalyzeVideo={() => {
          if (!videoUrl) {
            alert("PLEASE SELECT A VIDEO FILE FIRST.");
          } else {
            setIsAnalysisOpen(true);
          }
        }}
        onUpgradeClick={() => setIsProModalOpen(true)}
        onOpenGifStudio={() => {
          if (frames.length < 2) {
            alert("Please capture at least 2 frames into the buffer first.");
          } else {
            setIsGifTeaserOpen(true);
          }
        }}
      />

      <main className="flex-1 flex gap-4 overflow-hidden p-4 pb-2">

        {/* Main Player Window */}
        <section className="flex-[2] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Titlebar */}
          <div className="h-9 bg-slate-900 text-white flex items-center justify-between px-3 select-none">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold tracking-tight">
                {videoFile ? `Frame Flow - ${videoFile.name}` : 'Frame Flow Player - Ready for Footage'}
              </span>
            </div>
            <div className="flex gap-1.5 items-center">
              <button
                onClick={() => { setVideoUrl(null); setVideoFile(null); setFrames([]); setSelectedForComparison([]); }}
                className="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs flex items-center justify-center transition-colors"
                title="Close Video"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-hidden flex flex-col">
            {!videoUrl ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/70 rounded-xl border border-gray-200 border-dashed p-8 text-center">
                <div className="p-4 mb-3 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <Video className="w-10 h-10 text-zinc-700" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Load Video Recording</h3>
                <p className="text-xs text-gray-500 mb-5 max-w-sm">
                  Drag & drop footage (.mp4, .webm, .mov) or import directly from your local computer or Google Cloud storage.
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Select Local File...</span>
                  </button>

                  <button
                    onClick={() => {
                      setGoogleInitialTab('drive');
                      setIsGoogleModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-white hover:bg-blue-50/60 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <path d="M4.5 19.5L9 11.5H19.5L15 19.5H4.5Z" fill="#34A853"/>
                      <path d="M15 19.5L19.5 11.5L15 3.5H10.5L6 11.5L15 19.5Z" fill="#4285F4"/>
                      <path d="M10.5 3.5L6 11.5L1.5 3.5H10.5Z" fill="#FBBC05"/>
                    </svg>
                    <span>Google Drive</span>
                  </button>

                  <button
                    onClick={() => {
                      setGoogleInitialTab('photos');
                      setIsGoogleModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-white hover:bg-amber-50/60 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-2"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>Google Photos</span>
                  </button>
                </div>
              </div>
            ) : (
              <VideoPlayer
                ref={videoPlayerRef}
                src={videoUrl}
                onCapture={handleCapture}
                onMetadata={setMetadata}
                fileName={videoFile?.name || 'capture'}
                settings={exportSettings}
                onAnalyze={() => setIsAnalysisOpen(true)}
                capturedFrames={frames}
              />
            )}
          </div>
        </section>

        {/* Sidebar Group */}
        <section className="flex-1 flex flex-col gap-4 max-w-[400px]">

          {/* Gallery Window */}
          <div className="flex-[3] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
             {/* Gallery Titlebar */}
             <div className="h-9 bg-slate-900 text-white flex items-center justify-between px-3 select-none">
               <div className="flex items-center gap-2">
                 <ImageIcon className="w-4 h-4 text-zinc-400" />
                 <span className="text-xs font-bold">Captured Frame Buffer</span>
               </div>
               <div className="flex gap-1 items-center">
                 {frameCount > 0 && (
                   <button
                     onClick={() => handleExportAll()}
                     className="h-5 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] font-bold px-2 flex items-center justify-center transition-colors"
                   >
                     Export All
                   </button>
                 )}
                 {(selectedForComparison || []).length === 2 && (
                   <button
                     onClick={() => setIsCompareOpen(true)}
                     className="h-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[11px] font-bold px-2 flex items-center justify-center transition-colors border border-zinc-700"
                   >
                     Compare
                   </button>
                 )}
               </div>
             </div>

             <div className="flex-1 overflow-y-auto p-3 bg-slate-50/50">
               {frameCount === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                   <ImageIcon className="w-10 h-10 mb-2 opacity-40 text-zinc-600" />
                   <p className="text-xs font-bold text-gray-600">Buffer is Empty</p>
                   <p className="text-[11px] text-gray-400 mt-1">Press [C] or click "Snap Frame" to grab photo stills</p>
                 </div>
               ) : (
                 <Gallery
                   frames={frames || []}
                   onRemove={handleRemoveFrame}
                   selectedIds={selectedForComparison || []}
                   onToggleSelect={handleToggleSelect}
                   onBatchRename={handleBatchRename}
                   onSeekTo={(time) => videoPlayerRef.current?.seekTo(time)}
                   onOpenEditor={(frameId) => setIsEditorOpen(true)}
                   onExportGif={() => {
                     if (frames.length < 2) {
                       alert("Need at least 2 frames to create a GIF teaser.");
                     } else {
                       setIsGifTeaserOpen(true);
                     }
                   }}
                 />
               )}
             </div>
          </div>

          {/* Terminal Window */}
          <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <Terminal onExecute={executeCommand} />
          </div>

        </section>
      </main>

      <Shelf
        onSettings={() => setIsSettingsOpen(true)}
        onHelp={() => setIsHelpOpen(true)}
        onImportCloud={() => {
          setGoogleInitialTab('drive');
          setIsGoogleModalOpen(true);
        }}
        onExportAll={() => handleExportAll()}
        onOpenEditor={() => setIsEditorOpen(true)}
        frameCount={frameCount}
        isExporting={isExporting}
      />

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-slate-900 font-sans">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between font-bold text-xs">
              <span>Creator Quick Guide & Shortcuts</span>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div>
                <h4 className="font-extrabold text-sm text-zinc-900">Frame Flow Studio v1.4.0</h4>
                <p className="text-gray-600 mt-0.5">Designed specifically for video-to-photo extraction & creator teasers</p>
                <p className="text-[11px] font-semibold text-zinc-600 mt-1">Created by Aya Kalimah Satya Ruane</p>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5 font-medium">
                <div className="font-bold text-zinc-900 mb-1">Keyboard Shortcuts:</div>
                <div className="grid grid-cols-[80px_1fr] gap-y-1 text-gray-700">
                  <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200">[ SPACE ]</span> <span>Play / Pause</span>
                  <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200">[ C ]</span> <span>Snap Frame Instant</span>
                  <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200">[ ← / → ]</span> <span>Scrub Frame-by-Frame</span>
                  <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200">[ F ]</span> <span>Toggle Fullscreen</span>
                  <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200">[ E ]</span> <span>Export Buffer to ZIP</span>
                  <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200">[ DEL ]</span> <span>Remove Selected Frame</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsHelpOpen(false);
                  setIsAboutOpen(true);
                }}
                className="text-xs font-bold text-zinc-700 hover:text-zinc-900 underline"
              >
                About Frame Flow...
              </button>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-5 py-2 font-bold text-xs bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition-colors shadow-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={exportSettings}
        onSettingsChange={setExportSettings}
        onBulkExport={handleBulkExportTrigger}
        isPro={isPro}
        onUpgradeClick={() => {
          setIsSettingsOpen(false);
          setIsProModalOpen(true);
        }}
      />

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        frames={framesToCompare}
      />

      {/* AI Analysis Modal */}
      <AnalysisModal
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        videoUrl={videoUrl}
        videoFileName={videoFile?.name || 'video'}
        onImportFrames={handleImportFrames}
        isPro={isPro}
        onUpgradeClick={() => {
          setIsAnalysisOpen(false);
          setIsProModalOpen(true);
        }}
      />

      {/* Glamour LUT Image Editor Modal */}
      <ImageEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        frames={frames || []}
        onUpdateFrame={handleUpdateFrame}
        isPro={isPro}
        onUpgradeClick={() => {
          setIsEditorOpen(false);
          setIsProModalOpen(true);
        }}
      />

      {/* Animated GIF Teaser Studio Modal */}
      <GifTeaserModal
        isOpen={isGifTeaserOpen}
        onClose={() => setIsGifTeaserOpen(false)}
        frames={framesToCompare.length >= 2 ? framesToCompare : frames}
        isPro={isPro}
        onUpgradeClick={() => {
          setIsGifTeaserOpen(false);
          setIsProModalOpen(true);
        }}
      />

      {/* Pro License & Upgrade Modal */}
      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        isPro={isPro}
        onTogglePro={handleTogglePro}
      />

      {/* About Frame Flow Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        isPro={isPro}
        onUpgradeClick={() => {
          setIsAboutOpen(false);
          setIsProModalOpen(true);
        }}
      />

      {/* Google Drive & Photos Cloud Media Import Modal */}
      <GoogleMediaModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectVideo={handleSelectGoogleVideo}
        initialTab={googleInitialTab}
      />

    </div>
  );
};

export default FrameFlowApp;

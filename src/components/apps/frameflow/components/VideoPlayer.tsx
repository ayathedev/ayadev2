import React, { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Scissors, 
  SkipBack, 
  SkipForward,
  FastForward,
  Rewind,
  Maximize,
  Minimize,
  Search,
  ZoomIn,
  ZoomOut,
  RefreshCcw,
  Activity,
  Sparkles,
  Crown
} from 'lucide-react';
import { CapturedFrame, VideoMetadata, ExportSettings } from '../types';
import VideoTimeline from './VideoTimeline';

interface VideoPlayerProps {
  src: string;
  onCapture: (frame: CapturedFrame) => void;
  onMetadata: (metadata: VideoMetadata) => void;
  fileName: string;
  settings: ExportSettings;
  onAnalyze?: () => void;
  capturedFrames?: CapturedFrame[];
}

export interface VideoPlayerHandle {
  capture: () => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  step: (dir: 1 | -1, frames?: number) => void;
  setZoom: (level: number) => void;
  bulkExport: (fps: number) => Promise<void>;
  seekTo: (time: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(({ 
  src, 
  onCapture, 
  onMetadata, 
  fileName, 
  settings, 
  onAnalyze,
  capturedFrames = []
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastAutoCaptureRef = useRef<number>(-1);
  const lastImageDataRef = useRef<ImageData | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); 
  const [isBulkExporting, setIsBulkExporting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  const togglePlay = useCallback(() => {
    if (!videoRef.current || isBulkExporting) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, isBulkExporting]);

  const toggleFullScreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const stepFrame = useCallback((direction: 1 | -1, frames: number = 1) => {
    if (!videoRef.current || isBulkExporting) return;
    videoRef.current.pause();
    setIsPlaying(false);
    const step = direction * frames * 0.04;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + step));
  }, [duration, isBulkExporting]);

  const analyzeImage = (imageData: ImageData, prevData: ImageData | null): { tags: string[]; score: number } => {
    const data = imageData.data;
    let totalLuminance = 0;
    let totalColorDiff = 0;
    let contrastSum = 0;
    
    const sampleRate = 16;
    let samples = 0;
    
    for (let i = 0; i < data.length; i += 4 * sampleRate) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuminance += luminance;
      
      if (prevData) {
        const pr = prevData.data[i];
        const pg = prevData.data[i + 1];
        const pb = prevData.data[i + 2];
        totalColorDiff += Math.abs(r - pr) + Math.abs(g - pg) + Math.abs(b - pb);
      }
      samples++;
    }
    
    const avgLuminance = totalLuminance / samples;
    const avgDiff = prevData ? totalColorDiff / (samples * 3) : 0;
    
    const tags: string[] = [];
    if (avgLuminance < 60) tags.push('moody');
    else if (avgLuminance > 180) tags.push('high-key');
    else tags.push('balanced');

    if (prevData) {
      if (avgDiff > 22) tags.push('action');
      else if (avgDiff < 6) tags.push('pose-hold');
    }

    // Calculate quality score (0 - 100)
    let score = 70;
    if (avgLuminance >= 80 && avgLuminance <= 175) score += 15; // good exposure
    if (avgDiff > 10 && avgDiff < 30) score += 15; // clear subject movement without blur

    return { tags, score: Math.min(99, Math.max(50, score)) };
  };

  const drawWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const wmConfig = settings.watermarkConfig;
    const text = wmConfig?.text || settings.watermarkText;
    if (!text || !text.trim()) return;

    const position = wmConfig?.position || 'bottom-right';
    const opacity = wmConfig?.opacity || 0.8;
    const fontSize = Math.max(14, (wmConfig?.fontSize || 18) * (width / 1280));
    const padding = Math.max(16, width * 0.025);

    ctx.save();
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    let x = width - padding;
    let y = height - padding;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';

    if (position === 'top-left') {
      x = padding;
      y = padding;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
    } else if (position === 'top-right') {
      x = width - padding;
      y = padding;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
    } else if (position === 'bottom-left') {
      x = padding;
      y = height - padding;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
    } else if (position === 'center') {
      x = width / 2;
      y = height / 2;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
    }

    ctx.fillText(text, x, y);
    ctx.restore();
  };

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || isBulkExporting) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const scale = settings.scale || 1.0;
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Draw Watermark
    drawWatermark(ctx, canvas.width, canvas.height);
    
    let tags: string[] = [];
    let qualityScore = 80;
    try {
      const analysisCanvas = document.createElement('canvas');
      const MAX_ANALYSIS_WIDTH = 320;
      const ratio = MAX_ANALYSIS_WIDTH / canvas.width;
      analysisCanvas.width = MAX_ANALYSIS_WIDTH;
      analysisCanvas.height = canvas.height * ratio;
      const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
      if (analysisCtx) {
        analysisCtx.drawImage(video, 0, 0, analysisCanvas.width, analysisCanvas.height);
        const currentData = analysisCtx.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height);
        const res = analyzeImage(currentData, lastImageDataRef.current);
        tags = res.tags;
        qualityScore = res.score;
        lastImageDataRef.current = currentData;
      }
    } catch (e) {
      console.error('Analysis failed', e);
    }

    const dataUrl = canvas.toDataURL(settings.format, settings.quality);
    const id = `${Date.now()}`;
    const ext = settings.format.split('/')[1];
    const prefix = settings.prefix || 'FRAME';
    const timestampLabel = settings.includeTimestamp ? `_T${video.currentTime.toFixed(2)}` : '';
    const captureFileName = `${prefix}${timestampLabel}_${id.slice(-4)}.${ext}`;
    
    onCapture({ 
      id, 
      dataUrl, 
      timestamp: video.currentTime, 
      fileName: captureFileName,
      captureTime: Date.now(),
      sourceFile: fileName,
      frameNumber: 0,
      tags,
      qualityScore,
      width: canvas.width,
      height: canvas.height
    });
  }, [onCapture, settings, isBulkExporting, fileName]);

  const bulkExport = async (fps: number) => {
    const video = videoRef.current;
    if (!video || isBulkExporting) return;

    try {
      // @ts-ignore - File System Access API
      const dirHandle = await window.showDirectoryPicker();
      setIsBulkExporting(true);
      video.pause();
      setIsPlaying(false);

      const interval = 1 / fps;
      const totalSteps = Math.ceil(video.duration / interval);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas context failed");

      const scale = settings.scale || 1.0;
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const originalTime = video.currentTime;

      for (let i = 0; i <= totalSteps; i++) {
        const targetTime = i * interval;
        if (targetTime > video.duration) break;

        video.currentTime = targetTime;
        
        await new Promise((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve(null);
          };
          video.addEventListener('seeked', onSeeked);
        });

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        drawWatermark(ctx, canvas.width, canvas.height);
        
        const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, settings.format, settings.quality));
        
        if (blob) {
          const ext = settings.format.split('/')[1];
          const name = `${settings.prefix}_BATCH_${i.toString().padStart(5, '0')}.${ext}`;
          const fileHandle = await dirHandle.getFileHandle(name, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        }

        setBulkProgress(Math.round((i / totalSteps) * 100));
      }

      video.currentTime = originalTime;
      alert(`SUCCESS: ${totalSteps} FRAMES DUMPED TO DISK.`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(err);
        alert("BULK EXPORT FAILED. CHECK CONSOLE.");
      }
    } finally {
      setIsBulkExporting(false);
      setBulkProgress(0);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isPlaying || isBulkExporting) return;
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    stepFrame(direction as 1 | -1);
  };

  const seekTo = useCallback((time: number) => {
    if (videoRef.current && !isBulkExporting) {
      const target = Math.max(0, Math.min(duration, time));
      videoRef.current.currentTime = target;
      setCurrentTime(target);
      lastAutoCaptureMarkFromTime(target);
    }
  }, [duration, isBulkExporting]);

  useImperativeHandle(ref, () => ({
    capture: captureFrame,
    play: () => { if(!isBulkExporting) { videoRef.current?.play(); setIsPlaying(true); } },
    pause: () => { videoRef.current?.pause(); setIsPlaying(false); },
    togglePlay: togglePlay,
    step: stepFrame,
    setZoom: (level: number) => setZoomLevel(Math.max(1, Math.min(100, level))),
    bulkExport: bulkExport,
    seekTo: seekTo
  }));

  const handleTimeUpdate = () => {
    if (videoRef.current && !isBulkExporting) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      if (settings.autoCaptureEnabled && isPlaying) {
        const currentIntervalMark = Math.floor(time / settings.autoCaptureInterval);
        if (currentIntervalMark > lastAutoCaptureRef.current) {
          captureFrame();
          lastAutoCaptureRef.current = currentIntervalMark;
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      onMetadata({
        name: fileName,
        duration: videoRef.current.duration,
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
        type: 'video/mp4'
      });
      lastAutoCaptureRef.current = -1;
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isBulkExporting) return;
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      lastAutoCaptureMarkFromTime(time);
    }
  };

  const lastAutoCaptureMarkFromTime = (time: number) => {
    lastAutoCaptureRef.current = Math.floor(time / settings.autoCaptureInterval) - (isPlaying ? 0 : 1);
  };

  const sliderRange = useMemo(() => {
    if (zoomLevel <= 1 || duration === 0) {
      return { min: 0, max: duration };
    }
    const windowSize = duration / zoomLevel;
    let min = currentTime - windowSize / 2;
    let max = currentTime + windowSize / 2;

    if (min < 0) {
      max -= min;
      min = 0;
    }
    if (max > duration) {
      min -= (max - duration);
      max = duration;
    }
    
    return { min: Math.max(0, min), max: Math.min(duration, max) };
  }, [zoomLevel, duration, currentTime]);

  useEffect(() => {
    const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white" ref={containerRef}>
      {/* Video Screen Frame */}
      <div 
        onWheel={handleWheel}
        className={`relative group flex-1 overflow-hidden flex items-center justify-center bg-black rounded-lg shadow-sm ${isFullScreen ? 'border-none' : ''}`}
      >
        <video
          ref={videoRef}
          src={src}
          className={`w-full h-full object-contain cursor-pointer ${isBulkExporting ? 'opacity-30' : 'opacity-100'}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
        
        {/* Bulk Exporting Window */}
        {isBulkExporting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
            <div className="w-[320px] bg-white rounded-xl p-4 text-black font-sans shadow-xl border border-gray-200">
              <div className="text-xs font-bold text-gray-800 flex items-center justify-between border-b pb-2 mb-3">
                <span>EXPORTING ULTRA-HD FRAMES</span>
                <span className="cursor-pointer text-gray-400">✕</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <span className="text-xs font-bold text-zinc-800">Dumping Video Sequence to Disk...</span>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <div 
                    className="h-full bg-zinc-900 transition-all duration-100"
                    style={{ width: `${bulkProgress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700 font-mono">{bulkProgress}% COMPLETE</span>
              </div>
            </div>
          </div>
        )}

        {/* Badges/Overlays */}
        {!isBulkExporting && settings.autoCaptureEnabled && isPlaying && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-xs rounded-lg text-white text-xs font-bold border border-white/10">
            <div className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
            <span>AUTO SNAP: {settings.autoCaptureInterval}S</span>
          </div>
        )}

        {!isBulkExporting && (settings.scale || 1.0) > 1.0 && (
          <div className="absolute top-3 left-32 z-20 flex items-center gap-1 px-2.5 py-1 bg-zinc-900/90 backdrop-blur-xs rounded-lg text-zinc-200 text-xs font-bold border border-zinc-700">
            <Crown className="w-3 h-3 text-zinc-300" />
            <span>{settings.scale}x SUPER-RES</span>
          </div>
        )}

        {!isBulkExporting && zoomLevel > 1 && (
          <div className="absolute top-3 right-12 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-xs rounded-lg text-white text-xs font-bold border border-white/10">
            <Search className="w-3.5 h-3.5 text-zinc-300" />
            <span>ZOOM {zoomLevel.toFixed(1)}X</span>
          </div>
        )}

        <button 
          onClick={toggleFullScreen}
          disabled={isBulkExporting}
          className={`absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center bg-black/60 hover:bg-black/80 text-white z-10 active:scale-95 transition-all border border-white/10 ${isBulkExporting ? 'hidden' : ''}`}
          title="Fullscreen (F)"
        >
          {isFullScreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Control Deck */}
      <div className={`mt-2.5 space-y-2.5 p-1 ${isFullScreen ? 'fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50' : ''}`}>
        
        {/* Scrubbable Frame Marker Timeline */}
        <VideoTimeline
          currentTime={currentTime}
          duration={duration}
          capturedFrames={capturedFrames}
          onSeek={seekTo}
          disabled={isBulkExporting}
          formatTime={formatTime}
        />

        {/* Progress Slider and Zoom Deck */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-1">
          {/* Progress Bar Track */}
          <div className="flex-1 flex flex-col w-full px-1">
            <div className="flex justify-between w-full text-xs font-bold text-gray-700 mb-1">
              <span className="font-mono">{formatTime(sliderRange.min)}</span>
              <span className="text-zinc-800">{zoomLevel > 1 ? `MAGNIFIED (${zoomLevel.toFixed(1)}x)` : ''}</span>
              <span className="font-mono">{formatTime(sliderRange.max)}</span>
            </div>
            <input
              type="range"
              min={sliderRange.min}
              max={sliderRange.max}
              step="0.001"
              disabled={isBulkExporting}
              value={currentTime}
              onChange={handleSliderChange}
              className="w-full h-3 appearance-none cursor-pointer bg-gray-200 rounded-lg accent-zinc-900 focus:outline-none"
            />
          </div>

          {/* Zoom controls */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 shrink-0 self-stretch sm:self-auto justify-center border border-gray-200">
            <button 
              onClick={() => setZoomLevel(prev => Math.max(1, prev / 2))}
              disabled={isBulkExporting}
              className="w-7 h-7 bg-white rounded-md flex items-center justify-center hover:bg-gray-50 text-gray-700 active:scale-95 transition-transform shadow-xs"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setZoomLevel(prev => Math.min(100, prev * 2))}
              disabled={isBulkExporting}
              className="w-7 h-7 bg-white rounded-md flex items-center justify-center hover:bg-gray-50 text-gray-700 active:scale-95 transition-transform shadow-xs"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setZoomLevel(1)}
              disabled={isBulkExporting}
              className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                zoomLevel === 1 
                  ? 'text-gray-400 bg-transparent cursor-not-allowed' 
                  : 'bg-white text-gray-800 hover:bg-gray-50 active:scale-95 transition-transform shadow-xs'
              }`}
              title="Reset Zoom"
            >
              <RefreshCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Playback Control Panel */}
        <div className="flex items-center justify-between gap-4 px-1 pb-1">
          {/* Rewind panel */}
          <div className="flex gap-1">
            <button 
              onClick={() => videoRef.current && (videoRef.current.currentTime = 0)} 
              disabled={isBulkExporting}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center active:scale-95 transition-transform"
              title="To Start"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button 
              onClick={() => stepFrame(-1, 5)} 
              disabled={isBulkExporting}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center active:scale-95 transition-transform"
              title="Back 5 frames"
            >
              <Rewind className="w-4 h-4" />
            </button>
            <button 
              onClick={() => stepFrame(-1)} 
              disabled={isBulkExporting}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center active:scale-95 transition-transform"
              title="Back 1 frame (Left Arrow)"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          {/* Action core: Play & Capture */}
          <div className="flex items-center gap-2">
            <button 
              onClick={togglePlay}
              disabled={isBulkExporting}
              className="h-9 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-transform shadow-sm"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
            
            <button 
              onClick={captureFrame}
              disabled={isBulkExporting}
              className="h-9 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-transform shadow-sm"
            >
              <Scissors className="w-4 h-4" />
              <span>SNAP FRAME [C]</span>
            </button>

            {onAnalyze && (
              <button 
                onClick={onAnalyze}
                disabled={isBulkExporting}
                className="h-9 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-transform"
                title="AI Pose & Quality Auto-Ranker"
              >
                <Sparkles className="w-4 h-4 text-zinc-700" />
                <span>AI VISION SCAN</span>
              </button>
            )}
          </div>

          {/* Forward panel */}
          <div className="flex gap-1">
            <button 
              onClick={() => stepFrame(1)} 
              disabled={isBulkExporting}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center active:scale-95 transition-transform"
              title="Forward 1 frame (Right Arrow)"
            >
              <ChevronRight className="w-5 h-5 stroke-[2]" />
            </button>
            <button 
              onClick={() => stepFrame(1, 5)} 
              disabled={isBulkExporting}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center active:scale-95 transition-transform"
              title="Forward 5 frames"
            >
              <FastForward className="w-4 h-4" />
            </button>
            <button 
              onClick={() => videoRef.current && (videoRef.current.currentTime = duration)} 
              disabled={isBulkExporting}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center active:scale-95 transition-transform"
              title="To End"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer;

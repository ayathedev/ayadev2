import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Activity, 
  Check, 
  TrendingUp, 
  Video, 
  Scissors, 
  Settings, 
  Sparkles,
  Award,
  AlertCircle,
  Crown,
  Lock,
  Camera,
  Layers,
  Star
} from 'lucide-react';
import { CapturedFrame } from '../types';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  videoFileName: string;
  onImportFrames: (frames: CapturedFrame[]) => void;
  isPro: boolean;
  onUpgradeClick: () => void;
}

interface SampledCandidate {
  timestamp: number;
  dataUrl: string;
  sharpness: number;
  contrast: number;
  motion: number;
  score: number;
  tags: string[];
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  videoFileName,
  onImportFrames,
  isPro,
  onUpgradeClick
}) => {
  // Config state
  const [sampleInterval, setSampleInterval] = useState<number>(0.5);
  const [maxFramesToKeep, setMaxFramesToKeep] = useState<number>(20);
  const [includeSharpness, setIncludeSharpness] = useState<boolean>(true);
  const [includeContrast, setIncludeContrast] = useState<boolean>(true);
  const [includeMotion, setIncludeMotion] = useState<boolean>(true);

  // Run state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [allScores, setAllScores] = useState<{ time: number; score: number }[]>([]);
  const [candidates, setCandidates] = useState<SampledCandidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleClose = () => {
    if (isAnalyzing) {
      if (confirm("Are you sure you want to abort the video analysis?")) {
        setIsAnalyzing(false);
      } else {
        return;
      }
    }
    onClose();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map((_, i) => i));
    }
  };

  const toggleSelectCandidate = (idx: number) => {
    if (selectedIds.includes(idx)) {
      setSelectedIds(prev => prev.filter(i => i !== idx));
    } else {
      setSelectedIds(prev => [...prev, idx]);
    }
  };

  // Real-time Canvas Chart Plotting
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSpacing = 20;
    
    for (let x = 0; x < canvas.width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    if (allScores.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Awaiting video scan signal...', canvas.width / 2, canvas.height / 2);
      return;
    }

    const maxTime = Math.max(...allScores.map(s => s.time), 1);
    
    // Draw smooth gradient path
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();

    allScores.forEach((item, idx) => {
      const x = (item.time / maxTime) * (canvas.width - 24) + 12;
      const y = canvas.height - ((item.score / 100) * (canvas.height - 24) + 12);
      
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    if (allScores.length > 0) {
      const latest = allScores[allScores.length - 1];
      const x = (latest.time / maxTime) * (canvas.width - 24) + 12;
      const y = canvas.height - ((latest.score / 100) * (canvas.height - 24) + 12);
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`QUALITY: ${latest.score.toFixed(0)}% @ ${latest.time.toFixed(1)}s`, 8, 8);
    }
  }, [allScores]);

  // Video Analysis Engine
  const startAnalysis = async () => {
    if (!videoUrl) return;

    setIsAnalyzing(true);
    setProgress(0);
    setAllScores([]);
    setCandidates([]);
    setSelectedIds([]);
    setAnalysisError(null);
    setCurrentStep('INITIALIZING VIDEO SCANNER...');

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    video.style.display = 'none';
    videoRef.current = video;

    document.body.appendChild(video);

    try {
      await new Promise<void>((resolve, reject) => {
        let isSettled = false;

        const cleanup = () => {
          video.removeEventListener('loadedmetadata', onLoaded);
          video.removeEventListener('error', onError);
          clearTimeout(timeoutId);
        };

        const onLoaded = () => {
          if (!isSettled) {
            isSettled = true;
            cleanup();
            resolve();
          }
        };

        const onError = () => {
          if (!isSettled) {
            isSettled = true;
            cleanup();
            const err = video.error;
            reject(new Error(err?.message || `Failed to load video (Error code ${err?.code || 'unknown'})`));
          }
        };

        const timeoutId = setTimeout(() => {
          if (!isSettled) {
            if (video.readyState >= 1 && video.duration && !isNaN(video.duration)) {
              isSettled = true;
              cleanup();
              resolve();
            } else {
              isSettled = true;
              cleanup();
              reject(new Error("Video loading timed out. Please check if the video format is supported."));
            }
          }
        }, 10000);

        video.addEventListener('loadedmetadata', onLoaded);
        video.addEventListener('error', onError);

        if (video.readyState >= 1 && video.duration && !isNaN(video.duration)) {
          onLoaded();
          return;
        }

        video.src = videoUrl;
        video.load();
      });

      const duration = video.duration;
      if (!duration || isNaN(duration)) {
        throw new Error("Invalid video duration");
      }

      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not initialize analytical context");

      const samplePoints: number[] = [];
      for (let t = 0; t <= duration; t += sampleInterval) {
        samplePoints.push(t);
      }
      if (samplePoints[samplePoints.length - 1] < duration - 0.1) {
        samplePoints.push(duration - 0.1);
      }

      const rawCandidates: SampledCandidate[] = [];
      let prevLuminance: Uint8Array | null = null;

      for (let i = 0; i < samplePoints.length; i++) {
        if (!videoRef.current) break;

        const time = samplePoints[i];
        setCurrentStep(`SCANNING TAPE: ${time.toFixed(1)}s / ${duration.toFixed(1)}s`);
        
        video.currentTime = time;

        await new Promise((resolve) => {
          let isResolved = false;
          const onSeek = () => {
            if (!isResolved) {
              isResolved = true;
              video.removeEventListener('seeked', onSeek);
              clearTimeout(seekTimeout);
              resolve(null);
            }
          };
          const seekTimeout = setTimeout(() => {
            if (!isResolved) {
              isResolved = true;
              video.removeEventListener('seeked', onSeek);
              resolve(null);
            }
          }, 1000);
          video.addEventListener('seeked', onSeek);
        });

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        let sharpnessScore = 0;
        let contrastScore = 0;
        let motionScore = 0;

        let totalLuminance = 0;
        const totalPixels = canvas.width * canvas.height;
        const currentLuminanceArray = new Uint8Array(totalPixels);

        for (let p = 0; p < totalPixels; p++) {
          const idx = p * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          currentLuminanceArray[p] = lum;
          totalLuminance += lum;
        }

        const meanLuminance = totalLuminance / totalPixels;

        let varianceSum = 0;
        for (let p = 0; p < totalPixels; p += 4) {
          varianceSum += Math.pow(currentLuminanceArray[p] - meanLuminance, 2);
        }
        const stdDev = Math.sqrt(varianceSum / (totalPixels / 4));
        contrastScore = 100 - Math.min(100, Math.abs(stdDev - 50) * 1.6);
        contrastScore = Math.max(0, contrastScore);

        let localDiffs = 0;
        let diffCount = 0;
        for (let y = 2; y < canvas.height - 2; y += 3) {
          for (let x = 2; x < canvas.width - 2; x += 3) {
            const idx = y * canvas.width + x;
            const center = currentLuminanceArray[idx];
            const dRight = Math.abs(center - currentLuminanceArray[idx + 1]);
            const dBottom = Math.abs(center - currentLuminanceArray[idx + canvas.width]);
            localDiffs += dRight + dBottom;
            diffCount += 2;
          }
        }
        const meanDiff = diffCount > 0 ? (localDiffs / diffCount) : 0;
        sharpnessScore = Math.min(100, (meanDiff / 14) * 100);

        if (prevLuminance) {
          let totalFrameDiff = 0;
          for (let p = 0; p < totalPixels; p += 4) {
            totalFrameDiff += Math.abs(currentLuminanceArray[p] - prevLuminance[p]);
          }
          const meanFrameDiff = totalFrameDiff / (totalPixels / 4);
          motionScore = Math.min(100, (meanFrameDiff / 16) * 100);
        } else {
          motionScore = 50;
        }

        prevLuminance = currentLuminanceArray;

        let activeWeights = 0;
        let weightedSum = 0;

        if (includeSharpness) { weightedSum += sharpnessScore * 0.45; activeWeights += 0.45; }
        if (includeContrast) { weightedSum += contrastScore * 0.35; activeWeights += 0.35; }
        if (includeMotion) { weightedSum += motionScore * 0.20; activeWeights += 0.20; }

        const finalScore = activeWeights > 0 ? (weightedSum / activeWeights) : 50;

        setAllScores(prev => [...prev, { time, score: finalScore }]);

        const captureCanvas = document.createElement('canvas');
        captureCanvas.width = video.videoWidth || 640;
        captureCanvas.height = video.videoHeight || 480;
        const captureCtx = captureCanvas.getContext('2d');
        if (captureCtx) {
          captureCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
          const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.9);

          const tags: string[] = [];
          if (sharpnessScore > 70) tags.push('SHARP');
          if (contrastScore > 75) tags.push('HIGH GLOW');
          if (motionScore > 65) tags.push('DYNAMIC POSE');
          if (sharpnessScore < 30) tags.push('BLUR');

          rawCandidates.push({
            timestamp: time,
            dataUrl,
            sharpness: sharpnessScore,
            contrast: contrastScore,
            motion: motionScore,
            score: finalScore,
            tags
          });
        }

        setProgress(Math.round(((i + 1) / samplePoints.length) * 100));
        await new Promise(r => setTimeout(r, 20));
      }

      setCurrentStep('EXTRACTING TOP QUALITY SHOTS...');
      
      const sorted = [...rawCandidates].sort((a, b) => b.score - a.score);
      const uniqueCandidates: SampledCandidate[] = [];
      for (const item of sorted) {
        const isNearExisting = uniqueCandidates.some(u => Math.abs(u.timestamp - item.timestamp) < 1.0);
        if (!isNearExisting) {
          uniqueCandidates.push(item);
        }
        if (uniqueCandidates.length >= maxFramesToKeep) break;
      }

      uniqueCandidates.sort((a, b) => a.timestamp - b.timestamp);
      setCandidates(uniqueCandidates);
      setSelectedIds(uniqueCandidates.map((_, i) => i));
      setCurrentStep('SCAN COMPLETE!');

    } catch (err: any) {
      console.error("Video analysis error:", err);
      setAnalysisError(err?.message || "Video analysis encountered an error. Please verify the media file.");
    } finally {
      setIsAnalyzing(false);
      if (videoRef.current && videoRef.current.parentNode) {
        videoRef.current.parentNode.removeChild(videoRef.current);
      }
      videoRef.current = null;
    }
  };

  const handleImport = () => {
    if (selectedIds.length === 0) return;

    const framesToImport = candidates
      .filter((_, idx) => selectedIds.includes(idx))
      .map((item, idx) => {
        const timestampStr = item.timestamp.toFixed(2);
        const nameClean = videoFileName.split('.')[0].toUpperCase();
        return {
          id: `ANALYZE_${Date.now()}_${idx}`,
          dataUrl: item.dataUrl,
          timestamp: item.timestamp,
          fileName: `${nameClean}_TOP_${timestampStr.replace('.', '_')}.JPG`,
          captureTime: Date.now(),
          sourceFile: videoFileName,
          frameNumber: idx + 1,
          qualityScore: Math.round(item.score),
          tags: item.tags
        };
      });

    onImportFrames(framesToImport);
    onClose();
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-black font-sans select-none animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={handleClose} />
      
      {/* Main Window */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm">AI Vision Pose & Dynamic Lighting Scanner</span>
              <span className="ml-2 text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700 font-bold">
                STANDARD
              </span>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col md:flex-row gap-5 overflow-y-auto bg-slate-50">
          
          {/* Left panel - Configuration & Live Graph */}
          <div className="flex-1 flex flex-col gap-4 min-w-[280px]">
            
            {/* Options group */}
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Quality Heuristics</span>
                </span>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input 
                    type="checkbox" 
                    disabled={isAnalyzing || candidates.length > 0}
                    checked={includeSharpness} 
                    onChange={(e) => setIncludeSharpness(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 accent-zinc-900 cursor-pointer"
                  />
                  <span>Sharpness & Eye Focus (Eliminates blur)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input 
                    type="checkbox" 
                    disabled={isAnalyzing || candidates.length > 0}
                    checked={includeContrast} 
                    onChange={(e) => setIncludeContrast(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 accent-zinc-900 cursor-pointer"
                  />
                  <span>Dynamic Glamour Lighting & Exposure</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input 
                    type="checkbox" 
                    disabled={isAnalyzing || candidates.length > 0}
                    checked={includeMotion} 
                    onChange={(e) => setIncludeMotion(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 accent-zinc-900 cursor-pointer"
                  />
                  <span>Peak Pose Action & Gesture Changes</span>
                </label>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1 text-gray-700">
                    <span>Sample Density:</span>
                    <span className="text-zinc-900 font-mono">Every {sampleInterval.toFixed(1)}s</span>
                  </div>
                  <input 
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    disabled={isAnalyzing || candidates.length > 0}
                    value={sampleInterval}
                    onChange={(e) => setSampleInterval(parseFloat(e.target.value))}
                    className="w-full h-3 appearance-none cursor-pointer bg-gray-100 rounded-lg accent-zinc-900"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1 text-gray-700">
                    <span>Extract Top Candidates:</span>
                    <span className="text-zinc-900 font-mono">Top {maxFramesToKeep} Frames</span>
                  </div>
                  <input 
                    type="range"
                    min="3"
                    max="50"
                    disabled={isAnalyzing || candidates.length > 0}
                    value={maxFramesToKeep}
                    onChange={(e) => setMaxFramesToKeep(parseInt(e.target.value))}
                    className="w-full h-3 appearance-none cursor-pointer bg-gray-100 rounded-lg accent-zinc-900"
                  />
                </div>
              </div>
            </div>

            {/* Oscilloscope Chart */}
            <div className="flex-1 flex flex-col min-h-[160px] p-3 bg-white rounded-xl border border-gray-200 shadow-xs">
              <div className="text-xs font-bold text-gray-700 flex items-center justify-between mb-2">
                <span>Signal Waveform (Quality vs. Timeline)</span>
                <TrendingUp className="w-3.5 h-3.5 text-zinc-700" />
              </div>
              <div className="flex-1 relative rounded-lg overflow-hidden border border-gray-800">
                <canvas 
                  ref={chartCanvasRef} 
                  width={340} 
                  height={150} 
                  className="w-full h-full object-fill block"
                />
              </div>
            </div>

          </div>

          {/* Right panel - Candidate output */}
          <div className="flex-[1.2] flex flex-col min-h-[340px] p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
            <div className="text-xs font-bold text-gray-800 flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
              <span>Best Ranked Frame Candidates</span>
              {candidates.length > 0 && (
                <span className="text-[11px] font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                  {candidates.length} Keyframes Found
                </span>
              )}
            </div>

            {candidates.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-gray-200 border-dashed text-center">
                {analysisError && !isAnalyzing ? (
                  <div className="w-full max-w-sm p-4 bg-rose-50 border border-rose-200 rounded-xl text-center mb-3">
                    <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-rose-800 mb-1">Scanning Interrupted</p>
                    <p className="text-[11px] text-rose-600 mb-3">{analysisError}</p>
                    <button
                      onClick={startAnalysis}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                    >
                      Retry Analysis
                    </button>
                  </div>
                ) : (
                  <>
                    <Video className="w-12 h-12 text-slate-400 mb-3" />
                    {isAnalyzing ? (
                      <div className="w-full max-w-xs space-y-3">
                        <span className="text-xs font-bold text-zinc-900 block animate-pulse">
                          {currentStep}
                        </span>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-zinc-900 transition-all duration-100" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-600 block">{progress}% Video Analyzed</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-gray-700 mb-3">
                          Auto-scan full recording to extract the crispest, best-lit shots.
                        </p>
                        <button 
                          onClick={startAnalysis}
                          className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-2 mx-auto"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Scan Video for Best Frames</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-xs font-bold mb-2">
                  <span className="text-gray-700">Top Candidates ({selectedIds.length} Selected)</span>
                  <button 
                    onClick={toggleSelectAll}
                    className="px-2 py-1 bg-white hover:bg-gray-100 rounded-md border border-gray-200 text-zinc-900 text-[11px] active:scale-95 transition-transform"
                  >
                    {selectedIds.length === candidates.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {/* Candidate List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {candidates.map((item, idx) => {
                    const isSelected = selectedIds.includes(idx);
                    return (
                      <div 
                        key={idx}
                        onClick={() => toggleSelectCandidate(idx)}
                        className={`flex gap-3 p-2 rounded-xl border cursor-pointer items-center transition-all ${
                          isSelected ? 'border-zinc-900 bg-zinc-100/80 shadow-xs' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-zinc-900 accent-zinc-900 pointer-events-none"
                        />

                        <div className="w-[84px] aspect-video bg-black rounded-lg overflow-hidden shrink-0">
                          <img src={item.dataUrl} className="w-full h-full object-cover" alt={`Frame ${idx}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold text-xs text-gray-900 font-mono">
                              {formatTime(item.timestamp)}
                            </span>
                            <span className="text-[11px] font-extrabold text-zinc-800 bg-zinc-100 px-1.5 py-0.2 rounded-full flex items-center gap-0.5 border border-zinc-200">
                              <Star className="w-2.5 h-2.5 fill-zinc-700 text-zinc-700" />
                              <span>{item.score.toFixed(0)}% Score</span>
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((t, ti) => (
                              <span key={ti} className="text-[8px] font-extrabold bg-white text-zinc-700 px-1.5 py-0.2 rounded border border-zinc-200">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Footer controls */}
        <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-zinc-700" />
            <span>AI scores sharpness, dynamic lighting, and contrast</span>
          </div>
          <div className="flex gap-2">
            {candidates.length > 0 && (
              <button 
                onClick={() => {
                  setCandidates([]);
                  setAllScores([]);
                  setSelectedIds([]);
                  setProgress(0);
                }}
                className="px-4 py-2 font-bold text-xs bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors"
              >
                Clear Results
              </button>
            )}
            <button 
              onClick={handleImport}
              disabled={selectedIds.length === 0}
              className={`px-5 py-2 font-bold text-xs rounded-xl transition-all ${
                selectedIds.length === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs active:scale-95'
              }`}
            >
              Import Selected to Buffer ({selectedIds.length})
            </button>
            <button 
              onClick={handleClose}
              className="px-4 py-2 font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalysisModal;

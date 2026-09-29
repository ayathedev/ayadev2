import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Film, 
  Play, 
  Pause, 
  Sparkles, 
  Crown, 
  Download, 
  Repeat, 
  Sliders, 
  Type, 
  Check, 
  Clock, 
  Layers,
  ArrowLeftRight
} from 'lucide-react';
import { CapturedFrame } from '../types';
import { saveAs } from 'file-saver';
// @ts-ignore
import gifshot from 'gifshot';

interface GifTeaserModalProps {
  isOpen: boolean;
  onClose: () => void;
  frames: CapturedFrame[];
  isPro: boolean;
  onUpgradeClick: () => void;
}

export const GifTeaserModal: React.FC<GifTeaserModalProps> = ({
  isOpen,
  onClose,
  frames,
  isPro,
  onUpgradeClick
}) => {
  const [fps, setFps] = useState<number>(20);
  const [speed, setSpeed] = useState<number>(1.0);
  const [pingPong, setPingPong] = useState<boolean>(true);
  const [caption, setCaption] = useState<string>('');
  const [captionPosition, setCaptionPosition] = useState<'top' | 'bottom'>('bottom');
  const [quality, setQuality] = useState<number>(10);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [generatedGifUrl, setGeneratedGifUrl] = useState<string | null>(null);

  const previewTimerRef = useRef<any>(null);

  const sortedFrames = [...frames].sort((a, b) => a.timestamp - b.timestamp);
  
  // Create effective frame list with ping-pong if enabled
  const animationFrames = React.useMemo(() => {
    if (!sortedFrames.length) return [];
    if (pingPong && sortedFrames.length > 2) {
      const reversed = [...sortedFrames.slice(1, -1)].reverse();
      return [...sortedFrames, ...reversed];
    }
    return sortedFrames;
  }, [sortedFrames, pingPong]);

  // Preview loop
  useEffect(() => {
    if (!isOpen || !isPlayingPreview || animationFrames.length === 0) return;

    const intervalMs = (1000 / (fps * speed));
    previewTimerRef.current = setInterval(() => {
      setPreviewIndex(prev => (prev + 1) % animationFrames.length);
    }, intervalMs);

    return () => {
      if (previewTimerRef.current) clearInterval(previewTimerRef.current);
    };
  }, [isOpen, isPlayingPreview, animationFrames, fps, speed]);

  if (!isOpen) return null;

  const handleGenerateGif = async () => {
    if (animationFrames.length < 2) {
      alert("Please select at least 2 frames.");
      return;
    }

    setIsGenerating(true);
    setProgress(15);
    setGeneratedGifUrl(null);

    try {
      // Process images on canvas to draw caption if needed
      const processedImages: string[] = [];
      const sampleFrame = animationFrames[0];
      const targetWidth = Math.min(sampleFrame.width || 640, 720);
      const targetHeight = Math.round((sampleFrame.height || 360) * (targetWidth / (sampleFrame.width || 640)));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      for (let i = 0; i < animationFrames.length; i++) {
        const frame = animationFrames[i];
        if (ctx) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = frame.dataUrl;
          await new Promise(r => { img.onload = r; });

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Add caption overlay
          if (caption.trim()) {
            const fontSize = Math.max(14, canvas.height * 0.06);
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = captionPosition === 'bottom' ? 'bottom' : 'top';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 6;
            
            const textY = captionPosition === 'bottom' ? canvas.height - 12 : 12;
            ctx.fillText(caption.toUpperCase(), canvas.width / 2, textY);
            ctx.shadowBlur = 0;
          }

          processedImages.push(canvas.toDataURL('image/jpeg', 0.85));
        }
        setProgress(Math.round(15 + (i / animationFrames.length) * 40));
      }

      const calculatedInterval = (1 / (fps * speed));

      gifshot.createGIF({
        images: processedImages,
        gifWidth: targetWidth,
        gifHeight: targetHeight,
        interval: calculatedInterval,
        numFrames: processedImages.length,
        sampleInterval: quality // Color quantization
      }, (obj: any) => {
        setIsGenerating(false);
        if (!obj.error) {
          setGeneratedGifUrl(obj.image);
          setProgress(100);
        } else {
          console.error(obj.error);
          alert("GIF encoding failed. Try reducing frame count.");
        }
      });

    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      alert("Failed to build GIF.");
    }
  };

  const handleDownloadGif = () => {
    if (!generatedGifUrl) return;
    fetch(generatedGifUrl)
      .then(res => res.blob())
      .then(blob => {
        saveAs(blob, `CREATOR_TEASER_${Date.now()}.gif`);
      });
  };

  const currentPreviewFrame = animationFrames[previewIndex] || animationFrames[0];

  return (
    <div className="fixed inset-0 z-[550] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans select-none animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Animated GIF & Social Teaser Studio</span>
                <span className="text-[10px] font-extrabold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
                  STANDARD
                </span>
              </h3>
              <p className="text-xs text-slate-400">Turn selected frames into loopable teasers & promo clips</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          
          {/* Left: Interactive Preview Player */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 bg-slate-900/5">
            
            <div className="w-full max-w-md aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-gray-300 relative flex items-center justify-center">
              {currentPreviewFrame ? (
                <>
                  <img 
                    src={currentPreviewFrame.dataUrl} 
                    alt="GIF frame preview" 
                    className="w-full h-full object-contain"
                  />
                  {caption.trim() && (
                    <div className={`absolute left-0 right-0 px-4 text-center ${captionPosition === 'top' ? 'top-3' : 'bottom-3'}`}>
                      <span className="inline-block bg-black/70 text-white font-extrabold text-xs px-3 py-1 rounded-md shadow-md">
                        {caption.toUpperCase()}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <span className="text-xs text-gray-500">No frames loaded</span>
              )}
            </div>

            {/* Playback Controls & Frame Indicator */}
            <div className="mt-4 flex items-center gap-3 w-full max-w-md justify-between bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-xs">
              <button 
                onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                className="h-8 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingPreview ? 'Pause' : 'Play'}</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                <Layers className="w-3.5 h-3.5 text-gray-400" />
                <span>Frame {previewIndex + 1} of {animationFrames.length}</span>
                {pingPong && <span className="text-[10px] bg-zinc-200 text-zinc-800 font-bold px-1.5 rounded">BOUNCE</span>}
              </div>

              <div className="text-xs font-bold text-zinc-900 font-mono">
                {((animationFrames.length / (fps * speed))).toFixed(1)}s Loop
              </div>
            </div>

          </div>

          {/* Right: Studio Controls */}
          <div className="w-full md:w-80 p-5 bg-white flex flex-col justify-between overflow-y-auto space-y-4">
            
            <div className="space-y-4">
              
              {/* Framerate Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-700">Frame Rate (FPS):</span>
                  <span className="text-zinc-900 font-mono">{fps} FPS</span>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="30"
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value))}
                  className="w-full h-4 appearance-none bg-gray-100 border border-gray-200 rounded-lg cursor-pointer accent-zinc-900"
                />
              </div>

              {/* Speed Multiplier */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Playback Speed:</span>
                  <span className="text-zinc-900 font-mono">{speed}x</span>
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[0.5, 1.0, 1.5, 2.0].map(s => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`py-1 rounded-lg text-xs font-bold transition-all ${
                        speed === s 
                          ? 'bg-zinc-900 text-white shadow-xs' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Ping-Pong Loop Toggle */}
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-zinc-700" />
                  <div>
                    <div className="text-xs font-bold text-gray-900">Ping-Pong Loop</div>
                    <div className="text-[11px] text-gray-500">Plays forward then reverses</div>
                  </div>
                </div>
                <input 
                  type="checkbox"
                  checked={pingPong}
                  onChange={(e) => setPingPong(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-900 accent-zinc-900 cursor-pointer"
                />
              </div>

              {/* Teaser Caption */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-gray-400" />
                  <span>Teaser Overlay Text (Optional):</span>
                </label>
                <input 
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. LINK IN BIO • NEW DROP"
                  className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-zinc-400 focus:outline-none"
                />
                {caption && (
                  <div className="flex gap-2 text-[11px]">
                    <button 
                      onClick={() => setCaptionPosition('top')}
                      className={`px-2 py-0.5 rounded font-bold ${captionPosition === 'top' ? 'bg-zinc-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      Top
                    </button>
                    <button 
                      onClick={() => setCaptionPosition('bottom')}
                      className={`px-2 py-0.5 rounded font-bold ${captionPosition === 'bottom' ? 'bg-zinc-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      Bottom
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              {isGenerating ? (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-zinc-900 h-full transition-all duration-150" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-center text-xs font-bold text-zinc-800 animate-pulse">
                    Rendering GIF ({progress}%)...
                  </div>
                </div>
              ) : generatedGifUrl ? (
                <button 
                  onClick={handleDownloadGif}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Finished GIF</span>
                </button>
              ) : (
                <button 
                  onClick={handleGenerateGif}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Render Animated GIF</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default GifTeaserModal;

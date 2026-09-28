import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, Sliders, Music, RefreshCw, Activity, Sparkles } from 'lucide-react';

export const SynthLabApp: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(115);
  const [currentStep, setCurrentStep] = useState(0);
  const [cutoff, setCutoff] = useState(1200);
  const [waveform, setWaveform] = useState<OscillatorType>('sawtooth');

  // 16-step grid for Kick, Snare, HiHat, Lead Synth
  const [grid, setGrid] = useState<boolean[][]>([
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],             // HiHat
    [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false]  // Synth Lead
  ]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<any>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      analyserRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Sound generator helpers
  const playSound = (row: number, frequency: number = 440) => {
    if (!audioCtxRef.current || !analyserRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    if (row === 0) { // Kick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.15);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(analyserRef.current);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (row === 1) { // Snare
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(analyserRef.current);
      noise.start(now);
      noise.stop(now + 0.1);
    } else if (row === 2) { // HiHat
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(8000, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(analyserRef.current);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (row === 3) { // Synth Lead
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = waveform;
      osc.frequency.setValueAtTime(frequency, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoff, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(analyserRef.current);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  };

  // Step sequencer loop
  useEffect(() => {
    if (isPlaying) {
      const stepInterval = (60 / bpm / 4) * 1000; // 16th note timing
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          const next = (prev + 1) % 16;
          // Trigger notes for this step
          grid.forEach((row, rowIdx) => {
            if (row[next]) {
              const synthFreqs = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
              const freq = synthFreqs[next % synthFreqs.length];
              playSound(rowIdx, freq);
            }
          });
          return next;
        });
      }, stepInterval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, grid, cutoff, waveform]);

  // Frequency Visualizer Canvas
  useEffect(() => {
    let animationFrame: number;
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const barWidth = (canvas.width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          ctx.fillStyle = `rgb(16, 185, 129)`; // Emerald synth bar
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      }
      animationFrame = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const toggleStep = (row: number, col: number) => {
    setGrid((prev) => {
      const copy = prev.map((r) => [...r]);
      copy[row][col] = !copy[row][col];
      return copy;
    });
  };

  const trackNames = ['Kick', 'Snare', 'HiHat', 'Synth Lead'];

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Controls */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              initAudio();
              setIsPlaying(!isPlaying);
            }}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isPlaying ? 'Stop Loop' : 'Play Loop'}</span>
          </button>

          {/* BPM */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400">Tempo:</span>
            <input
              type="range"
              min="60"
              max="180"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-20 accent-emerald-500"
            />
            <span className="font-mono text-emerald-400 font-bold w-12">{bpm} BPM</span>
          </div>

          {/* Cutoff Filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400">Filter Cutoff:</span>
            <input
              type="range"
              min="200"
              max="4000"
              value={cutoff}
              onChange={(e) => setCutoff(Number(e.target.value))}
              className="w-20 accent-blue-500"
            />
            <span className="font-mono text-blue-400 font-bold w-12">{cutoff}Hz</span>
          </div>
        </div>

        {/* Real-time Frequency Visualizer */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase hidden sm:inline">DSP Frequency Output</span>
          <canvas
            ref={visualizerCanvasRef}
            width={120}
            height={32}
            className="bg-slate-950 border border-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* 16-Step Sequencer Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950">
        <div className="space-y-2">
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-2">
              <div className="w-24 text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{trackNames[rowIdx]}</span>
              </div>

              <div className="flex-1 grid grid-cols-16 gap-1">
                {row.map((active, colIdx) => {
                  const isCurrent = currentStep === colIdx && isPlaying;
                  return (
                    <button
                      key={colIdx}
                      onClick={() => {
                        initAudio();
                        toggleStep(rowIdx, colIdx);
                        if (!active) playSound(rowIdx, 440);
                      }}
                      className={`h-11 rounded-lg border transition-all ${
                        active
                          ? 'bg-emerald-500 border-emerald-400 shadow-sm text-slate-950'
                          : colIdx % 4 === 0
                          ? 'bg-slate-800/80 border-slate-700'
                          : 'bg-slate-900 border-slate-800'
                      } ${isCurrent ? 'ring-2 ring-white scale-105' : ''}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Live Synth Keyboard Keys */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Playable Subtractive Synth Keyboard
            </span>

            {/* Waveform Select */}
            <div className="flex gap-1">
              {(['sawtooth', 'square', 'sine', 'triangle'] as OscillatorType[]).map((w) => (
                <button
                  key={w}
                  onClick={() => setWaveform(w)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize transition-colors ${
                    waveform === w ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-1 h-20">
            {[
              { note: 'C4', freq: 261.63 },
              { note: 'D4', freq: 293.66 },
              { note: 'E4', freq: 329.63 },
              { note: 'F4', freq: 349.23 },
              { note: 'G4', freq: 392.00 },
              { note: 'A4', freq: 440.00 },
              { note: 'B4', freq: 493.88 },
              { note: 'C5', freq: 523.25 },
            ].map((k) => (
              <button
                key={k.note}
                onClick={() => {
                  initAudio();
                  playSound(3, k.freq);
                }}
                className="flex-1 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-b-xl border-t-2 border-emerald-500 font-mono text-xs font-bold transition-all active:scale-95 flex items-end justify-center pb-2 shadow-md"
              >
                {k.note}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

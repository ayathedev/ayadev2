import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Square as StopSquare, 
  Sparkles, 
  Keyboard, 
  Touchpad, 
  Mic, 
  Scissors, 
  Music2, 
  Activity, 
  Sliders, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Check, 
  ChevronDown, 
  Layers, 
  Radio, 
  Zap, 
  Info,
  Maximize2
} from 'lucide-react';

export type PlayMode = 'oneshot' | 'loop' | 'hold';
export type PadColor = 'rose' | 'amber' | 'emerald' | 'cyan' | 'violet' | 'pink' | 'blue' | 'indigo' | 'orange' | 'lime';

export interface PadConfig {
  id: number;
  name: string;
  category: 'drum' | 'bass' | 'synth' | 'vocal' | 'fx' | 'acoustic' | 'custom';
  color: PadColor;
  mode: PlayMode;
  volume: number;
  pitchSemitones: number;
  cutoffFreq: number;
  pan: number;
  trimStart: number;
  trimEnd: number;
  sampleType: 'preset_synth' | 'audio_url' | 'indexeddb';
  synthType: string;
  keyBinding: string;
}

export interface KitSnapshot {
  id: string;
  name: string;
  timestamp: number;
  pads: PadConfig[];
}

export interface Kit {
  id: string;
  name: string;
  description: string;
  pads: PadConfig[];
}

const COLOR_CLASSES: Record<PadColor, { bg: string; border: string; text: string; glow: string; activeBg: string }> = {
  rose: { bg: 'bg-rose-950/40', border: 'border-rose-500/40', text: 'text-rose-400', glow: 'shadow-rose-500/30', activeBg: 'bg-rose-600' },
  amber: { bg: 'bg-amber-950/40', border: 'border-amber-500/40', text: 'text-amber-400', glow: 'shadow-amber-500/30', activeBg: 'bg-amber-600' },
  emerald: { bg: 'bg-emerald-950/40', border: 'border-emerald-500/40', text: 'text-emerald-400', glow: 'shadow-emerald-500/30', activeBg: 'bg-emerald-600' },
  cyan: { bg: 'bg-cyan-950/40', border: 'border-cyan-500/40', text: 'text-cyan-400', glow: 'shadow-cyan-500/30', activeBg: 'bg-cyan-600' },
  violet: { bg: 'bg-violet-950/40', border: 'border-violet-500/40', text: 'text-violet-400', glow: 'shadow-violet-500/30', activeBg: 'bg-violet-600' },
  pink: { bg: 'bg-pink-950/40', border: 'border-pink-500/40', text: 'text-pink-400', glow: 'shadow-pink-500/30', activeBg: 'bg-pink-600' },
  blue: { bg: 'bg-blue-950/40', border: 'border-blue-500/40', text: 'text-blue-400', glow: 'shadow-blue-500/30', activeBg: 'bg-blue-600' },
  indigo: { bg: 'bg-indigo-950/40', border: 'border-indigo-500/40', text: 'text-indigo-400', glow: 'shadow-indigo-500/30', activeBg: 'bg-indigo-600' },
  orange: { bg: 'bg-orange-950/40', border: 'border-orange-500/40', text: 'text-orange-400', glow: 'shadow-orange-500/30', activeBg: 'bg-orange-600' },
  lime: { bg: 'bg-lime-950/40', border: 'border-lime-500/40', text: 'text-lime-400', glow: 'shadow-lime-500/30', activeBg: 'bg-lime-600' },
};

const INITIAL_PADS: PadConfig[] = [
  // Row 1: Drums
  { id: 0, name: 'Kick Punch', category: 'drum', color: 'rose', mode: 'oneshot', volume: 0.9, pitchSemitones: 0, cutoffFreq: 12000, pan: 0, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'kick', keyBinding: '1' },
  { id: 1, name: 'Crisp Snare', category: 'drum', color: 'rose', mode: 'oneshot', volume: 0.85, pitchSemitones: 0, cutoffFreq: 15000, pan: 0, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'snare', keyBinding: '2' },
  { id: 2, name: 'HiHat Closed', category: 'drum', color: 'amber', mode: 'oneshot', volume: 0.7, pitchSemitones: 0, cutoffFreq: 18000, pan: -0.2, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'hihat_closed', keyBinding: '3' },
  { id: 3, name: 'HiHat Open', category: 'drum', color: 'amber', mode: 'oneshot', volume: 0.75, pitchSemitones: 0, cutoffFreq: 18000, pan: 0.2, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'hihat_open', keyBinding: '4' },

  // Row 2: Claps & Bass
  { id: 4, name: 'Stack Clap', category: 'drum', color: 'orange', mode: 'oneshot', volume: 0.85, pitchSemitones: 0, cutoffFreq: 14000, pan: 0, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'clap', keyBinding: 'Q' },
  { id: 5, name: '808 Sub Drop', category: 'bass', color: 'emerald', mode: 'oneshot', volume: 0.95, pitchSemitones: -2, cutoffFreq: 4000, pan: 0, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'sub_bass', keyBinding: 'W' },
  { id: 6, name: 'Wobble Bass', category: 'bass', color: 'emerald', mode: 'hold', volume: 0.9, pitchSemitones: 0, cutoffFreq: 3000, pan: 0, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'dubstep_wobble', keyBinding: 'E' },
  { id: 7, name: 'Yoi Growl', category: 'bass', color: 'lime', mode: 'hold', volume: 0.85, pitchSemitones: 0, cutoffFreq: 5000, pan: 0.1, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'dubstep_yoi_growl', keyBinding: 'R' },

  // Row 3: Melodic & Plucks
  { id: 8, name: 'Neon Pluck', category: 'synth', color: 'cyan', mode: 'oneshot', volume: 0.8, pitchSemitones: 4, cutoffFreq: 8000, pan: -0.3, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'synth_pluck', keyBinding: 'A' },
  { id: 9, name: 'Dream Chords', category: 'synth', color: 'blue', mode: 'hold', volume: 0.8, pitchSemitones: 0, cutoffFreq: 6000, pan: 0.3, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'synth_chord', keyBinding: 'S' },
  { id: 10, name: 'Screamer Lead', category: 'synth', color: 'violet', mode: 'hold', volume: 0.85, pitchSemitones: 7, cutoffFreq: 10000, pan: 0, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'screamer_lead', keyBinding: 'D' },
  { id: 11, name: 'Acoustic Strum', category: 'acoustic', color: 'amber', mode: 'oneshot', volume: 0.8, pitchSemitones: 0, cutoffFreq: 11000, pan: 0, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'acoustic_guitar', keyBinding: 'F' },

  // Row 4: Vocal & FX
  { id: 12, name: 'Vocal "Hey!"', category: 'vocal', color: 'pink', mode: 'oneshot', volume: 0.85, pitchSemitones: 0, cutoffFreq: 12000, pan: 0, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'vocal_hey', keyBinding: 'Z' },
  { id: 13, name: 'Tape Stop FX', category: 'fx', color: 'indigo', mode: 'oneshot', volume: 0.8, pitchSemitones: -4, cutoffFreq: 8000, pan: 0, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'laser_fx', keyBinding: 'X' },
  { id: 14, name: 'Cowbell Bell', category: 'acoustic', color: 'amber', mode: 'oneshot', volume: 0.75, pitchSemitones: 2, cutoffFreq: 16000, pan: 0.2, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'cowbell', keyBinding: 'C' },
  { id: 15, name: 'Glitch Metallic', category: 'fx', color: 'cyan', mode: 'oneshot', volume: 0.8, pitchSemitones: 5, cutoffFreq: 14000, pan: -0.2, trimStart: 0, trimEnd: 1, sampleType: 'preset_synth', synthType: 'glitch_hit', keyBinding: 'V' },
];

export const BuskerPadApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'singer' | 'pads' | 'synth' | 'sequencer' | 'looper' | 'cloud'>('singer');
  const [pads, setPads] = useState<PadConfig[]>(INITIAL_PADS);
  const [activePads, setActivePads] = useState<Set<number>>(new Set());
  const [editingPad, setEditingPad] = useState<PadConfig | null>(null);
  const [bpm, setBpm] = useState<number>(128);
  const [isAudioInitialized, setIsAudioInitialized] = useState<boolean>(false);
  const [isChopperOpen, setIsChopperOpen] = useState<boolean>(false);
  const [chopperPadId, setChopperPadId] = useState<number>(0);
  const [currentKitName, setCurrentKitName] = useState<string>('Busker Street Live Kit');

  // Snapshots
  const [snapshots, setSnapshots] = useState<KitSnapshot[]>([
    { id: 'snap_verse', name: 'Verse', timestamp: Date.now(), pads: INITIAL_PADS.map(p => ({ ...p, volume: p.category === 'bass' ? 0.6 : p.volume })) },
    { id: 'snap_chorus', name: 'Chorus', timestamp: Date.now(), pads: INITIAL_PADS.map(p => ({ ...p, volume: 1.0 })) },
    { id: 'snap_bridge', name: 'Bridge', timestamp: Date.now(), pads: INITIAL_PADS.map(p => ({ ...p, pitchSemitones: p.category === 'synth' ? 2 : p.pitchSemitones })) },
    { id: 'snap_drop', name: 'Drop', timestamp: Date.now(), pads: INITIAL_PADS.map(p => ({ ...p, volume: 1.0, pitchSemitones: p.category === 'bass' ? -2 : p.pitchSemitones })) },
  ]);
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>('snap_chorus');

  // Sequencer state
  const [isSequencerPlaying, setIsSequencerPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [sequenceGrid, setSequenceGrid] = useState<boolean[][]>([
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],             // HiHat
    [true, false, true, false, false, false, true, false, true, false, true, false, false, true, false, false],    // Bass
  ]);

  // Pentatonic Synth state
  const [synthScale, setSynthScale] = useState<'major' | 'minor' | 'blues'>('minor');
  const [synthOctave, setSynthOctave] = useState<number>(0);
  const [synthWaveform, setSynthWaveform] = useState<OscillatorType>('sawtooth');
  const [synthFilterCutoff, setSynthFilterCutoff] = useState<number>(3500);

  // Looper state
  const [looperTracks, setLooperTracks] = useState<{ id: number; name: string; isRecording: boolean; isPlaying: boolean; volume: number }[]>([
    { id: 1, name: 'Beat Loop', isRecording: false, isPlaying: false, volume: 0.9 },
    { id: 2, name: 'Bass Groove', isRecording: false, isPlaying: false, volume: 0.85 },
    { id: 3, name: 'Vocal Hook', isRecording: false, isPlaying: false, volume: 0.9 },
    { id: 4, name: 'Top Percussion', isRecording: false, isPlaying: false, volume: 0.8 },
  ]);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const activeNodesRef = useRef<Map<number, { oscs: OscillatorNode[]; gain: GainNode }>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Web Audio Engine
  const initAudio = useCallback(() => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'running') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.85, ctx.currentTime);

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;

      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
      analyserRef.current = analyser;
      setIsAudioInitialized(true);

      // Start oscilloscope rendering loop
      startVisualizer();
    } catch (e) {
      console.warn('AudioContext initialization error:', e);
    }
  }, []);

  // Oscilloscope Visualizer
  const startVisualizer = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgba(2, 6, 23, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#06b6d4'; // Cyan neon
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    render();
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Audio Synthesis Trigger
  const triggerSynthSound = useCallback((pad: PadConfig) => {
    if (!audioCtxRef.current) {
      initAudio();
    }
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;
    if (ctx.state === 'suspended') ctx.resume();

    const t = ctx.currentTime;
    const padGain = ctx.createGain();
    const panNode = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (panNode) panNode.pan.setValueAtTime(pad.pan, t);

    const filterNode = ctx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(Math.min(pad.cutoffFreq, 20000), t);

    // Semitone pitch multiplier: 2^(semitones/12)
    const pitchRatio = Math.pow(2, pad.pitchSemitones / 12);
    padGain.gain.setValueAtTime(pad.volume, t);

    const activeOscs: OscillatorNode[] = [];

    // Synthesize based on synthType
    switch (pad.synthType) {
      case 'kick': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150 * pitchRatio, t);
        osc.frequency.exponentialRampToValueAtTime(38 * pitchRatio, t + 0.12);
        padGain.gain.setValueAtTime(pad.volume * 1.2, t);
        padGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(filterNode);
        osc.start(t);
        osc.stop(t + 0.36);
        activeOscs.push(osc);
        break;
      }
      case 'snare': {
        // Tone
        const toneOsc = ctx.createOscillator();
        toneOsc.type = 'triangle';
        toneOsc.frequency.setValueAtTime(220 * pitchRatio, t);
        toneOsc.frequency.exponentialRampToValueAtTime(80 * pitchRatio, t + 0.08);

        // Noise
        const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
        const output = noiseBuf.getChannelData(0);
        for (let i = 0; i < noiseBuf.length; i++) output[i] = Math.random() * 2 - 1;
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1000, t);

        padGain.gain.setValueAtTime(pad.volume, t);
        padGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        toneOsc.connect(filterNode);
        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(filterNode);

        toneOsc.start(t);
        toneOsc.stop(t + 0.23);
        noiseSrc.start(t);
        noiseSrc.stop(t + 0.23);
        activeOscs.push(toneOsc);
        break;
      }
      case 'hihat_closed': {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(7000 * pitchRatio, t);
        padGain.gain.setValueAtTime(pad.volume * 0.8, t);
        padGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.connect(filterNode);
        osc.start(t);
        osc.stop(t + 0.07);
        activeOscs.push(osc);
        break;
      }
      case 'hihat_open': {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(6500 * pitchRatio, t);
        padGain.gain.setValueAtTime(pad.volume * 0.9, t);
        padGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(filterNode);
        osc.start(t);
        osc.stop(t + 0.36);
        activeOscs.push(osc);
        break;
      }
      case 'clap': {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450 * pitchRatio, t);
        padGain.gain.setValueAtTime(pad.volume, t);
        padGain.gain.setValueAtTime(pad.volume * 0.4, t + 0.02);
        padGain.gain.setValueAtTime(pad.volume, t + 0.04);
        padGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(filterNode);
        osc.start(t);
        osc.stop(t + 0.26);
        activeOscs.push(osc);
        break;
      }
      case 'sub_bass': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(55 * pitchRatio, t);
        padGain.gain.setValueAtTime(pad.volume * 1.1, t);
        padGain.gain.linearRampToValueAtTime(pad.volume * 0.8, t + 0.2);
        padGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.connect(filterNode);
        osc.start(t);
        osc.stop(t + 0.82);
        activeOscs.push(osc);
        break;
      }
      case 'dubstep_wobble': {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65 * pitchRatio, t);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime((bpm / 60) * 4, t); // sync with BPM
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(1500, t);
        lfo.connect(lfoGain);
        lfoGain.connect(filterNode.frequency);
        lfo.start(t);
        lfo.stop(t + 0.9);

        padGain.gain.setValueAtTime(pad.volume, t);
        padGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        osc.connect(filterNode);
        osc.start(t);
        osc.stop(t + 0.9);
        activeOscs.push(osc);
        break;
      }
      case 'synth_pluck': {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440 * pitchRatio, t);
        padGain.gain.setValueAtTime(pad.volume, t);
        padGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(filterNode);
        osc.start(t);
        osc.stop(t + 0.41);
        activeOscs.push(osc);
        break;
      }
      case 'synth_chord': {
        const freqs = [261.63, 329.63, 392.0]; // C Major triad
        freqs.forEach(baseFreq => {
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(baseFreq * pitchRatio, t);
          osc.connect(filterNode);
          osc.start(t);
          osc.stop(t + 0.8);
          activeOscs.push(osc);
        });
        padGain.gain.setValueAtTime(pad.volume * 0.7, t);
        padGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        break;
      }
      case 'vocal_hey': {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320 * pitchRatio, t);
        osc.frequency.linearRampToValueAtTime(480 * pitchRatio, t + 0.1);
        osc.frequency.linearRampToValueAtTime(260 * pitchRatio, t + 0.3);
        padGain.gain.setValueAtTime(pad.volume, t);
        padGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(filterNode);
        osc.start(t);
        osc.stop(t + 0.36);
        activeOscs.push(osc);
        break;
      }
      default: {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300 * pitchRatio, t);
        padGain.gain.setValueAtTime(pad.volume, t);
        padGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(filterNode);
        osc.start(t);
        osc.stop(t + 0.31);
        activeOscs.push(osc);
      }
    }

    if (panNode) {
      filterNode.connect(panNode);
      panNode.connect(padGain);
    } else {
      filterNode.connect(padGain);
    }
    padGain.connect(master);

    activeNodesRef.current.set(pad.id, { oscs: activeOscs, gain: padGain });
  }, [bpm, initAudio]);

  // Handle Trigger Pad
  const handleTriggerPad = useCallback((pad: PadConfig) => {
    initAudio();
    triggerSynthSound(pad);

    setActivePads(prev => {
      const next = new Set(prev);
      next.add(pad.id);
      return next;
    });

    if (pad.mode !== 'hold') {
      setTimeout(() => {
        setActivePads(prev => {
          const next = new Set(prev);
          next.delete(pad.id);
          return next;
        });
      }, 180);
    }
  }, [initAudio, triggerSynthSound]);

  // Handle Release Pad
  const handleReleasePad = useCallback((pad: PadConfig) => {
    if (pad.mode === 'hold') {
      setActivePads(prev => {
        const next = new Set(prev);
        next.delete(pad.id);
        return next;
      });
      const node = activeNodesRef.current.get(pad.id);
      if (node && audioCtxRef.current) {
        node.gain.gain.linearRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.05);
      }
    }
  }, []);

  // Stop All Sounds Panic Button
  const handleStopAll = useCallback(() => {
    if (audioCtxRef.current) {
      activeNodesRef.current.forEach(({ gain }) => {
        try {
          gain.gain.linearRampToValueAtTime(0.001, audioCtxRef.current!.currentTime + 0.02);
        } catch {
          // ignore
        }
      });
      activeNodesRef.current.clear();
    }
    setActivePads(new Set());
    setIsSequencerPlaying(false);
  }, []);

  // Keyboard triggering
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toUpperCase();
      const targetPad = pads.find(p => p.keyBinding.toUpperCase() === key);
      if (targetPad && !activePads.has(targetPad.id)) {
        handleTriggerPad(targetPad);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const targetPad = pads.find(p => p.keyBinding.toUpperCase() === key);
      if (targetPad) {
        handleReleasePad(targetPad);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pads, activePads, handleTriggerPad, handleReleasePad]);

  // Sequencer playback loop
  useEffect(() => {
    if (!isSequencerPlaying) return;
    const stepInterval = (60 / bpm / 4) * 1000; // 16th notes
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % 16;

        // Trigger instruments on this step
        if (sequenceGrid[0][nextStep]) triggerSynthSound(pads[0]); // Kick
        if (sequenceGrid[1][nextStep]) triggerSynthSound(pads[1]); // Snare
        if (sequenceGrid[2][nextStep]) triggerSynthSound(pads[2]); // HiHat
        if (sequenceGrid[3][nextStep]) triggerSynthSound(pads[5]); // Bass

        return nextStep;
      });
    }, stepInterval);

    return () => clearInterval(interval);
  }, [isSequencerPlaying, bpm, sequenceGrid, pads, triggerSynthSound]);

  // Snapshot Recall
  const recallSnapshot = (snap: KitSnapshot) => {
    setPads(snap.pads);
    setActiveSnapshotId(snap.id);
  };

  const saveCurrentSnapshot = (name: string) => {
    const newSnap: KitSnapshot = {
      id: `snap_${Date.now()}`,
      name,
      timestamp: Date.now(),
      pads: JSON.parse(JSON.stringify(pads)),
    };
    setSnapshots(prev => [...prev, newSnap]);
    setActiveSnapshotId(newSnap.id);
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Header Bar */}
      <div className="shrink-0 h-12 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center font-bold">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-slate-100 tracking-tight">Busker Sample Pad</span>
              <span className="text-[10px] bg-slate-800 text-pink-400 px-1.5 py-0.5 rounded font-mono border border-slate-700">
                PORTFOLIO INSTRUMENT
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate hidden sm:block">
              Zero-Scroll Viewport Live Performance Node
            </p>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2">
          {/* BPM Control */}
          <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 font-mono text-[10px] font-bold">BPM</span>
            <button
              onClick={() => setBpm(b => Math.max(60, b - 2))}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
            >
              -
            </button>
            <span className="font-mono font-bold text-cyan-400 w-8 text-center">{bpm}</span>
            <button
              onClick={() => setBpm(b => Math.min(200, b + 2))}
              className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
            >
              +
            </button>
          </div>

          {/* Panic Stop Button */}
          <button
            onClick={handleStopAll}
            className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition"
            title="Panic: Mute all sounds immediately"
          >
            <StopSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mute All</span>
          </button>

          {/* Cloud Applet Direct Link */}
          <a
            href="https://ai.studio/apps/ed19404b-eb0d-40d1-8fe8-c9178a32b47f?fullscreenApplet=true"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center gap-1 transition"
            title="Open in full window AI Studio"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Live Applet</span>
          </a>
        </div>
      </div>

      {/* Mode Switcher Bar */}
      <div className="shrink-0 bg-slate-900/90 border-b border-slate-800/80 px-2 py-1.5 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('singer')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'singer'
                ? 'bg-pink-500 text-slate-950 shadow-md shadow-pink-500/30 ring-2 ring-pink-400'
                : 'text-pink-300 bg-pink-950/50 border border-pink-800/60 hover:bg-pink-900/80'
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Simple Singer Mode</span>
          </button>

          <button
            onClick={() => setActiveTab('pads')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'pads'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Touchpad className="w-3.5 h-3.5" />
            <span>4x4 Pads</span>
          </button>

          <button
            onClick={() => setActiveTab('synth')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'synth'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Pentatonic Synth</span>
          </button>

          <button
            onClick={() => setActiveTab('sequencer')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'sequencer'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Beat Sequencer</span>
          </button>

          <button
            onClick={() => setActiveTab('looper')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'looper'
                ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Live Looper</span>
          </button>

          <button
            onClick={() => setIsChopperOpen(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 shadow-sm shrink-0"
            title="Slice sample waveforms"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Sample Chopper</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'cloud'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-indigo-300 bg-indigo-950/40 border border-indigo-700/50 hover:bg-indigo-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cloud Applet</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-400 font-mono px-2 shrink-0">
          <span>[1..4] Drums</span>
          <span>[Q..R] Bass</span>
          <span>[A..F] Synth</span>
          <span>[Z..V] Vocal/FX</span>
        </div>
      </div>

      {/* Low Latency Engine Activation Banner */}
      {!isAudioInitialized && (
        <div
          onClick={initAudio}
          className="shrink-0 mx-2 mt-1.5 p-2 bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border border-emerald-500/40 rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald-400 transition shadow"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
              <Play className="w-3.5 h-3.5 fill-slate-950" />
            </div>
            <span className="text-xs font-bold text-slate-100">Tap anywhere to initialize Low-Latency Web Audio Engine</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            ACTIVATE AUDIO
          </span>
        </div>
      )}

      {/* Real-time Oscilloscope Visualizer Canvas */}
      <div className="shrink-0 h-6 mx-2 my-1 rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950 relative">
        <canvas ref={canvasRef} className="w-full h-full block" width={600} height={24} />
      </div>

      {/* Main Tab Workspace View */}
      <div className="flex-1 min-h-0 w-full p-2 flex flex-col overflow-hidden relative">
        {/* 1. SIMPLE SINGER MODE */}
        {activeTab === 'singer' && (
          <div className="h-full flex flex-col justify-between gap-2 overflow-y-auto">
            {/* Song Form Section Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {snapshots.map((snap) => {
                const isActive = activeSnapshotId === snap.id;
                return (
                  <button
                    key={snap.id}
                    onClick={() => recallSnapshot(snap)}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      isActive
                        ? 'bg-pink-600 border-pink-400 text-white shadow-lg shadow-pink-500/30 scale-[1.02]'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-pink-300">Section</span>
                    <span className="text-2xl font-black">{snap.name}</span>
                    <span className="text-[10px] text-slate-400">1-Touch Recall</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Performance Triggers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 min-h-[160px]">
              <button
                onClick={() => handleTriggerPad(pads[0])}
                className="rounded-xl bg-gradient-to-br from-rose-900/40 to-slate-900 border border-rose-500/50 p-4 flex flex-col items-center justify-center gap-2 hover:border-rose-400 active:scale-95 transition"
              >
                <div className="w-12 h-12 rounded-full bg-rose-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-lg shadow-rose-500/30">
                  🥁
                </div>
                <span className="font-bold text-sm text-rose-300">Big Kick</span>
                <span className="text-[10px] text-slate-400 font-mono">[Key 1]</span>
              </button>

              <button
                onClick={() => handleTriggerPad(pads[4])}
                className="rounded-xl bg-gradient-to-br from-orange-900/40 to-slate-900 border border-orange-500/50 p-4 flex flex-col items-center justify-center gap-2 hover:border-orange-400 active:scale-95 transition"
              >
                <div className="w-12 h-12 rounded-full bg-orange-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-lg shadow-orange-500/30">
                  👏
                </div>
                <span className="font-bold text-sm text-orange-300">Crowd Clap</span>
                <span className="text-[10px] text-slate-400 font-mono">[Key Q]</span>
              </button>

              <button
                onClick={() => handleTriggerPad(pads[5])}
                className="rounded-xl bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/50 p-4 flex flex-col items-center justify-center gap-2 hover:border-emerald-400 active:scale-95 transition"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-lg shadow-emerald-500/30">
                  🔊
                </div>
                <span className="font-bold text-sm text-emerald-300">808 Sub Drop</span>
                <span className="text-[10px] text-slate-400 font-mono">[Key W]</span>
              </button>

              <button
                onClick={() => handleTriggerPad(pads[12])}
                className="rounded-xl bg-gradient-to-br from-pink-900/40 to-slate-900 border border-pink-500/50 p-4 flex flex-col items-center justify-center gap-2 hover:border-pink-400 active:scale-95 transition"
              >
                <div className="w-12 h-12 rounded-full bg-pink-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-lg shadow-pink-500/30">
                  🎤
                </div>
                <span className="font-bold text-sm text-pink-300">Vocal "Hey!"</span>
                <span className="text-[10px] text-slate-400 font-mono">[Key Z]</span>
              </button>
            </div>

            {/* Bottom Info Status */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>🎤 Busker Singer Mode Active: Fast trigger layout for live stage performance</span>
              <span className="font-mono text-cyan-400 font-bold">{bpm} BPM</span>
            </div>
          </div>
        )}

        {/* 2. 4x4 PAD GRID */}
        {activeTab === 'pads' && (
          <div className="h-full flex flex-col justify-between gap-2 overflow-hidden">
            {/* Snapshot Bar */}
            <div className="shrink-0 flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 font-mono px-1">SNAPS:</span>
                {snapshots.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => recallSnapshot(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      activeSnapshotId === s.id
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  const name = prompt('Enter snapshot name:', 'Drop 2');
                  if (name) saveCurrentSnapshot(name);
                }}
                className="px-2 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">New Snap</span>
              </button>
            </div>

            {/* 4x4 Grid */}
            <div className="flex-1 min-h-0 grid grid-cols-4 grid-rows-4 gap-2">
              {pads.map((pad) => {
                const isActive = activePads.has(pad.id);
                const colorConfig = COLOR_CLASSES[pad.color] || COLOR_CLASSES.rose;

                return (
                  <div
                    key={pad.id}
                    onMouseDown={() => handleTriggerPad(pad)}
                    onMouseUp={() => handleReleasePad(pad)}
                    onTouchStart={(e) => { e.preventDefault(); handleTriggerPad(pad); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleReleasePad(pad); }}
                    className={`relative rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between p-2 select-none overflow-hidden ${
                      isActive
                        ? `${colorConfig.activeBg} border-white text-slate-950 shadow-2xl scale-[0.98] ${colorConfig.glow}`
                        : `${colorConfig.bg} ${colorConfig.border} hover:border-slate-400 text-slate-200`
                    }`}
                  >
                    {/* Ripple animation element */}
                    {isActive && (
                      <span className="absolute inset-0 rounded-xl bg-white/30 animate-pad-ripple pointer-events-none" />
                    )}

                    {/* Pad Top Details */}
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className={`px-1.5 py-0.5 rounded font-bold ${isActive ? 'bg-slate-950 text-white' : 'bg-slate-900/90 text-slate-300'}`}>
                        {pad.keyBinding}
                      </span>
                      <span className="text-[10px] uppercase font-semibold opacity-70">
                        {pad.mode}
                      </span>
                    </div>

                    {/* Pad Name */}
                    <div className="my-auto text-center">
                      <span className="font-extrabold text-xs sm:text-sm tracking-tight leading-tight block">
                        {pad.name}
                      </span>
                      <span className="text-[10px] opacity-75 font-mono">
                        {pad.pitchSemitones !== 0 ? `${pad.pitchSemitones > 0 ? '+' : ''}${pad.pitchSemitones}st` : pad.category}
                      </span>
                    </div>

                    {/* Pad Bottom Footer / Edit Button */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="opacity-60">{Math.round(pad.volume * 100)}%</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPad(pad);
                        }}
                        className="p-1 rounded bg-black/30 hover:bg-black/60 text-slate-300 transition"
                        title="Edit Pad Parameters"
                      >
                        <Sliders className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. PENTATONIC SYNTH */}
        {activeTab === 'synth' && (
          <div className="h-full flex flex-col justify-between gap-3 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
            {/* Synth Control Strip */}
            <div className="flex items-center justify-between gap-2 flex-wrap bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">SCALE:</span>
                <button
                  onClick={() => setSynthScale('minor')}
                  className={`px-2.5 py-1 rounded font-bold ${synthScale === 'minor' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  Minor Pentatonic
                </button>
                <button
                  onClick={() => setSynthScale('major')}
                  className={`px-2.5 py-1 rounded font-bold ${synthScale === 'major' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  Major Pentatonic
                </button>
                <button
                  onClick={() => setSynthScale('blues')}
                  className={`px-2.5 py-1 rounded font-bold ${synthScale === 'blues' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  Blues Scale
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold">OCT:</span>
                  <button
                    onClick={() => setSynthOctave(o => Math.max(-2, o - 1))}
                    className="w-5 h-5 rounded bg-slate-800 font-bold text-center"
                  >
                    -
                  </button>
                  <span className="font-mono text-cyan-400 font-bold w-4 text-center">{synthOctave}</span>
                  <button
                    onClick={() => setSynthOctave(o => Math.min(2, o + 1))}
                    className="w-5 h-5 rounded bg-slate-800 font-bold text-center"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold">WAVE:</span>
                  <select
                    value={synthWaveform}
                    onChange={(e) => setSynthWaveform(e.target.value as OscillatorType)}
                    className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-0.5"
                  >
                    <option value="sawtooth">Sawtooth</option>
                    <option value="square">Square</option>
                    <option value="triangle">Triangle</option>
                    <option value="sine">Sine</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Playable Synth Keyboard */}
            <div className="flex-1 min-h-[160px] grid grid-cols-8 gap-2">
              {[
                { note: 'C4', freq: 261.63 },
                { note: 'D4', freq: 293.66 },
                { note: 'Eb4', freq: 311.13 },
                { note: 'F4', freq: 349.23 },
                { note: 'G4', freq: 392.0 },
                { note: 'Bb4', freq: 466.16 },
                { note: 'C5', freq: 523.25 },
                { note: 'Eb5', freq: 622.25 },
              ].map((k) => (
                <button
                  key={k.note}
                  onMouseDown={() => {
                    initAudio();
                    const ctx = audioCtxRef.current;
                    if (!ctx) return;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = synthWaveform;
                    const octMultiplier = Math.pow(2, synthOctave);
                    osc.frequency.setValueAtTime(k.freq * octMultiplier, ctx.currentTime);
                    gain.gain.setValueAtTime(0.7, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
                    osc.connect(gain);
                    gain.connect(masterGainRef.current || ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.61);
                  }}
                  className="rounded-xl bg-gradient-to-b from-cyan-950/40 to-slate-900 border-2 border-cyan-500/40 hover:border-cyan-400 active:bg-cyan-500 active:text-slate-950 flex flex-col justify-end p-3 transition shadow-lg"
                >
                  <span className="font-extrabold text-sm sm:text-base text-cyan-300 font-mono">{k.note}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{Math.round(k.freq)}Hz</span>
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 text-center font-mono">
              Touch or click keys to play real-time expressive synth leads and melodic arpeggios
            </div>
          </div>
        )}

        {/* 4. BEAT SEQUENCER */}
        {activeTab === 'sequencer' && (
          <div className="h-full flex flex-col justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            {/* Sequencer Controls */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    initAudio();
                    setIsSequencerPlaying(!isSequencerPlaying);
                  }}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                    isSequencerPlaying
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isSequencerPlaying ? <StopSquare className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isSequencerPlaying ? 'Stop Pattern' : 'Play Pattern'}</span>
                </button>

                <button
                  onClick={() => setSequenceGrid(sequenceGrid.map(row => row.map(() => false)))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Clear All
                </button>
              </div>

              <div className="text-xs font-mono text-cyan-400 font-bold">
                Step: {currentStep + 1} / 16
              </div>
            </div>

            {/* 16-Step Matrix */}
            <div className="flex-1 min-h-0 flex flex-col justify-around gap-2">
              {['Kick Drum', 'Crisp Snare', 'Closed HiHat', '808 Sub Bass'].map((instName, rowIdx) => (
                <div key={instName} className="flex items-center gap-2">
                  <span className="w-24 text-xs font-bold text-slate-300 truncate">{instName}</span>
                  <div className="flex-1 grid grid-cols-16 gap-1">
                    {sequenceGrid[rowIdx].map((isActive, stepIdx) => {
                      const isCurrent = isSequencerPlaying && currentStep === stepIdx;
                      return (
                        <button
                          key={stepIdx}
                          onClick={() => {
                            setSequenceGrid(prev => {
                              const next = prev.map(r => [...r]);
                              next[rowIdx][stepIdx] = !next[rowIdx][stepIdx];
                              return next;
                            });
                          }}
                          className={`h-9 rounded-md transition-all border ${
                            isActive
                              ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-sm'
                              : isCurrent
                              ? 'bg-slate-700 border-cyan-400'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 text-center font-mono">
              16-Step groove engine running synchronously with Web Audio master clock ({bpm} BPM)
            </div>
          </div>
        )}

        {/* 5. LIVE LOOPER */}
        {activeTab === 'looper' && (
          <div className="h-full flex flex-col justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-0">
              {looperTracks.map((track) => (
                <div
                  key={track.id}
                  className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">{track.name}</span>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                      TRACK 0{track.id}
                    </span>
                  </div>

                  {/* Waveform placeholder simulation */}
                  <div className="h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-500 font-mono">
                    {track.isPlaying ? '● PLAYING IN SYNC' : track.isRecording ? '● RECORDING LIVE INPUT' : 'EMPTY LOOP BUFFER'}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        initAudio();
                        setLooperTracks(tracks => tracks.map(t => t.id === track.id ? { ...t, isPlaying: !t.isPlaying } : t));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        track.isPlaying ? 'bg-purple-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {track.isPlaying ? <StopSquare className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{track.isPlaying ? 'Stop' : 'Play Loop'}</span>
                    </button>

                    <button
                      onClick={() => {
                        initAudio();
                        setLooperTracks(tracks => tracks.map(t => t.id === track.id ? { ...t, isRecording: !t.isRecording } : t));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        track.isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{track.isRecording ? 'Rec Stop' : 'Overdub'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 text-center font-mono">
              Live looper synchronized to master BPM. Assign loops directly to 4x4 pads for one-touch triggering.
            </div>
          </div>
        )}

        {/* 6. CLOUD APPLET VIEW */}
        {activeTab === 'cloud' && (
          <div className="h-full flex flex-col bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
            <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">AI Studio Cloud Instance (ed19404b)</span>
              <a
                href="https://ai.studio/apps/ed19404b-eb0d-40d1-8fe8-c9178a32b47f?fullscreenApplet=true"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Pop Out</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex-1 relative">
              <iframe
                src="https://ai.studio/apps/ed19404b-eb0d-40d1-8fe8-c9178a32b47f?fullscreenApplet=true"
                className="w-full h-full border-none"
                title="Busker Pad Cloud Applet"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; camera"
                sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal: Pad Parameter Editor */}
      {editingPad && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Edit Pad: {editingPad.name}
              </h3>
              <button
                onClick={() => setEditingPad(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Pad Label</label>
                <input
                  type="text"
                  value={editingPad.name}
                  onChange={(e) => setEditingPad({ ...editingPad, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Play Mode</label>
                  <select
                    value={editingPad.mode}
                    onChange={(e) => setEditingPad({ ...editingPad, mode: e.target.value as PlayMode })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-100"
                  >
                    <option value="oneshot">One-Shot</option>
                    <option value="hold">Hold / Gate</option>
                    <option value="loop">Loop</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Color Theme</label>
                  <select
                    value={editingPad.color}
                    onChange={(e) => setEditingPad({ ...editingPad, color: e.target.value as PadColor })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-100"
                  >
                    {Object.keys(COLOR_CLASSES).map(c => (
                      <option key={c} value={c}>{c.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Pitch Transposition</span>
                  <span className="font-mono text-cyan-400">{editingPad.pitchSemitones > 0 ? '+' : ''}{editingPad.pitchSemitones} semitones</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={editingPad.pitchSemitones}
                  onChange={(e) => setEditingPad({ ...editingPad, pitchSemitones: parseInt(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Lowpass Cutoff Filter</span>
                  <span className="font-mono text-cyan-400">{editingPad.cutoffFreq} Hz</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="20000"
                  step="100"
                  value={editingPad.cutoffFreq}
                  onChange={(e) => setEditingPad({ ...editingPad, cutoffFreq: parseInt(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Pad Volume</span>
                  <span className="font-mono text-cyan-400">{Math.round(editingPad.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={editingPad.volume}
                  onChange={(e) => setEditingPad({ ...editingPad, volume: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingPad(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setPads(pads.map(p => p.id === editingPad.id ? editingPad : p));
                  setEditingPad(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
              >
                Save Pad Config
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Sample Chopper / Slicer */}
      {isChopperOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-amber-400" />
                Sample Chopper / Slicer
              </h3>
              <button
                onClick={() => setIsChopperOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="h-28 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative p-3">
              <div className="w-full h-full flex items-center justify-between gap-1">
                {[40, 65, 85, 30, 95, 70, 50, 80, 60, 45, 90, 75, 35, 60, 85, 100, 55, 40, 70, 85].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`flex-1 rounded-sm ${i >= 4 && i <= 14 ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-slate-800'}`}
                  />
                ))}
              </div>
              <span className="absolute bottom-2 left-3 text-[10px] font-mono text-amber-300">Slice: 0.20s - 0.70s</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">Assign to Pad:</span>
                <select
                  value={chopperPadId}
                  onChange={(e) => setChopperPadId(parseInt(e.target.value))}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1"
                >
                  {pads.map(p => (
                    <option key={p.id} value={p.id}>Pad [{p.keyBinding}] - {p.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  initAudio();
                  triggerSynthSound(pads[chopperPadId]);
                }}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                Audition
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsChopperOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

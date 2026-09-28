import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  Play,
  Square,
  Volume2,
  Plus,
  Trash2,
  Copy,
  Download,
  Users,
  FileText,
  Radio,
  Sparkles,
  Music,
  Disc,
  ArrowLeft,
  RefreshCw,
  Megaphone,
  Layers,
  Edit3
} from 'lucide-react';

// ================= TYPES =================
export type RelationshipType = 
  | 'Rival' 
  | 'Ally' 
  | 'Mentor' 
  | 'Skeptic' 
  | 'Co-Host' 
  | 'Friend' 
  | 'Enemy' 
  | 'Family' 
  | 'Colleague' 
  | 'Mystery';

export interface CharacterRelationship {
  id: string;
  targetCharacterId: string;
  targetCharacterName: string;
  relationshipType: RelationshipType;
  notes: string;
}

export interface VoiceConfig {
  voiceName: string;
  gender: 'Male' | 'Female' | 'Non-binary' | 'AI / Synth';
  pitch: number; // 0.5 to 1.5
  rate: number;  // 0.5 to 1.5
  tone: string;
  emotionStyle: 'Enthusiastic' | 'Sarcastic' | 'Calm' | 'Dramatic' | 'Whispering' | 'Professional';
  audioEffect?: 'studio_warmth' | 'fm_radio' | 'crisp_clear' | 'deep_baritone' | 'telephone' | 'robotic_synth' | 'none';
}

export interface Character {
  id: string;
  name: string;
  avatarUrl: string;
  mainRole: string;
  personality: string;
  quirks: string;
  background: string;
  voiceConfig: VoiceConfig;
  relationships: CharacterRelationship[];
}

export interface ScriptLine {
  id: string;
  characterId: string;
  characterName: string;
  text: string;
  emotionNote?: string;
  sfxCue?: string;
  bgmCue?: string;
  durationSec?: number;
  isSceneHeader?: boolean;
  sceneTitle?: string;
  isAdBreak?: boolean;
  adSponsorName?: string;
  adDurationSec?: number;
  adCategory?: 'Sponsor Spot' | 'Station ID' | 'PSA' | 'Promo Bump';
}

export type PodcastGenre = 
  | 'Tech & AI'
  | 'True Crime'
  | 'Comedy & Banter'
  | 'Sci-Fi & Cyberpunk'
  | 'Business & Finance'
  | 'Educational / Science'
  | 'Storytelling & Drama';

export interface PodcastProject {
  id: string;
  title: string;
  tagline: string;
  description: string;
  genre: PodcastGenre;
  coverUrl: string;
  mode: 'creator' | 'generative';
  targetDurationMinutes: number;
  characters: Character[];
  script: ScriptLine[];
  bgmTrack: string;
  soundBoard: string[];
  showNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ================= DEFAULT SAMPLE DATA =================
const SAMPLE_PROJECTS: PodcastProject[] = [
  {
    id: 'proj-silicon-horizon',
    title: 'The Silicon Horizon',
    tagline: 'Autonomous systems, synthetic neural brains, and deep tech frontiers',
    description: 'An investigative exploration into autonomous agent swarms, edge computing, and sentient audio interfaces.',
    genre: 'Tech & AI',
    coverUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
    mode: 'creator',
    targetDurationMinutes: 24,
    bgmTrack: 'tech_ambient',
    soundBoard: ['applause', 'intro_chime', 'dramatic_boom', 'laser_zap'],
    showNotes: `# The Silicon Horizon - Episode 104\n\nIn this episode, Alex and Sarah interview Dr. Vance on the rapid emergence of decentralized agent networks operating at 0ms network latency on mobile captive hotspots.\n\n### Key Topics:\n- Embedded edge runtimes\n- Synthetic voice generation\n- Real-world busking audio tech`,
    createdAt: '2026-09-20T10:00:00Z',
    updatedAt: '2026-09-27T12:00:00Z',
    characters: [
      {
        id: 'char-1',
        name: 'Alex Rivera',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        mainRole: 'Lead Host',
        personality: 'Charismatic, inquisitive, articulate technologist with rapid-fire delivery.',
        quirks: 'Uses architectural analogies; obsessed with edge latency.',
        background: 'Former Linux kernel engineer turned broadcast journalist.',
        voiceConfig: {
          voiceName: 'Alex Host',
          gender: 'Male',
          pitch: 1.0,
          rate: 1.05,
          tone: 'Warm & Authoritative',
          emotionStyle: 'Enthusiastic',
          audioEffect: 'studio_warmth'
        },
        relationships: []
      },
      {
        id: 'char-2',
        name: 'Dr. Sarah Chen',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        mainRole: 'Co-Host & Researcher',
        personality: 'Analytical, calm, sharp counter-point to Alex’s excitement.',
        quirks: 'Cites research papers and IEEE standards from memory.',
        background: 'Principal researcher in distributed sensory networks.',
        voiceConfig: {
          voiceName: 'Sarah AI',
          gender: 'Female',
          pitch: 1.1,
          rate: 1.0,
          tone: 'Crisp & Analytical',
          emotionStyle: 'Professional',
          audioEffect: 'crisp_clear'
        },
        relationships: []
      },
      {
        id: 'char-3',
        name: 'Dr. Elena Vance',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
        mainRole: 'Special Guest',
        personality: 'Visionary, mysterious, speaks in profound observations.',
        quirks: 'Pauses before speaking; deeply reflective.',
        background: 'Pioneer of offline neural mesh topologies.',
        voiceConfig: {
          voiceName: 'Elena Neuro',
          gender: 'Female',
          pitch: 0.9,
          rate: 0.95,
          tone: 'Deep & Reflective',
          emotionStyle: 'Calm',
          audioEffect: 'studio_warmth'
        },
        relationships: []
      }
    ],
    script: [
      {
        id: 'line-scene-1',
        characterId: '',
        characterName: '',
        text: '',
        isSceneHeader: true,
        sceneTitle: 'Act 1: The Offline Revolution',
        sfxCue: 'intro_chime',
        bgmCue: 'tech_ambient'
      },
      {
        id: 'line-1',
        characterId: 'char-1',
        characterName: 'Alex Rivera',
        text: "Welcome back to The Silicon Horizon! Today we're broadcasting straight from an offline edge station. Sarah, have you seen the benchmark numbers on these local runtimes?",
        emotionNote: '[High energy, leaning toward mic]',
        sfxCue: 'intro_chime'
      },
      {
        id: 'line-2',
        characterId: 'char-2',
        characterName: 'Dr. Sarah Chen',
        text: "I reviewed them this morning, Alex. Under ten milliseconds response time with zero cloud dependency. It completely rewrites what we thought was possible in audio performance.",
        emotionNote: '[Analytical, smiling slightly]'
      },
      {
        id: 'line-3',
        characterId: 'char-3',
        characterName: 'Dr. Elena Vance',
        text: "When you eliminate the network hop, computing stops being a conversation with a remote datacenter and becomes an extension of human intuition.",
        emotionNote: '[Poised, profound delivery]',
        sfxCue: 'dramatic_boom'
      },
      {
        id: 'line-ad-1',
        characterId: '',
        characterName: '',
        text: 'This episode is brought to you by Aya OS Edge Node — providing ultra-low-latency captive portal computing wherever creators go.',
        isAdBreak: true,
        adSponsorName: 'Aya OS Local Hotspot Network',
        adDurationSec: 30,
        adCategory: 'Sponsor Spot'
      },
      {
        id: 'line-4',
        characterId: 'char-1',
        characterName: 'Alex Rivera',
        text: "Exactly, Elena! And that brings us to our main demonstration today: real-time synthetic speech layered over live 16-step beat machines.",
        emotionNote: '[Eager, gesturing]'
      }
    ]
  },
  {
    id: 'proj-blackwood-mystery',
    title: 'Echoes of Blackwood',
    tagline: 'A 1987 investigative dossier and radio station cold case',
    description: 'A psychological true crime and supernatural audio drama centered on lost tapes found beneath an abandoned mountain antenna.',
    genre: 'True Crime',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    mode: 'creator',
    targetDurationMinutes: 18,
    bgmTrack: 'cinematic_mystery',
    soundBoard: ['tape_stop', 'dramatic_boom', 'vinyl_crackle'],
    showNotes: `### Tape 04: The Blackwood Valley Broadcasts\nFound in autumn 1987 inside the transmitter locker.`,
    createdAt: '2026-09-22T14:30:00Z',
    updatedAt: '2026-09-26T18:15:00Z',
    characters: [
      {
        id: 'char-bw-1',
        name: 'Detective Cole Vance',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        mainRole: 'Investigator',
        personality: 'Grizzled, methodical, voice heavy with fatigue and determination.',
        quirks: 'Clicks cassette recorder button repeatedly.',
        background: 'County detective assigned to cold case archive.',
        voiceConfig: {
          voiceName: 'Cole Detective',
          gender: 'Male',
          pitch: 0.8,
          rate: 0.9,
          tone: 'Deep & Gritty',
          emotionStyle: 'Dramatic',
          audioEffect: 'deep_baritone'
        },
        relationships: []
      },
      {
        id: 'char-bw-2',
        name: 'Archivist Claire Morales',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
        mainRole: 'Sound Archivist',
        personality: 'Perceptive, alert, hears anomalies others miss in the magnetic tape.',
        quirks: 'Always references reel revolutions and frequency spikes.',
        background: 'Former audio engineer at municipal broadcast archives.',
        voiceConfig: {
          voiceName: 'Claire Archivist',
          gender: 'Female',
          pitch: 1.05,
          rate: 1.0,
          tone: 'Alert & Precise',
          emotionStyle: 'Whispering',
          audioEffect: 'telephone'
        },
        relationships: []
      }
    ],
    script: [
      {
        id: 'line-bw-s1',
        characterId: '',
        characterName: '',
        text: '',
        isSceneHeader: true,
        sceneTitle: 'Log 01: The Magnetic Anomalies',
        sfxCue: 'vinyl_crackle',
        bgmCue: 'cinematic_mystery'
      },
      {
        id: 'line-bw-1',
        characterId: 'char-bw-1',
        characterName: 'Detective Cole Vance',
        text: "October 14th, 1987. Detective Cole recording. We are twenty feet below the primary antenna shack in Blackwood Valley. The power went dead three days ago, but the tape reels are still warm.",
        emotionNote: '[Gravelly whisper, close to cassette recorder mic]',
        sfxCue: 'vinyl_crackle'
      },
      {
        id: 'line-bw-2',
        characterId: 'char-bw-2',
        characterName: 'Archivist Claire Morales',
        text: "Cole, look at the spectrogram on the oscilloscope. There's a 19-kilohertz pilot carrier tone embedded underneath the static. Someone was broadcasting human speech inverted in pitch.",
        emotionNote: '[Tense, urgent discovery]',
        sfxCue: 'dramatic_boom'
      }
    ]
  }
];

export const PodcastStudioApp: React.FC = () => {
  // Storage
  const [projects, setProjects] = useState<PodcastProject[]>(() => {
    try {
      const saved = localStorage.getItem('aya_podcast_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse saved podcast projects', e);
    }
    return SAMPLE_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'script' | 'characters' | 'soundboard' | 'ads' | 'notes'>('script');
  const [genreFilter, setGenreFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Sub-views
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  // Audio Playback / Teleprompter State
  const [isPlayingTeleprompter, setIsPlayingTeleprompter] = useState(false);
  const [activeSpeakingLineId, setActiveSpeakingLineId] = useState<string | null>(null);
  const [isAudioBgmPlaying, setIsAudioBgmPlaying] = useState(false);
  const [selectedBgm] = useState<string>('tech_ambient');
  const [masterVolume, setMasterVolume] = useState<number>(0.8);
  const [soundboardActive, setSoundboardActive] = useState<string | null>(null);

  // Line Editing Draft State
  const [newSpeakerId, setNewSpeakerId] = useState<string>('');
  const [newLineText, setNewLineText] = useState<string>('');
  const [newLineEmotion, setNewLineEmotion] = useState<string>('');
  const [newLineSfx, setNewLineSfx] = useState<string>('');
  const [lineType, setLineType] = useState<'dialogue' | 'scene_header' | 'ad_break'>('dialogue');

  // Web Audio Context Reference for Sound Effects & Ambient Drone
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmOscNodesRef = useRef<{ osc1?: OscillatorNode; osc2?: OscillatorNode; gain?: GainNode } | null>(null);

  // Save projects to localStorage whenever changed
  useEffect(() => {
    localStorage.setItem('aya_podcast_projects', JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  // Initialize Audio Context on demand
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Web Audio Soundboard Synthesizer
  const playSfx = useCallback((sfxName: string) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    setSoundboardActive(sfxName);
    setTimeout(() => setSoundboardActive(null), 800);

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterVolume, now);
    masterGain.connect(ctx.destination);

    switch (sfxName) {
      case 'intro_chime': {
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0, now);
          gain.gain.setValueAtTime(0.3, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.8);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.85);
        });
        break;
      }
      case 'dramatic_boom': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 1.2);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 1.45);
        break;
      }
      case 'applause': {
        const bufferSize = ctx.sampleRate * 1.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.8));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.Q.setValueAtTime(1.5, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.4);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start(now);
        break;
      }
      case 'laser_zap': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.33);
        break;
      }
      case 'tape_stop': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.45);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
      case 'vinyl_crackle': {
        for (let i = 0; i < 8; i++) {
          const clickTime = now + Math.random() * 0.6;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(800 + Math.random() * 600, clickTime);
          gain.gain.setValueAtTime(0.15, clickTime);
          gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.03);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(clickTime);
          osc.stop(clickTime + 0.04);
        }
        break;
      }
      default: {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    }
  }, [getAudioContext, masterVolume]);

  // Ambient procedural background drone toggle
  const toggleBgm = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (isAudioBgmPlaying) {
      if (bgmOscNodesRef.current?.gain) {
        bgmOscNodesRef.current.gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        setTimeout(() => {
          try {
            bgmOscNodesRef.current?.osc1?.stop();
            bgmOscNodesRef.current?.osc2?.stop();
          } catch (e) {}
          bgmOscNodesRef.current = null;
        }, 550);
      }
      setIsAudioBgmPlaying(false);
    } else {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, now);

      if (selectedBgm === 'cinematic_mystery') {
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(55, now);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(82.4, now);
      } else {
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(65.41, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(98.0, now);
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08 * masterVolume, now + 1.5);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);

      bgmOscNodesRef.current = { osc1, osc2, gain };
      setIsAudioBgmPlaying(true);
    }
  }, [getAudioContext, isAudioBgmPlaying, selectedBgm, masterVolume]);

  // Cleanup audio nodes on unmount
  useEffect(() => {
    return () => {
      try {
        if (bgmOscNodesRef.current?.osc1) bgmOscNodesRef.current.osc1.stop();
        if (bgmOscNodesRef.current?.osc2) bgmOscNodesRef.current.osc2.stop();
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      } catch (e) {}
    };
  }, []);

  // Web Speech API for Speaking Single Dialogue Line
  const speakLine = useCallback((line: ScriptLine, onFinished?: () => void) => {
    if (!('speechSynthesis' in window)) {
      alert('Web Speech API is not supported in this browser.');
      if (onFinished) onFinished();
      return;
    }

    window.speechSynthesis.cancel();

    if (line.sfxCue) {
      playSfx(line.sfxCue);
    }

    const textToSpeak = line.isAdBreak
      ? `Commercial break: ${line.adSponsorName}. ${line.text}`
      : line.text;

    if (!textToSpeak.trim()) {
      if (onFinished) onFinished();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const char = activeProject?.characters.find((c) => c.id === line.characterId);

    if (char?.voiceConfig) {
      utterance.pitch = Math.max(0.5, Math.min(1.8, char.voiceConfig.pitch));
      utterance.rate = Math.max(0.6, Math.min(1.6, char.voiceConfig.rate));
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }

    setActiveSpeakingLineId(line.id);

    utterance.onend = () => {
      setActiveSpeakingLineId(null);
      if (onFinished) onFinished();
    };

    utterance.onerror = () => {
      setActiveSpeakingLineId(null);
      if (onFinished) onFinished();
    };

    window.speechSynthesis.speak(utterance);
  }, [activeProject, playSfx]);

  // Teleprompter Automated Sequence Player
  const startTeleprompter = useCallback(() => {
    if (!activeProject || activeProject.script.length === 0) return;
    setIsPlayingTeleprompter(true);

    const scriptItems = activeProject.script.filter((l) => !l.isSceneHeader);
    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex >= scriptItems.length) {
        setIsPlayingTeleprompter(false);
        setActiveSpeakingLineId(null);
        return;
      }
      const item = scriptItems[currentIndex];
      currentIndex++;
      speakLine(item, () => {
        setTimeout(speakNext, 500);
      });
    };

    speakNext();
  }, [activeProject, speakLine]);

  const stopTeleprompter = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingTeleprompter(false);
    setActiveSpeakingLineId(null);
  }, []);

  // Project update helpers
  const handleUpdateCurrentProject = useCallback((updated: PodcastProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p)));
  }, []);

  // Add a line to script
  const handleAddLine = () => {
    if (!activeProject) return;

    let newLine: ScriptLine;
    if (lineType === 'scene_header') {
      if (!newLineText.trim()) return;
      newLine = {
        id: `line-${Date.now()}`,
        characterId: '',
        characterName: '',
        text: '',
        isSceneHeader: true,
        sceneTitle: newLineText.trim(),
        sfxCue: newLineSfx || undefined,
      };
    } else if (lineType === 'ad_break') {
      newLine = {
        id: `line-${Date.now()}`,
        characterId: '',
        characterName: '',
        text: newLineText.trim() || 'Commercial message spot.',
        isAdBreak: true,
        adSponsorName: newLineEmotion.trim() || 'Station Sponsor Spot',
        adDurationSec: 30,
        adCategory: 'Sponsor Spot'
      };
    } else {
      if (!newSpeakerId || !newLineText.trim()) return;
      const speaker = activeProject.characters.find((c) => c.id === newSpeakerId);
      newLine = {
        id: `line-${Date.now()}`,
        characterId: newSpeakerId,
        characterName: speaker ? speaker.name : 'Unknown Speaker',
        text: newLineText.trim(),
        emotionNote: newLineEmotion.trim() ? `[${newLineEmotion.trim().replace(/^\[|\]$/g, '')}]` : undefined,
        sfxCue: newLineSfx.trim() || undefined,
      };
    }

    const updated = {
      ...activeProject,
      script: [...activeProject.script, newLine],
    };

    handleUpdateCurrentProject(updated);
    setNewLineText('');
    setNewLineEmotion('');
    setNewLineSfx('');
  };

  const handleDeleteLine = (lineId: string) => {
    if (!activeProject) return;
    const updated = {
      ...activeProject,
      script: activeProject.script.filter((l) => l.id !== lineId),
    };
    handleUpdateCurrentProject(updated);
  };

  const handleMoveLine = (index: number, direction: 'up' | 'down') => {
    if (!activeProject) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= activeProject.script.length) return;

    const newScript = [...activeProject.script];
    const [moved] = newScript.splice(index, 1);
    newScript.splice(targetIdx, 0, moved);

    handleUpdateCurrentProject({
      ...activeProject,
      script: newScript,
    });
  };

  // Duplicate active or listed project
  const handleDuplicateProject = (proj: PodcastProject) => {
    const duplicated: PodcastProject = {
      ...proj,
      id: `proj-${Date.now()}`,
      title: `${proj.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [duplicated, ...prev]);
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this podcast project?')) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (activeProjectId === id) {
        setActiveProjectId(null);
      }
    }
  };

  // Reset to original samples
  const handleResetSampleProjects = () => {
    if (confirm('Reset stored projects back to initial factory samples?')) {
      setProjects(SAMPLE_PROJECTS);
      setActiveProjectId(null);
    }
  };

  // Filtered projects for dashboard
  const filteredProjects = projects.filter((p) => {
    const matchesGenre = genreFilter === 'All' || p.genre === genreFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <div className="w-full h-full flex flex-col bg-[#1A1817] text-[#EDE8E3] font-sans select-none antialiased overflow-hidden">
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="h-13 bg-[#24201E] border-b border-[#3D3530] px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          {activeProject ? (
            <button
              onClick={() => {
                stopTeleprompter();
                setActiveProjectId(null);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#332D29] hover:bg-[#433B36] text-[#D8CAB8] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-rose-700 flex items-center justify-center shadow-md">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-wide text-white uppercase">PodForge Studio</h1>
                <p className="text-[10px] text-[#A69B8D] -mt-0.5">Audio Drama & Broadcast Workstation</p>
              </div>
            </div>
          )}

          {activeProject && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#3D3530]">
              <span className="text-xs font-black text-white truncate max-w-[200px] sm:max-w-xs">{activeProject.title}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300">
                {activeProject.genre}
              </span>
            </div>
          )}
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {/* Ambient BGM Generator Toggle */}
          <button
            onClick={toggleBgm}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
              isAudioBgmPlaying
                ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-sm animate-pulse'
                : 'bg-[#2E2824] border-[#3D3530] text-[#A69B8D] hover:text-white'
            }`}
            title="Toggle procedural background ambient music drone"
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BGM Drone</span>
          </button>

          {/* Master Volume control */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#2E2824] px-2 py-1 rounded-lg border border-[#3D3530]">
            <Volume2 className="w-3.5 h-3.5 text-[#A69B8D]" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="w-16 h-1 accent-amber-500 cursor-pointer"
              title="Master Soundboard Volume"
            />
          </div>

          {activeProject && (
            <>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#332D29] hover:bg-[#433B36] border border-[#3D3530] text-[#EDE8E3] flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
                onClick={() => setIsCoverModalOpen(true)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#332D29] hover:bg-[#433B36] border border-[#3D3530] text-[#EDE8E3] flex items-center gap-1.5 transition"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cover</span>
              </button>
            </>
          )}

          {!activeProject && (
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-md flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Episode</span>
            </button>
          )}
        </div>
      </header>

      {/* ================= WORKSPACE BODY ================= */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* ================= VIEW 1: DASHBOARD ================= */}
        {!activeProject ? (
          <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto bg-[#161413]">
            {/* Hero Banner */}
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-[#29221C] via-[#241F1C] to-[#1C1816] border border-[#3D3530] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
                  Multi-Voice Podcast Production
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white">Produce Broadcasts, Script Audio Dramas</h2>
                <p className="text-xs text-[#A69B8D] max-w-xl mt-1 leading-relaxed">
                  Design characters with synthetic voice traits, direct screenplay teleprompters with audio playback, queue live SFX cues, and schedule radio commercials offline.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Episode</span>
                </button>
                <button
                  onClick={handleResetSampleProjects}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-[#2E2824] hover:bg-[#3D3530] border border-[#473E38] text-[#A69B8D] hover:text-white transition"
                  title="Reset sample episodes"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              {/* Genre Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {['All', 'Tech & AI', 'True Crime', 'Comedy & Banter', 'Sci-Fi & Cyberpunk', 'Storytelling & Drama'].map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setGenreFilter(genre)}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${
                      genreFilter === genre
                        ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                        : 'bg-[#24201E] text-[#A69B8D] hover:text-white border border-[#38312B]'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search episodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#24201E] border border-[#38312B] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#786E64] focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="group bg-[#24201E] border border-[#38312B] hover:border-amber-600/60 rounded-2xl overflow-hidden shadow-md flex flex-col transition hover:shadow-xl"
                >
                  {/* Cover Header */}
                  <div className="h-32 w-full relative overflow-hidden bg-slate-900">
                    <img
                      src={p.coverUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#24201E] via-transparent to-black/30" />
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-amber-400 border border-white/10">
                      {p.genre}
                    </span>
                    <span className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[#EDE8E3] border border-white/10">
                      ~{p.targetDurationMinutes} min
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white group-hover:text-amber-400 transition">
                        {p.title}
                      </h3>
                      <p className="text-[11px] text-[#A69B8D] mt-1 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>

                      {/* Cast Avatars */}
                      <div className="mt-3 flex items-center gap-1.5">
                        <span className="text-[10px] text-[#786E64] font-bold">Cast:</span>
                        <div className="flex -space-x-1.5">
                          {p.characters.map((c) => (
                            <img
                              key={c.id}
                              src={c.avatarUrl}
                              alt={c.name}
                              title={`${c.name} (${c.mainRole})`}
                              className="w-5 h-5 rounded-full object-cover border border-[#24201E]"
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-[#A69B8D] ml-1">
                          {p.characters.length} characters • {p.script.length} cues
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-[#332D29] flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDuplicateProject(p)}
                          className="p-1.5 rounded text-[#A69B8D] hover:text-white hover:bg-[#332D29] transition"
                          title="Duplicate project"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="p-1.5 rounded text-[#A69B8D] hover:text-rose-400 hover:bg-rose-950/30 transition"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setActiveProjectId(p.id);
                          if (p.characters.length > 0) {
                            setNewSpeakerId(p.characters[0].id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow flex items-center gap-1.5 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Open Studio</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ================= VIEW 2: ACTIVE PROJECT STUDIO WORKSPACE ================= */
          <div className="flex-1 flex flex-col min-h-0 bg-[#161413]">
            {/* Editor Tab Navigation Bar */}
            <div className="shrink-0 bg-[#24201E] border-b border-[#3D3530] px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('script')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'script'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-[#A69B8D] hover:text-white hover:bg-[#332D29]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Script & Teleprompter ({activeProject.script.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('characters')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'characters'
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                      : 'text-[#A69B8D] hover:text-white hover:bg-[#332D29]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Voice & Cast ({activeProject.characters.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('soundboard')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'soundboard'
                      ? 'bg-rose-500 text-slate-950 shadow-md font-black'
                      : 'text-[#A69B8D] hover:text-white hover:bg-[#332D29]'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Live SFX & Soundboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('ads')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'ads'
                      ? 'bg-purple-500 text-slate-950 shadow-md font-black'
                      : 'text-[#A69B8D] hover:text-white hover:bg-[#332D29]'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Commercial & Ad Breaks</span>
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'notes'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'text-[#A69B8D] hover:text-white hover:bg-[#332D29]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Show Notes</span>
                </button>
              </div>

              {/* Teleprompter controls */}
              <div className="flex items-center gap-2 shrink-0">
                {isPlayingTeleprompter ? (
                  <button
                    onClick={stopTeleprompter}
                    className="px-3 py-1 rounded-lg text-xs font-black bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow transition"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>Stop Prompter</span>
                  </button>
                ) : (
                  <button
                    onClick={startTeleprompter}
                    className="px-3 py-1 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Run Teleprompter</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sub-View Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
              {/* TAB 1: SCRIPT EDITOR & TELEPROMPTER */}
              {activeTab === 'script' && (
                <div className="max-w-4xl mx-auto space-y-4">
                  {/* Script Add Line Box */}
                  <div className="bg-[#24201E] border border-[#38312B] rounded-2xl p-4 shadow-lg space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Insert Screenplay Cue</span>
                      </span>

                      {/* Type switcher */}
                      <div className="flex items-center gap-1 bg-[#1A1817] p-1 rounded-lg border border-[#332D29]">
                        <button
                          onClick={() => setLineType('dialogue')}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            lineType === 'dialogue' ? 'bg-amber-500 text-slate-950' : 'text-[#A69B8D]'
                          }`}
                        >
                          Dialogue
                        </button>
                        <button
                          onClick={() => setLineType('scene_header')}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            lineType === 'scene_header' ? 'bg-amber-500 text-slate-950' : 'text-[#A69B8D]'
                          }`}
                        >
                          Scene Header
                        </button>
                        <button
                          onClick={() => setLineType('ad_break')}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            lineType === 'ad_break' ? 'bg-amber-500 text-slate-950' : 'text-[#A69B8D]'
                          }`}
                        >
                          Ad Break
                        </button>
                      </div>
                    </div>

                    {lineType === 'dialogue' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* Speaker Selector */}
                        <div>
                          <label className="text-[10px] font-bold text-[#A69B8D] block mb-1">Speaker</label>
                          <select
                            value={newSpeakerId}
                            onChange={(e) => setNewSpeakerId(e.target.value)}
                            className="w-full bg-[#1A1817] border border-[#38312B] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            {activeProject.characters.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} ({c.mainRole})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Emotion note */}
                        <div>
                          <label className="text-[10px] font-bold text-[#A69B8D] block mb-1">Emotion / Delivery</label>
                          <input
                            type="text"
                            placeholder="e.g. Whispering, Chuckling..."
                            value={newLineEmotion}
                            onChange={(e) => setNewLineEmotion(e.target.value)}
                            className="w-full bg-[#1A1817] border border-[#38312B] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-[#786E64] focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* SFX cue */}
                        <div>
                          <label className="text-[10px] font-bold text-[#A69B8D] block mb-1">Sound Cue</label>
                          <select
                            value={newLineSfx}
                            onChange={(e) => setNewLineSfx(e.target.value)}
                            className="w-full bg-[#1A1817] border border-[#38312B] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="">None</option>
                            <option value="intro_chime">Intro Chime</option>
                            <option value="dramatic_boom">Dramatic Boom</option>
                            <option value="applause">Applause</option>
                            <option value="laser_zap">Laser Zap</option>
                            <option value="tape_stop">Tape Stop</option>
                            <option value="vinyl_crackle">Vinyl Crackle</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {lineType === 'scene_header' && (
                      <div>
                        <label className="text-[10px] font-bold text-[#A69B8D] block mb-1">Scene Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Act II: The Underground Transmitter"
                          value={newLineText}
                          onChange={(e) => setNewLineText(e.target.value)}
                          className="w-full bg-[#1A1817] border border-[#38312B] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#786E64] focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    )}

                    {lineType === 'ad_break' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-[#A69B8D] block mb-1">Sponsor / Station Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Local WiFi Hotspot Sponsor"
                            value={newLineEmotion}
                            onChange={(e) => setNewLineEmotion(e.target.value)}
                            className="w-full bg-[#1A1817] border border-[#38312B] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#786E64] focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#A69B8D] block mb-1">Commercial Audio Script</label>
                          <input
                            type="text"
                            placeholder="e.g. Connect to Aya OS Hotspot for full portfolio apps."
                            value={newLineText}
                            onChange={(e) => setNewLineText(e.target.value)}
                            className="w-full bg-[#1A1817] border border-[#38312B] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#786E64] focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    )}

                    {lineType === 'dialogue' && (
                      <div>
                        <label className="text-[10px] font-bold text-[#A69B8D] block mb-1">Dialogue Text</label>
                        <textarea
                          rows={2}
                          placeholder="Type dialogue lines here..."
                          value={newLineText}
                          onChange={(e) => setNewLineText(e.target.value)}
                          className="w-full bg-[#1A1817] border border-[#38312B] rounded-lg p-2.5 text-xs text-white placeholder-[#786E64] focus:outline-none focus:border-amber-500 resize-none"
                        />
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={handleAddLine}
                        className="px-4 py-1.5 rounded-lg text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow flex items-center gap-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Teleprompter</span>
                      </button>
                    </div>
                  </div>

                  {/* Script Cues Feed */}
                  <div className="space-y-3">
                    {activeProject.script.map((line, idx) => {
                      const char = activeProject.characters.find((c) => c.id === line.characterId);
                      const isSpeakingNow = activeSpeakingLineId === line.id;

                      if (line.isSceneHeader) {
                        return (
                          <div
                            key={line.id}
                            className="py-2 px-4 rounded-xl bg-[#2E2824] border border-[#473E38] flex items-center justify-between text-xs font-black text-amber-400"
                          >
                            <div className="flex items-center gap-2">
                              <Disc className="w-4 h-4 text-amber-500" />
                              <span>{line.sceneTitle}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleMoveLine(idx, 'up')}
                                className="p-1 hover:text-white text-[#A69B8D]"
                                title="Move up"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => handleMoveLine(idx, 'down')}
                                className="p-1 hover:text-white text-[#A69B8D]"
                                title="Move down"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => handleDeleteLine(line.id)}
                                className="p-1 hover:text-rose-400 text-[#A69B8D]"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      }

                      if (line.isAdBreak) {
                        return (
                          <div
                            key={line.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                              isSpeakingNow
                                ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-500 shadow-lg'
                                : 'bg-purple-950/30 border-purple-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0">
                                <Megaphone className="w-4 h-4 text-purple-300" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-purple-300">{line.adSponsorName}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900 text-purple-200 font-bold">
                                    Ad Spot
                                  </span>
                                </div>
                                <p className="text-xs text-purple-100/90 truncate">{line.text}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => speakLine(line)}
                                className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 transition"
                              >
                                <Play className="w-3 h-3 fill-white" />
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => handleDeleteLine(line.id)}
                                className="p-1 hover:text-rose-400 text-[#A69B8D]"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={line.id}
                          className={`p-3.5 rounded-xl border transition flex flex-col gap-2 ${
                            isSpeakingNow
                              ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-500 shadow-xl'
                              : 'bg-[#24201E] border-[#38312B] hover:border-[#4A423B]'
                          }`}
                        >
                          {/* Speaker Bar */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {char?.avatarUrl && (
                                <img
                                  src={char.avatarUrl}
                                  alt={char.name}
                                  className="w-6 h-6 rounded-full object-cover border border-amber-500/50"
                                />
                              )}
                              <span className="text-xs font-black text-white">{line.characterName}</span>
                              {line.emotionNote && (
                                <span className="text-[10px] font-semibold text-amber-300/90 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/60">
                                  {line.emotionNote}
                                </span>
                              )}
                              {line.sfxCue && (
                                <button
                                  onClick={() => playSfx(line.sfxCue!)}
                                  className="text-[10px] font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800/60 hover:bg-rose-900 transition flex items-center gap-1"
                                >
                                  <Radio className="w-2.5 h-2.5" />
                                  <span>SFX: {line.sfxCue}</span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => speakLine(line)}
                                className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition ${
                                  isSpeakingNow
                                    ? 'bg-amber-500 text-slate-950'
                                    : 'bg-[#332D29] hover:bg-[#433B36] text-[#EDE8E3]'
                                }`}
                                title="Synthesize and speak line"
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>Speak</span>
                              </button>
                              <button
                                onClick={() => handleMoveLine(idx, 'up')}
                                className="p-1 hover:text-white text-[#A69B8D]"
                                title="Move up"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => handleMoveLine(idx, 'down')}
                                className="p-1 hover:text-white text-[#A69B8D]"
                                title="Move down"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => handleDeleteLine(line.id)}
                                className="p-1 hover:text-rose-400 text-[#A69B8D]"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Dialogue Text */}
                          <p className="text-xs text-[#E0D7CE] leading-relaxed pl-8 font-serif">
                            "{line.text}"
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: VOICE & CAST STUDIO */}
              {activeTab === 'characters' && (
                <div className="max-w-4xl mx-auto space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-black text-white">Cast & Voice Profiles</h2>
                      <p className="text-xs text-[#A69B8D]">
                        Configure synthetic voice tone, pitch, rate, and broadcast effects for each personality.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const newChar: Character = {
                          id: `char-${Date.now()}`,
                          name: 'New Host / Guest',
                          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
                          mainRole: 'Host / Commentator',
                          personality: 'Engaging, knowledgeable, clear delivery.',
                          quirks: 'Uses evocative metaphors.',
                          background: 'Experienced broadcaster.',
                          voiceConfig: {
                            voiceName: 'New Voice',
                            gender: 'Male',
                            pitch: 1.0,
                            rate: 1.0,
                            tone: 'Warm & Professional',
                            emotionStyle: 'Enthusiastic',
                            audioEffect: 'studio_warmth'
                          },
                          relationships: []
                        };
                        handleUpdateCurrentProject({
                          ...activeProject,
                          characters: [...activeProject.characters, newChar]
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-black bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Character</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeProject.characters.map((char) => (
                      <div
                        key={char.id}
                        className="bg-[#24201E] border border-[#38312B] rounded-2xl p-4 shadow-md flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={char.avatarUrl}
                            alt={char.name}
                            className="w-14 h-14 rounded-xl object-cover border border-[#473E38] shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-black text-white truncate">{char.name}</h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                {char.mainRole}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#A69B8D] mt-1 line-clamp-2">{char.personality}</p>
                          </div>
                        </div>

                        {/* Voice Configuration Sliders */}
                        <div className="bg-[#1A1817] p-3 rounded-xl border border-[#332D29] space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#A69B8D]">Voice Profile:</span>
                            <span className="font-black text-white">{char.voiceConfig.tone}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="flex justify-between text-[10px] text-[#786E64] mb-0.5">
                                <span>Pitch</span>
                                <span>{char.voiceConfig.pitch.toFixed(1)}x</span>
                              </div>
                              <input
                                type="range"
                                min="0.6"
                                max="1.6"
                                step="0.1"
                                value={char.voiceConfig.pitch}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  const updated = activeProject.characters.map((c) =>
                                    c.id === char.id ? { ...c, voiceConfig: { ...c.voiceConfig, pitch: val } } : c
                                  );
                                  handleUpdateCurrentProject({ ...activeProject, characters: updated });
                                }}
                                className="w-full h-1 accent-cyan-500 cursor-pointer"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between text-[10px] text-[#786E64] mb-0.5">
                                <span>Speed</span>
                                <span>{char.voiceConfig.rate.toFixed(1)}x</span>
                              </div>
                              <input
                                type="range"
                                min="0.7"
                                max="1.4"
                                step="0.1"
                                value={char.voiceConfig.rate}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  const updated = activeProject.characters.map((c) =>
                                    c.id === char.id ? { ...c, voiceConfig: { ...c.voiceConfig, rate: val } } : c
                                  );
                                  handleUpdateCurrentProject({ ...activeProject, characters: updated });
                                }}
                                className="w-full h-1 accent-cyan-500 cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* Audio effect chip */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-[#786E64]">Effect Filter:</span>
                            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                              {char.voiceConfig.audioEffect?.replace('_', ' ') || 'None'}
                            </span>
                          </div>
                        </div>

                        {/* Test Voice Button */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => {
                              speakLine({
                                id: 'sample-test',
                                characterId: char.id,
                                characterName: char.name,
                                text: `Hello, this is ${char.name}. Broadcasting live on Aya OS Podcast Studio.`
                              });
                            }}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-[#332D29] hover:bg-[#433B36] text-[#EDE8E3] flex items-center gap-1.5 transition"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Audition Voice</span>
                          </button>

                          {/* Delete character */}
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${char.name}?`)) {
                                handleUpdateCurrentProject({
                                  ...activeProject,
                                  characters: activeProject.characters.filter((c) => c.id !== char.id)
                                });
                              }
                            }}
                            className="p-1.5 rounded text-[#A69B8D] hover:text-rose-400 transition"
                            title="Remove character"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: LIVE SFX & SOUNDBOARD */}
              {activeTab === 'soundboard' && (
                <div className="max-w-4xl mx-auto space-y-4">
                  <div className="bg-[#24201E] border border-[#38312B] rounded-2xl p-4 shadow-md">
                    <h2 className="text-base font-black text-white">Live Broadcast Soundboard</h2>
                    <p className="text-xs text-[#A69B8D]">
                      Synthesized sound effects generated live using Web Audio oscillators. Click to trigger during teleprompter recording or copy cue names into your script.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {[
                      { id: 'intro_chime', name: 'Intro Chime', desc: 'Melodic 3-tone opening' },
                      { id: 'dramatic_boom', name: 'Dramatic Boom', desc: 'Low sub impact hit' },
                      { id: 'applause', name: 'Crowd Roar', desc: 'Synthesized audience applause' },
                      { id: 'laser_zap', name: 'Laser Zap', desc: 'Sci-fi frequency drop' },
                      { id: 'tape_stop', name: 'Tape Stop', desc: 'Vintage cassette deceleration' },
                      { id: 'vinyl_crackle', name: 'Vinyl Static', desc: 'Analog dust & clicks' }
                    ].map((sfx) => {
                      const isActive = soundboardActive === sfx.id;
                      return (
                        <button
                          key={sfx.id}
                          onClick={() => playSfx(sfx.id)}
                          className={`p-4 rounded-2xl border text-left transition transform active:scale-95 flex flex-col justify-between h-28 ${
                            isActive
                              ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-500/40 ring-2 ring-rose-400'
                              : 'bg-[#24201E] border-[#38312B] hover:border-rose-500/50 text-[#EDE8E3]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Radio className={`w-5 h-5 ${isActive ? 'text-white' : 'text-rose-400'}`} />
                            <span className="text-[10px] font-mono opacity-60">HOTKEY</span>
                          </div>
                          <div>
                            <span className="text-xs font-black block">{sfx.name}</span>
                            <span className="text-[10px] opacity-70 block">{sfx.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: COMMERCIAL & AD BREAKS */}
              {activeTab === 'ads' && (
                <div className="max-w-4xl mx-auto space-y-4">
                  <div className="bg-[#24201E] border border-[#38312B] rounded-2xl p-4 shadow-md flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-black text-white">Broadcast Commercial Scheduler</h2>
                      <p className="text-xs text-[#A69B8D]">
                        Manage sponsor spots, station bumpers, and PSAs to structure professional episodes.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const newAd: ScriptLine = {
                          id: `ad-${Date.now()}`,
                          characterId: '',
                          characterName: '',
                          text: 'Experience Aya OS Portfolio Edition on any mobile browser with 0ms local latency.',
                          isAdBreak: true,
                          adSponsorName: 'Aya OS Local Network',
                          adDurationSec: 30,
                          adCategory: 'Sponsor Spot'
                        };
                        handleUpdateCurrentProject({
                          ...activeProject,
                          script: [...activeProject.script, newAd]
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-black bg-purple-500 hover:bg-purple-400 text-slate-950 shadow flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Insert Commercial Spot</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activeProject.script.filter((l) => l.isAdBreak).map((ad) => (
                      <div
                        key={ad.id}
                        className="bg-[#24201E] border border-purple-800/60 rounded-2xl p-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-700/60 flex items-center justify-center shrink-0">
                            <Megaphone className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-black text-white">{ad.adSponsorName}</h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-900 text-purple-200">
                                ~{ad.adDurationSec || 30}s Spot
                              </span>
                            </div>
                            <p className="text-xs text-[#A69B8D] mt-1">{ad.text}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => speakLine(ad)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1 transition"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => handleDeleteLine(ad.id)}
                            className="p-1.5 rounded text-[#A69B8D] hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SHOW NOTES */}
              {activeTab === 'notes' && (
                <div className="max-w-4xl mx-auto space-y-4">
                  <div className="bg-[#24201E] border border-[#38312B] rounded-2xl p-4 shadow-md">
                    <h2 className="text-base font-black text-white">Episode Show Notes & Distribution Meta</h2>
                    <p className="text-xs text-[#A69B8D]">
                      Markdown notes published alongside the broadcast with episode timestamps and sponsor credits.
                    </p>
                  </div>

                  <textarea
                    rows={12}
                    value={activeProject.showNotes || ''}
                    onChange={(e) =>
                      handleUpdateCurrentProject({
                        ...activeProject,
                        showNotes: e.target.value
                      })
                    }
                    className="w-full bg-[#24201E] border border-[#38312B] rounded-2xl p-4 text-xs font-mono text-[#EDE8E3] focus:outline-none focus:border-amber-500 leading-relaxed resize-none shadow-md"
                    placeholder="Enter episode markdown notes..."
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: NEW EPISODE / GENERATE ================= */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#24201E] border border-[#3D3530] w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white">Create New Podcast Episode</h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[#A69B8D] block mb-1">Episode Title</label>
                <input
                  id="new-ep-title"
                  type="text"
                  defaultValue="New Broadcast Episode"
                  className="w-full bg-[#1A1817] border border-[#38312B] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A69B8D] block mb-1">Genre</label>
                <select
                  id="new-ep-genre"
                  defaultValue="Tech & AI"
                  className="w-full bg-[#1A1817] border border-[#38312B] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Tech & AI">Tech & AI</option>
                  <option value="True Crime">True Crime</option>
                  <option value="Comedy & Banter">Comedy & Banter</option>
                  <option value="Sci-Fi & Cyberpunk">Sci-Fi & Cyberpunk</option>
                  <option value="Business & Finance">Business & Finance</option>
                  <option value="Storytelling & Drama">Storytelling & Drama</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A69B8D] block mb-1">Premise / Synopsis</label>
                <textarea
                  id="new-ep-desc"
                  rows={3}
                  defaultValue="Exploring new horizons with in-depth guest discussions and sound effects."
                  className="w-full bg-[#1A1817] border border-[#38312B] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#332D29]">
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#A69B8D] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const titleInput = (document.getElementById('new-ep-title') as HTMLInputElement)?.value || 'Untitled Episode';
                  const genreInput = ((document.getElementById('new-ep-genre') as HTMLSelectElement)?.value || 'Tech & AI') as PodcastGenre;
                  const descInput = (document.getElementById('new-ep-desc') as HTMLTextAreaElement)?.value || '';

                  const newProject: PodcastProject = {
                    id: `proj-${Date.now()}`,
                    title: titleInput,
                    tagline: descInput.slice(0, 60),
                    description: descInput,
                    genre: genreInput,
                    coverUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
                    mode: 'creator',
                    targetDurationMinutes: 20,
                    bgmTrack: 'tech_ambient',
                    soundBoard: ['intro_chime', 'dramatic_boom'],
                    showNotes: `# ${titleInput}\n${descInput}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    characters: [
                      {
                        id: `char-${Date.now()}-1`,
                        name: 'Lead Host',
                        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                        mainRole: 'Host',
                        personality: 'Energetic and inquisitive.',
                        quirks: 'Warm vocal tone.',
                        background: 'Podcaster and storyteller.',
                        voiceConfig: {
                          voiceName: 'Host 1',
                          gender: 'Male',
                          pitch: 1.0,
                          rate: 1.0,
                          tone: 'Warm & Authoritative',
                          emotionStyle: 'Enthusiastic',
                          audioEffect: 'studio_warmth'
                        },
                        relationships: []
                      }
                    ],
                    script: [
                      {
                        id: `line-${Date.now()}-1`,
                        characterId: `char-${Date.now()}-1`,
                        characterName: 'Lead Host',
                        text: `Welcome to ${titleInput}! In this episode, we're diving straight into our story.`,
                        emotionNote: '[Opening greeting]',
                        sfxCue: 'intro_chime'
                      }
                    ]
                  };

                  setProjects((prev) => [newProject, ...prev]);
                  setActiveProjectId(newProject.id);
                  setIsNewProjectModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow"
              >
                Create Episode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EXPORT SCRIPT / TELEPROMPTER ================= */}
      {isExportModalOpen && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#24201E] border border-[#3D3530] w-full max-w-xl rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Export Broadcast Screenplay</h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-[#A69B8D] hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#A69B8D]">
              Copy screenplay formatted text for teleprompter apps or download project backup JSON.
            </p>

            <textarea
              readOnly
              rows={8}
              value={activeProject.script
                .map((l) =>
                  l.isSceneHeader
                    ? `\n=== ${l.sceneTitle?.toUpperCase()} ===\n`
                    : l.isAdBreak
                    ? `\n[COMMERCIAL BREAK: ${l.adSponsorName}]\n${l.text}\n`
                    : `${l.characterName.toUpperCase()} ${l.emotionNote || ''}:\n${l.text}\n`
                )
                .join('\n')}
              className="w-full bg-[#1A1817] border border-[#38312B] rounded-xl p-3 text-xs font-mono text-[#EDE8E3] focus:outline-none select-all"
            />

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(activeProject, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${activeProject.title.replace(/\s+/g, '_')}_project.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#332D29] hover:bg-[#433B36] text-[#EDE8E3] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON</span>
              </button>

              <button
                onClick={() => {
                  const text = activeProject.script
                    .map((l) =>
                      l.isSceneHeader
                        ? `=== ${l.sceneTitle} ===`
                        : `${l.characterName}: ${l.text}`
                    )
                    .join('\n\n');
                  navigator.clipboard.writeText(text);
                  alert('Screenplay copied to clipboard!');
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950"
              >
                Copy Screenplay Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: COVER ART ================= */}
      {isCoverModalOpen && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#24201E] border border-[#3D3530] w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white">Cover Artwork</h3>
            <p className="text-xs text-[#A69B8D]">Select a curated studio artwork preset or paste a custom image URL.</p>

            <div className="grid grid-cols-3 gap-2">
              {[
                'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'
              ].map((imgUrl, i) => (
                <div
                  key={i}
                  onClick={() => {
                    handleUpdateCurrentProject({ ...activeProject, coverUrl: imgUrl });
                    setIsCoverModalOpen(false);
                  }}
                  className="h-20 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-amber-500 transition"
                >
                  <img src={imgUrl} alt="Cover option" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsCoverModalOpen(false)}
                className="px-3 py-1 rounded text-xs font-bold text-[#A69B8D] hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bike, 
  Battery, 
  Zap, 
  Gauge, 
  Navigation, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Send, 
  Radio, 
  Sliders, 
  ShieldAlert, 
  Sun, 
  Compass, 
  RefreshCw, 
  ExternalLink, 
  Play, 
  Square, 
  ChevronRight, 
  AlertTriangle,
  Server,
  Activity,
  Layers
} from 'lucide-react';

type AssistMode = 'OFF' | 'ECO' | 'TOUR' | 'SPORT' | 'TURBO';

interface ChatMessage {
  id: string;
  sender: 'hermes' | 'rider';
  text: string;
  time: string;
}

export const HermesEbikeApp: React.FC = () => {
  // Telemetry States
  const [speed, setSpeed] = useState<number>(18.4);
  const [targetSpeed, setTargetSpeed] = useState<number>(18.4);
  const [assistMode, setAssistMode] = useState<AssistMode>('TOUR');
  const [battery, setBattery] = useState<number>(82);
  const [motorWatts, setMotorWatts] = useState<number>(285);
  const [cadence, setCadence] = useState<number>(74);
  const [motorTemp, setMotorTemp] = useState<number>(36);
  const [tripMiles, setTripMiles] = useState<number>(7.3);
  const [tripMinutes, setTripMinutes] = useState<number>(24);
  const [headlight, setHeadlight] = useState<'off' | 'low' | 'high'>('low');
  const [leftSignal, setLeftSignal] = useState(false);
  const [rightSignal, setRightSignal] = useState(false);
  const [hazard, setHazard] = useState(false);
  const [hornActive, setHornActive] = useState(false);
  const [radarWarning, setRadarWarning] = useState<string | null>(null);

  // AI & Hermes State
  const [activeTab, setActiveTab] = useState<'cockpit' | 'neural' | 'radar' | 'ollama' | 'cloud-app'>('cockpit');
  const [hermesStatus, setHermesStatus] = useState<'idle' | 'listening' | 'speaking' | 'computing'>('idle');
  const [aiProvider, setAiProvider] = useState<'cloud' | 'ollama'>('cloud');
  const [ollamaUrl, setOllamaUrl] = useState<string>('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState<string>('llama3.2');
  const [ollamaStatus, setOllamaStatus] = useState<'unchecked' | 'connected' | 'unreachable'>('unchecked');
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'hermes',
      text: "Hermes v3.8 online. Neural face synchronized with 52V drivetrain. Battery at 82% (~38 mi range in Tour). All radar sensors nominal.",
      time: '12:04'
    }
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Speed and telemetry simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Smoothly nudge speed toward targetSpeed
      setSpeed(prev => {
        const delta = (targetSpeed - prev) * 0.12;
        const next = Math.max(0, Math.min(38, prev + delta));
        return parseFloat(next.toFixed(1));
      });

      // Update motor wattage according to speed and assist mode
      const multiplierMap: Record<AssistMode, number> = {
        OFF: 0,
        ECO: 8,
        TOUR: 15,
        SPORT: 22,
        TURBO: 32,
      };
      const baseWatts = Math.round(speed * multiplierMap[assistMode]);
      setMotorWatts(baseWatts + Math.floor(Math.random() * 15 - 7));

      // Cadence simulation
      setCadence(speed > 0 ? Math.min(105, Math.max(45, Math.round(speed * 3.8 + (Math.random() * 4 - 2)))) : 0);

      // Increment trip distance slowly when moving
      if (speed > 1) {
        setTripMiles(m => parseFloat((m + (speed / 3600) * 1.5).toFixed(2)));
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [targetSpeed, speed, assistMode]);

  // Turn signal flashing effect
  useEffect(() => {
    if (!leftSignal && !rightSignal && !hazard) return;
    const flashInterval = setInterval(() => {
      // Tick for UI re-render pulse
    }, 500);
    return () => clearInterval(flashInterval);
  }, [leftSignal, rightSignal, hazard]);

  // Proximity Radar Periodic Alert simulation
  useEffect(() => {
    const radarTimer = setInterval(() => {
      const roll = Math.random();
      if (roll > 0.75) {
        setRadarWarning('Vehicle approaching rear-left at 28 mph (15 meters)');
        setTimeout(() => setRadarWarning(null), 4000);
      } else if (roll < 0.15) {
        setRadarWarning('Cyclist passing on right shoulder');
        setTimeout(() => setRadarWarning(null), 3000);
      }
    }, 12000);

    return () => clearInterval(radarTimer);
  }, []);

  // Liquid Void Neural Face Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      angle += 0.035;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Radial background dark aura
      const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, centerX * 0.95);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
      gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.06)');
      gradient.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Reactivity factors
      const statusMultiplier = hermesStatus === 'speaking' ? 1.6 : hermesStatus === 'listening' ? 1.4 : 1.0;
      const speedFactor = 1 + (speed / 35) * 0.6;
      const baseRadius = (width * 0.28) * statusMultiplier;

      // Draw multi-layered liquid void rings
      const ringCount = 4;
      for (let r = 0; r < ringCount; r++) {
        ctx.beginPath();
        const currentRingRadius = baseRadius - r * 14;
        if (currentRingRadius <= 0) continue;

        const points = 24;
        for (let i = 0; i <= points; i++) {
          const theta = (i / points) * Math.PI * 2;
          // Fluid harmonic oscillations
          const distortion1 = Math.sin(theta * 3 + angle + r) * (8 * speedFactor);
          const distortion2 = Math.cos(theta * 5 - angle * 1.5) * (5 * statusMultiplier);
          const currentR = currentRingRadius + distortion1 + distortion2;

          const x = centerX + Math.cos(theta) * currentR;
          const y = centerY + Math.sin(theta) * currentR;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        // Color coding depending on status and assist mode
        if (assistMode === 'TURBO') {
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.45 - r * 0.08})`;
        } else if (hermesStatus === 'listening') {
          ctx.strokeStyle = `rgba(234, 179, 8, ${0.55 - r * 0.1})`;
        } else if (hermesStatus === 'speaking') {
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.65 - r * 0.12})`;
        } else {
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.45 - r * 0.09})`;
        }
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }

      // Central Neural "Pupil" / Core Void
      ctx.beginPath();
      const coreR = Math.max(6, 14 + Math.sin(angle * 2) * 4);
      ctx.arc(centerX, centerY, coreR, 0, Math.PI * 2);
      ctx.fillStyle = assistMode === 'TURBO' ? '#ef4444' : '#10b981';
      ctx.shadowColor = assistMode === 'TURBO' ? '#ef4444' : '#10b981';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Neural eye-glance tracking
      const lookOffset = Math.sin(angle * 0.7) * 6;
      ctx.beginPath();
      ctx.arc(centerX + lookOffset, centerY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hermesStatus, speed, assistMode]);

  // Electronic Horn Sound Generator (Web Audio API)
  const handleHorn = () => {
    setHornActive(true);
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(420, ctx.currentTime);
      osc2.frequency.setValueAtTime(440, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio horn unavailable', e);
    }
    setTimeout(() => setHornActive(false), 350);
  };

  // Text to Speech playback
  const speakText = (text: string) => {
    if (voiceMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.05;
      utterance.rate = 1.1;
      utterance.onstart = () => setHermesStatus('speaking');
      utterance.onend = () => setHermesStatus('idle');
      utterance.onerror = () => setHermesStatus('idle');
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error', e);
      setHermesStatus('idle');
    }
  };

  // Submit Prompt to Hermes (Gemini or Ollama)
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isGenerating) return;

    setInputPrompt('');
    const riderMsg: ChatMessage = {
      id: `rider-${Date.now()}`,
      sender: 'rider',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, riderMsg]);
    setIsGenerating(true);
    setHermesStatus('computing');

    // Context telemetry bundle
    const telemetryBundle = {
      speed,
      assistMode,
      battery,
      motorWatts,
      motorTemp,
      cadence,
      tripMiles
    };

    try {
      let reply = '';
      if (aiProvider === 'ollama') {
        const res = await fetch('/api/ollama/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseUrl: ollamaUrl,
            model: ollamaModel,
            prompt: `You are Hermes, an advanced e-bike neural co-pilot. Telemetry: Speed ${speed}mph, Assist ${assistMode}, Battery ${battery}%, Motor ${motorWatts}W. Rider says: "${query}". Keep response concise and bike-focused.`
          })
        });
        const data = await res.json();
        reply = data.response || `[Ollama] Command acknowledged. Telemetry green.`;
      } else {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: query,
            telemetry: telemetryBundle,
            history: messages.slice(-4).map(m => ({
              role: m.sender === 'rider' ? 'user' : 'model',
              content: m.text
            }))
          })
        });
        const data = await res.json();
        reply = data.response || `Hermes neural link stable. Safe riding.`;
      }

      const hermesMsg: ChatMessage = {
        id: `hermes-${Date.now()}`,
        sender: 'hermes',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, hermesMsg]);
      speakText(reply);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'hermes',
        text: `[Neural Co-Pilot Offline Link] Telemetry captured. All motor safety constraints active.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
      setHermesStatus('idle');
    }
  };

  // Toggle Voice Recognition (Microphone)
  const handleToggleMic = () => {
    if (isListening) {
      setIsListening(false);
      setHermesStatus('idle');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query in the cockpit prompt.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setHermesStatus('listening');
      };

      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setHermesStatus('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (hermesStatus === 'listening') {
          setHermesStatus('idle');
        }
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error', e);
      setIsListening(false);
      setHermesStatus('idle');
    }
  };

  // Check Ollama Server connectivity
  const handleTestOllama = async () => {
    setOllamaStatus('unchecked');
    try {
      const res = await fetch('/api/ollama/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl: ollamaUrl })
      });
      if (res.ok) {
        setOllamaStatus('connected');
      } else {
        setOllamaStatus('unreachable');
      }
    } catch (e) {
      setOllamaStatus('unreachable');
    }
  };

  return (
    <div className="h-full w-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden border border-slate-800">
      {/* Top Cockpit Status Bar */}
      <header className="h-11 shrink-0 bg-slate-900/90 border-b border-slate-800 px-3 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bike className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wider text-slate-100">HERMES</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                E-BIKE AI FACE
              </span>
            </div>
          </div>
        </div>

        {/* Radar & Safety Alert Banner */}
        {radarWarning && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-300 text-xs animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-[11px]">{radarWarning}</span>
          </div>
        )}

        {/* Right Navigation & Indicators */}
        <div className="flex items-center gap-1.5">
          {/* Assist Mode pill */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 text-[11px] font-mono">
            <Zap className={`w-3.5 h-3.5 ${assistMode === 'TURBO' ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
            <span className="font-bold text-slate-200">{assistMode}</span>
          </div>

          {/* Battery level */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 text-[11px] font-mono">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">{battery}%</span>
          </div>

          {/* Voice Mute toggle */}
          <button
            onClick={() => setVoiceMuted(!voiceMuted)}
            className={`p-1.5 rounded-md border text-xs transition ${voiceMuted ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'}`}
            title={voiceMuted ? 'Voice output muted' : 'Voice output active'}
          >
            {voiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Sub-Navigation Tabs */}
      <div className="h-9 shrink-0 bg-slate-950 border-b border-slate-800/80 px-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('cockpit')}
            className={`px-3 py-1 rounded-md font-bold transition flex items-center gap-1.5 ${activeTab === 'cockpit' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Cockpit HUD</span>
          </button>
          <button
            onClick={() => setActiveTab('neural')}
            className={`px-3 py-1 rounded-md font-bold transition flex items-center gap-1.5 ${activeTab === 'neural' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Neural Face & Voice</span>
          </button>
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1 rounded-md font-bold transition flex items-center gap-1.5 ${activeTab === 'radar' ? 'bg-purple-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>360° Radar & GPS</span>
          </button>
          <button
            onClick={() => setActiveTab('ollama')}
            className={`px-3 py-1 rounded-md font-bold transition flex items-center gap-1.5 ${activeTab === 'ollama' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Local Ollama</span>
          </button>
          <button
            onClick={() => setActiveTab('cloud-app')}
            className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700`}
            title="Switch to original Cloud Applet iframe"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cloud Applet</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>52V Lithium Pack</span>
          <span>•</span>
          <span>Bafang Mid-Drive 750W</span>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-slate-950">
        {activeTab === 'cockpit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full max-w-6xl mx-auto">
            {/* Left HUD: Speedometer & Dynamic Void Face */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between relative overflow-hidden backdrop-blur-md">
              {/* Background ambient canvas for liquid face */}
              <div className="relative w-full flex flex-col items-center justify-center my-auto py-2">
                <canvas 
                  ref={canvasRef} 
                  width={340} 
                  height={220} 
                  className="rounded-full shadow-2xl cursor-pointer"
                  onClick={() => handleSendMessage('Hermes, report full e-bike telemetry and motor temperature.')}
                  title="Tap Hermes face to request telemetry audio briefing"
                />

                {/* Overlaid Speed readout */}
                <div className="absolute flex flex-col items-center pointer-events-none">
                  <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-md">
                    {speed}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                    MPH GROUND SPEED
                  </span>
                </div>
              </div>

              {/* Quick speed test accelerator simulator slider */}
              <div className="w-full mt-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 whitespace-nowrap">Throttle Sim:</span>
                <input 
                  type="range" 
                  min="0" 
                  max="35" 
                  step="0.5"
                  value={targetSpeed} 
                  onChange={(e) => setTargetSpeed(parseFloat(e.target.value))}
                  className="flex-1 accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <span className="text-xs font-mono font-bold text-emerald-400 w-12 text-right">{targetSpeed} mph</span>
              </div>

              {/* Assist Mode Bar */}
              <div className="w-full mt-3 flex items-center justify-between gap-1.5">
                {(['OFF', 'ECO', 'TOUR', 'SPORT', 'TURBO'] as AssistMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setAssistMode(mode);
                      if (mode === 'TURBO') setTargetSpeed(28);
                      if (mode === 'OFF') setTargetSpeed(0);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition border ${
                      assistMode === mode
                        ? mode === 'TURBO'
                          ? 'bg-red-500 text-slate-950 border-red-400 shadow-lg shadow-red-500/20'
                          : 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Bike controls (Lights, Signals, Horn) */}
              <div className="w-full mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setHeadlight(h => h === 'off' ? 'low' : h === 'low' ? 'high' : 'off')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
                    headlight !== 'off' 
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300' 
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Headlight: {headlight.toUpperCase()}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setLeftSignal(!leftSignal); setRightSignal(false); }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                      leftSignal ? 'bg-amber-500 text-slate-950 animate-pulse border-amber-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    ◄ Left
                  </button>

                  <button
                    onClick={() => { setRightSignal(!rightSignal); setLeftSignal(false); }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                      rightSignal ? 'bg-amber-500 text-slate-950 animate-pulse border-amber-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Right ►
                  </button>

                  <button
                    onClick={handleHorn}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black border transition ${
                      hornActive ? 'bg-red-500 text-white border-red-400' : 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    HORN
                  </button>
                </div>
              </div>
            </div>

            {/* Right Telemetry Matrix & Voice Prompt */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {/* Telemetry Stat Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Motor Output</span>
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xl font-black font-mono text-slate-100">{motorWatts} W</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Peak 750W Rated</div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Cadence</span>
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-xl font-black font-mono text-slate-100">{cadence} RPM</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Optimal: 70-85 RPM</div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Motor Temp</span>
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xl font-black font-mono text-slate-100">{motorTemp}°C</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Cool & Nominal</div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Trip Odometer</span>
                    <Navigation className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="text-xl font-black font-mono text-slate-100">{tripMiles} mi</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Time: {tripMinutes} mins</div>
                </div>
              </div>

              {/* Hermes Voice & Text Interactive Console */}
              <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col min-h-[220px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200">
                    <div className={`w-2 h-2 rounded-full ${hermesStatus === 'speaking' ? 'bg-purple-400 animate-ping' : hermesStatus === 'listening' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                    <span>Hermes Co-Pilot</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Provider: {aiProvider === 'cloud' ? 'Gemini 2.5' : 'Local Ollama'}
                  </span>
                </div>

                {/* Messages scroll */}
                <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 text-xs">
                  {messages.map((m) => (
                    <div 
                      key={m.id} 
                      className={`p-2 rounded-lg max-w-[90%] ${
                        m.sender === 'rider' 
                          ? 'ml-auto bg-emerald-500/20 text-emerald-100 border border-emerald-500/30' 
                          : 'mr-auto bg-slate-950 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-slate-400 mb-0.5">
                        {m.sender === 'rider' ? 'Rider' : 'Hermes Neural Face'}
                      </div>
                      <p className="leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="text-[11px] text-slate-400 italic animate-pulse">
                      Hermes is calculating response...
                    </div>
                  )}
                </div>

                {/* Quick Voice Command Pills */}
                <div className="flex items-center gap-1 overflow-x-auto py-1.5 border-t border-slate-800 text-[10px] no-scrollbar">
                  <button
                    onClick={() => handleSendMessage('What is my estimated battery range?')}
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 whitespace-nowrap"
                  >
                    🔋 Battery Range
                  </button>
                  <button
                    onClick={() => {
                      setAssistMode('TURBO');
                      setTargetSpeed(28);
                      handleSendMessage('Activate Turbo assist for hill climb.');
                    }}
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-red-300 hover:border-slate-700 whitespace-nowrap"
                  >
                    ⚡ Turbo Hill Climb
                  </button>
                  <button
                    onClick={() => handleSendMessage('Route me to the nearest bike lane.')}
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 hover:border-slate-700 whitespace-nowrap"
                  >
                    🗺️ Bike Trail Route
                  </button>
                </div>

                {/* Input area */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={handleToggleMic}
                    className={`p-2 rounded-lg border transition ${
                      isListening ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse' : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                    title={isListening ? 'Listening... click to stop' : 'Click to talk to Hermes'}
                  >
                    {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  </button>

                  <input
                    type="text"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask Hermes (e.g. check motor temp, route home)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isGenerating || !inputPrompt.trim()}
                    className="p-2 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Neural Face Studio Tab */}
        {activeTab === 'neural' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center">
              <h2 className="text-xl font-black text-slate-100">Hermes Neural Voice & Void Face</h2>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                The liquid void reacts in real-time to audio frequencies, bike velocity, throttle torque, and safety radar proximity warnings.
              </p>

              <div className="my-6">
                <canvas 
                  ref={canvasRef} 
                  width={320} 
                  height={320} 
                  className="rounded-full shadow-2xl border border-emerald-500/20 bg-slate-950/80 cursor-pointer"
                  onClick={() => speakText("Neural audio synthesis active. Drivetrain telemetry calibrated.")}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => speakText("Hermes co-pilot online. Ready for your ride.")}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Test Audio Synthesis</span>
                </button>
                <button
                  onClick={handleToggleMic}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-100 font-bold text-xs hover:bg-slate-700 transition flex items-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>{isListening ? 'Stop Listening' : 'Voice Input Test'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 360° Radar & GPS Navigation */}
        {activeTab === 'radar' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-100">Surround Radar & Blindspot Collision Watch</h3>
                  <p className="text-xs text-slate-400">Ultrasonic and millimetric radar sensing approaching vehicles from behind.</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                  SURROUND RADAR: ACTIVE
                </span>
              </div>

              <div className="relative h-64 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
                {/* Radar rings */}
                <div className="absolute w-56 h-56 rounded-full border border-slate-800/80" />
                <div className="absolute w-40 h-40 rounded-full border border-slate-800" />
                <div className="absolute w-24 h-24 rounded-full border border-slate-800/80" />
                
                {/* Center E-Bike icon */}
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold z-10">
                  <Bike className="w-4 h-4" />
                </div>

                {/* Simulated Approaching Car on Rear-Left */}
                <div className="absolute top-12 left-24 flex items-center gap-1 bg-red-500/20 border border-red-500/60 px-2 py-1 rounded-md text-red-300 text-[11px] animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>Car (18m, 32mph)</span>
                </div>

                {/* Simulated Cyclist ahead */}
                <div className="absolute bottom-12 right-28 flex items-center gap-1 bg-cyan-500/20 border border-cyan-500/60 px-2 py-1 rounded-md text-cyan-300 text-[11px]">
                  <Bike className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cyclist (45m ahead)</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Next Maneuver</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">Left on Skyline Trail</div>
                  <div className="text-[10px] text-emerald-400 font-mono">in 350 meters</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Elevation Grade</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">+4.2% Incline</div>
                  <div className="text-[10px] text-amber-400 font-mono">Recommend Tour/Sport</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">ETA to Destination</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">18 Minutes</div>
                  <div className="text-[10px] text-purple-400 font-mono">5.4 miles remaining</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Local Ollama Integration Tab */}
        {activeTab === 'ollama' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-slate-100">Local Ollama Model Configuration</h3>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  ollamaStatus === 'connected' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                  ollamaStatus === 'unreachable' ? 'bg-red-950 text-red-400 border-red-800' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}>
                  {ollamaStatus === 'connected' ? 'SERVER ONLINE' : ollamaStatus === 'unreachable' ? 'OFFLINE' : 'UNCHECKED'}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Connect Hermes to local LLMs running on your bike computer, Raspberry Pi, or local network. Run 100% private, offline inference without internet connectivity.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Active AI Engine</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAiProvider('cloud')}
                      className={`p-2.5 rounded-xl border font-bold text-center transition ${
                        aiProvider === 'cloud' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      Google Gemini 2.5 Flash
                    </button>
                    <button
                      onClick={() => setAiProvider('ollama')}
                      className={`p-2.5 rounded-xl border font-bold text-center transition ${
                        aiProvider === 'ollama' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      Local Ollama Daemon
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Ollama Base URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      placeholder="http://localhost:11434"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={handleTestOllama}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 transition"
                    >
                      Test Link
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Model Name</label>
                  <select
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="llama3.2">llama3.2 (Recommended for edge / fast latency)</option>
                    <option value="mistral">mistral:7b</option>
                    <option value="deepseek-r1:8b">deepseek-r1:8b</option>
                    <option value="phi4">phi4</option>
                    <option value="qwen2.5:3b">qwen2.5:3b</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Embedded Cloud Applet Mode */}
        {activeTab === 'cloud-app' && (
          <div className="h-full flex flex-col">
            <div className="shrink-0 mb-2 flex items-center justify-between bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-300 font-semibold">Original Hermes AI Studio Applet Embed (4ae8e24f)</span>
              <a
                href="https://ai.studio/apps/4ae8e24f-57b3-4002-a372-c7ab85b74da7?fullscreenApplet=true"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
              >
                <span>Open in full window</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 bg-black min-h-[460px]">
              <iframe
                src="https://ai.studio/apps/4ae8e24f-57b3-4002-a372-c7ab85b74da7?fullscreenApplet=true"
                className="w-full h-full border-0"
                title="Hermes E-Bike AI Face Cloud Applet"
                allow="camera; microphone; geolocation"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

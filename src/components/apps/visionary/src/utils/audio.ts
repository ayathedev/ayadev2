// Web Audio synthesizer for AYASEC security alarms and chimes
let audioCtx: AudioContext | null = null;
let sirenInterval: any = null;
let sirenOsc1: OscillatorNode | null = null;
let sirenOsc2: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSiren(durationMs: number = 5000): () => void {
  try {
    const ctx = getAudioContext();
    stopSiren(); // ensure any existing siren is halted

    sirenGain = ctx.createGain();
    sirenGain.gain.setValueAtTime(0.3, ctx.currentTime);
    sirenGain.connect(ctx.destination);

    sirenOsc1 = ctx.createOscillator();
    sirenOsc1.type = 'sawtooth';
    sirenOsc1.frequency.setValueAtTime(750, ctx.currentTime);
    sirenOsc1.connect(sirenGain);
    sirenOsc1.start();

    sirenOsc2 = ctx.createOscillator();
    sirenOsc2.type = 'sine';
    sirenOsc2.frequency.setValueAtTime(950, ctx.currentTime);
    sirenOsc2.connect(sirenGain);
    sirenOsc2.start();

    let high = false;
    sirenInterval = setInterval(() => {
      if (!sirenOsc1 || !sirenOsc2 || !ctx) return;
      const now = ctx.currentTime;
      if (high) {
        sirenOsc1.frequency.setTargetAtTime(700, now, 0.08);
        sirenOsc2.frequency.setTargetAtTime(900, now, 0.08);
      } else {
        sirenOsc1.frequency.setTargetAtTime(1200, now, 0.08);
        sirenOsc2.frequency.setTargetAtTime(1400, now, 0.08);
      }
      high = !high;
    }, 280);

    const autoStopTimer = setTimeout(() => {
      stopSiren();
    }, durationMs);

    return () => {
      clearTimeout(autoStopTimer);
      stopSiren();
    };
  } catch (err) {
    console.warn('Audio playback error (siren):', err);
    return () => {};
  }
}

export function stopSiren() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  try {
    if (sirenGain && audioCtx) {
      sirenGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    }
    setTimeout(() => {
      if (sirenOsc1) {
        try {
          sirenOsc1.stop();
          sirenOsc1.disconnect();
        } catch (_) {}
        sirenOsc1 = null;
      }
      if (sirenOsc2) {
        try {
          sirenOsc2.stop();
          sirenOsc2.disconnect();
        } catch (_) {}
        sirenOsc2 = null;
      }
      if (sirenGain) {
        try {
          sirenGain.disconnect();
        } catch (_) {}
        sirenGain = null;
      }
    }, 100);
  } catch (_) {}
}

export function playMotionChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // 2-tone melodic chime
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.12); // A5

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.52);
  } catch (err) {
    console.warn('Audio chime error:', err);
  }
}

export function playIntercomBeep(type: 'start' | 'end') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    if (type === 'start') {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(900, now + 0.06);
    } else {
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.setValueAtTime(450, now + 0.06);
    }

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  } catch (_) {}
}

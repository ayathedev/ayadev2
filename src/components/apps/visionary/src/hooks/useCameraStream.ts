import { useState, useEffect, useRef, useCallback } from 'react';
import { CameraSettings } from '../types';

interface UseCameraStreamProps {
  settings: CameraSettings;
  isActive: boolean;
  onMotionDetected?: (score: number, snapshot: string) => void;
  onFrameCapture?: (frameBase64: string, motionScore: number) => void;
}

export function useCameraStream({
  settings,
  isActive,
  onMotionDetected,
  onFrameCapture,
}: UseCameraStreamProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(settings.facingMode);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isMuted, setIsMuted] = useState(settings.audioMuted);
  const [currentMotionLevel, setCurrentMotionLevel] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState<number | undefined>(undefined);
  const [isCharging, setIsCharging] = useState<boolean | undefined>(undefined);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const wakeLockRef = useRef<any>(null);
  const motionCooldownRef = useRef<number>(0);
  const frameIntervalRef = useRef<any>(null);
  const isEncodingRef = useRef<boolean>(false);

  // Initialize WakeLock to keep screen from going to sleep while streaming
  useEffect(() => {
    if (!isActive) return;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch (_) {
        // Wake lock can fail if window is in background or permission denied
      }
    };

    requestWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isActive) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (wakeLockRef.current) {
        try {
          wakeLockRef.current.release();
        } catch (_) {}
      }
    };
  }, [isActive]);

  // Monitor Battery Telemetry
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);

          const onLevelChange = () => setBatteryLevel(Math.round(battery.level * 100));
          const onChargingChange = () => setIsCharging(battery.charging);

          battery.addEventListener('levelchange', onLevelChange);
          battery.addEventListener('chargingchange', onChargingChange);

          return () => {
            battery.removeEventListener('levelchange', onLevelChange);
            battery.removeEventListener('chargingchange', onChargingChange);
          };
        })
        .catch(() => {});
    }
  }, []);

  // Initialize Camera Media Stream
  const startCamera = useCallback(async () => {
    if (!isActive) return;

    try {
      setError(null);

      // Stop previous tracks if any
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      // Inspect torch capabilities
      const videoTrack = newStream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities: any = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        setHasTorch(Boolean(capabilities.torch));
      }
    } catch (err: any) {
      console.error('Failed to access camera:', err);
      let msg = 'Could not access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera & Microphone permissions denied. Please allow access in browser settings.';
      } else if (err.name === 'NotFoundError') {
        msg = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        msg = 'Camera is already in use by another application.';
      }
      setError(msg);
    }
  }, [isActive, facingMode]);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isActive, facingMode]);

  // Handle Audio Mute
  useEffect(() => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((t) => {
        t.enabled = !isMuted;
      });
    }
  }, [isMuted, stream]);

  // Torch control
  const setTorch = useCallback(
    async (enable: boolean) => {
      if (!stream) return;
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return;

      try {
        await (videoTrack as any).applyConstraints({
          advanced: [{ torch: enable }],
        });
        setTorchOn(enable);
      } catch (err) {
        console.warn('Torch control not supported on this track:', err);
      }
    },
    [stream]
  );

  const toggleTorch = useCallback(() => {
    setTorch(!torchOn);
  }, [torchOn, setTorch]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const onMotionDetectedRef = useRef(onMotionDetected);
  onMotionDetectedRef.current = onMotionDetected;

  const onFrameCaptureRef = useRef(onFrameCapture);
  onFrameCaptureRef.current = onFrameCapture;

  // Motion Detection & Frame Capture Loop with concurrency protection
  useEffect(() => {
    if (!isActive || !stream) {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
      return;
    }

    if (!motionCanvasRef.current) {
      motionCanvasRef.current = document.createElement('canvas');
    }
    const motionCanvas = motionCanvasRef.current;
    const motionCtx = motionCanvas.getContext('2d', { willReadFrequently: true });
    if (!motionCtx) return;

    // Compact dimensions for fast pixel difference calculations
    const motionW = 64;
    const motionH = 48;
    motionCanvas.width = motionW;
    motionCanvas.height = motionH;

    if (!captureCanvasRef.current) {
      captureCanvasRef.current = document.createElement('canvas');
    }
    const captureCanvas = captureCanvasRef.current;
    const captureCtx = captureCanvas.getContext('2d');
    captureCanvas.width = 640;
    captureCanvas.height = 360;

    const fps = Math.min(Math.max(settings.streamFps || 12, 5), 24);
    const intervalMs = Math.round(1000 / fps);

    frameIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      // Skip tick if previous frame encode is still processing to prevent UI lockup
      if (isEncodingRef.current) return;
      isEncodingRef.current = true;

      try {
        // 1. Motion detection analysis
        let motionScore = 0;
        if (settings.motionDetection) {
          motionCtx.drawImage(video, 0, 0, motionW, motionH);
          const imgData = motionCtx.getImageData(0, 0, motionW, motionH);
          const currentData = imgData.data;

          if (prevFrameDataRef.current) {
            let diffPixels = 0;
            const totalPixels = motionW * motionH;
            const prev = prevFrameDataRef.current;

            for (let i = 0; i < currentData.length; i += 4) {
              const diff =
                Math.abs(currentData[i] - prev[i]) +
                Math.abs(currentData[i + 1] - prev[i + 1]) +
                Math.abs(currentData[i + 2] - prev[i + 2]);
              if (diff > 60) {
                diffPixels++;
              }
            }

            const ratio = (diffPixels / totalPixels) * 100;
            motionScore = Math.min(Math.round(ratio * 3), 100);
            setCurrentMotionLevel(motionScore);

            const threshold = Math.max(3, 20 - (settings.motionSensitivity / 100) * 16);
            const now = Date.now();

            if (motionScore > threshold && now - motionCooldownRef.current > 3500) {
              motionCooldownRef.current = now;

              if (captureCtx) {
                captureCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
                const snapshotData = captureCanvas.toDataURL('image/jpeg', 0.65);
                if (onMotionDetectedRef.current) {
                  onMotionDetectedRef.current(motionScore, snapshotData);
                }
              }
            }
          }

          prevFrameDataRef.current = new Uint8ClampedArray(currentData);
        }

        // 2. Broadcast frame for WebSocket relay
        if (captureCtx && onFrameCaptureRef.current) {
          captureCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
          const frameQuality = settings.streamQuality || 0.55;
          const frameJpeg = captureCanvas.toDataURL('image/jpeg', frameQuality);
          onFrameCaptureRef.current(frameJpeg, motionScore);
        }
      } catch (err) {
        console.warn('Frame processing tick error:', err);
      } finally {
        isEncodingRef.current = false;
      }
    }, intervalMs);

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, [
    isActive,
    stream,
    settings.motionDetection,
    settings.motionSensitivity,
    settings.streamFps,
    settings.streamQuality,
  ]);

  return {
    stream,
    error,
    videoRef,
    facingMode,
    switchCamera,
    hasTorch,
    torchOn,
    setTorch,
    toggleTorch,
    isMuted,
    toggleMute,
    currentMotionLevel,
    batteryLevel,
    isCharging,
    retry: startCamera,
  };
}

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  DeviceInfo,
  DeviceRole,
  MotionAlertEvent,
  ConnectionState,
  ConnectionQuality,
  TransportMode,
  SpaceConfig,
  SystemSecurityMode,
  RecordedClip,
  AuditLogEntry,
} from '../types';

interface UseSecuritySocketProps {
  config: SpaceConfig | null;
  onRemoteCommand?: (command: string, value?: any, fromDeviceId?: string) => void;
  onIntercomAudio?: (audioData: string, fromDeviceId?: string) => void;
  onMotionAlert?: (alert: MotionAlertEvent) => void;
  localStream?: MediaStream | null;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
  { urls: 'stun:stun.services.mozilla.com' },
];

export function useSecuritySocket({
  config,
  onRemoteCommand,
  onIntercomAudio,
  onMotionAlert,
  localStream,
}: UseSecuritySocketProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [motionEvents, setMotionEvents] = useState<MotionAlertEvent[]>([]);
  const [securityMode, setSecurityMode] = useState<SystemSecurityMode>('disarmed');
  const [recordedClips, setRecordedClips] = useState<RecordedClip[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [remoteFrames, setRemoteFrames] = useState<
    Record<string, { frame: string; timestamp: number; motionScore: number }>
  >({});
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const reconnectTimeoutRef = useRef<any>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const isExplicitCloseRef = useRef<boolean>(false);
  
  const configRef = useRef<SpaceConfig | null>(config);
  configRef.current = config;

  const connectionStateRef = useRef<ConnectionState>(connectionState);
  connectionStateRef.current = connectionState;

  const localStreamRef = useRef<MediaStream | null>(localStream);
  localStreamRef.current = localStream;

  const onRemoteCommandRef = useRef(onRemoteCommand);
  onRemoteCommandRef.current = onRemoteCommand;

  const onIntercomAudioRef = useRef(onIntercomAudio);
  onIntercomAudioRef.current = onIntercomAudio;

  const onMotionAlertRef = useRef(onMotionAlert);
  onMotionAlertRef.current = onMotionAlert;

  const connectRef = useRef<(() => void) | null>(null);

  // Stable persistent device ID across reconnects
  const getPersistentDeviceId = useCallback((role: DeviceRole, spaceId: string) => {
    const storageKey = `ayasec_devid_${spaceId}_${role}`;
    let saved = '';
    try {
      saved = sessionStorage.getItem(storageKey) || '';
    } catch (_) {}

    if (!saved) {
      saved = `${role}_${Math.random().toString(36).slice(2, 9)}`;
      try {
        sessionStorage.setItem(storageKey, saved);
      } catch (_) {}
    }
    return saved;
  }, []);

  // Clean WebRTC connections
  const closeAllPeerConnections = useCallback(() => {
    peerConnectionsRef.current.forEach((pc) => {
      try {
        pc.close();
      } catch (_) {}
    });
    peerConnectionsRef.current.clear();
    pendingCandidatesRef.current.clear();
    setRemoteStreams({});
  }, []);

  // Flush queued ICE candidates after setRemoteDescription
  const flushPendingCandidates = useCallback(async (targetDeviceId: string, pc: RTCPeerConnection) => {
    const queue = pendingCandidatesRef.current.get(targetDeviceId);
    if (!queue || queue.length === 0) return;

    while (queue.length > 0) {
      const candidateInit = queue.shift();
      if (candidateInit) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
        } catch (err) {
          console.warn('Error applying queued ICE candidate:', err);
        }
      }
    }
  }, []);

  const getOrCreatePeerConnection = useCallback((targetDeviceId: string, isInitiator: boolean) => {
    let pc = peerConnectionsRef.current.get(targetDeviceId);
    if (pc && pc.signalingState !== 'closed') {
      return pc;
    }

    pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 4,
    });

    peerConnectionsRef.current.set(targetDeviceId, pc);

    // Attach local stream tracks if available
    const activeLocalStream = localStreamRef.current;
    if (activeLocalStream) {
      activeLocalStream.getTracks().forEach((track) => {
        try {
          pc!.addTrack(track, activeLocalStream);
        } catch (_) {}
      });
    }

    // Handle remote media track arrival
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStreams((prev) => ({
          ...prev,
          [targetDeviceId]: event.streams[0],
        }));
      }
    };

    // Emit local ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'webrtc_ice_candidate',
            targetDeviceId,
            candidate: event.candidate,
          })
        );
      }
    };

    // Resilient connection state handling
    pc.oniceconnectionstatechange = () => {
      if (pc?.iceConnectionState === 'failed' || pc?.iceConnectionState === 'disconnected') {
        if (isInitiator && typeof (pc as any).restartIce === 'function') {
          try {
            (pc as any).restartIce();
          } catch (_) {}
        }
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc?.connectionState === 'failed' || pc?.connectionState === 'closed') {
        peerConnectionsRef.current.delete(targetDeviceId);
        pendingCandidatesRef.current.delete(targetDeviceId);
      }
    };

    return pc;
  }, []);

  const initiateWebRTC = useCallback(
    async (targetDeviceId: string) => {
      try {
        const pc = getOrCreatePeerConnection(targetDeviceId, true);
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'webrtc_offer',
              targetDeviceId,
              sdp: offer,
            })
          );
        }
      } catch (err) {
        console.warn('WebRTC offer initiation fallback to socket frame relay:', err);
      }
    },
    [getOrCreatePeerConnection]
  );

  // Connect and join space
  const connect = useCallback(() => {
    const currentCfg = configRef.current;
    if (!currentCfg) return;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.onclose = null;
        wsRef.current.close();
      } catch (_) {}
    }

    isExplicitCloseRef.current = false;
    setConnectionState('connecting');
    connectionStateRef.current = 'connecting';
    setErrorMessage(null);

    const customWs = import.meta.env.VITE_WS_URL as string | undefined;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = customWs && customWs.trim() !== '' ? customWs.trim() : `${protocol}//${host}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionState('connecting');
      connectionStateRef.current = 'connecting';
      reconnectAttemptsRef.current = 0;

      const stableDeviceId = getPersistentDeviceId(currentCfg.role, currentCfg.spaceId);

      // Join space with persistent device identity
      ws.send(
        JSON.stringify({
          type: 'join_space',
          spaceId: currentCfg.spaceId,
          spaceName: currentCfg.name,
          accessCode: currentCfg.accessCode,
          deviceId: stableDeviceId,
          deviceName: currentCfg.deviceName,
          role: currentCfg.role,
        })
      );
    };

    ws.onmessage = async (evt) => {
      try {
        const msg = JSON.parse(evt.data);

        switch (msg.type) {
          case 'pong': {
            if (msg.clientTime) {
              const rtt = Math.max(1, Date.now() - msg.clientTime);
              setLatencyMs(rtt);
            }
            break;
          }

          case 'joined_success': {
            setConnectionState('connected');
            connectionStateRef.current = 'connected';
            setErrorMessage(null);
            reconnectAttemptsRef.current = 0;
            setDevices(msg.devices || []);
            if (msg.motionEvents) {
              setMotionEvents(msg.motionEvents);
            }
            if (msg.securityMode) {
              setSecurityMode(msg.securityMode);
            }
            if (msg.recordedClips) {
              setRecordedClips(msg.recordedClips);
            }
            if (msg.auditLogs) {
              setAuditLogs(msg.auditLogs);
            }

            // If viewer, initiate WebRTC connections to active cameras
            if (currentCfg.role === 'viewer' && msg.devices) {
              msg.devices.forEach((dev: DeviceInfo) => {
                if (dev.role === 'camera') {
                  initiateWebRTC(dev.deviceId);
                }
              });
            }
            break;
          }

          case 'security_mode_changed': {
            if (msg.securityMode) {
              setSecurityMode(msg.securityMode);
            }
            break;
          }

          case 'new_clip_recorded': {
            if (msg.clip) {
              setRecordedClips((prev) => [msg.clip, ...prev.slice(0, 49)]);
            }
            break;
          }

          case 'auth_failed': {
            setConnectionState('auth_error');
            connectionStateRef.current = 'auth_error';
            setErrorMessage(msg.message || 'Incorrect Access Code for this Space');
            break;
          }

          case 'device_joined': {
            setDevices(msg.devices || []);
            if (currentCfg.role === 'viewer' && msg.device?.role === 'camera') {
              initiateWebRTC(msg.device.deviceId);
            }
            break;
          }

          case 'device_left': {
            setDevices(msg.devices || []);
            const leavingId = msg.deviceId;
            if (peerConnectionsRef.current.has(leavingId)) {
              peerConnectionsRef.current.get(leavingId)?.close();
              peerConnectionsRef.current.delete(leavingId);
              pendingCandidatesRef.current.delete(leavingId);
            }
            setRemoteStreams((prev) => {
              const updated = { ...prev };
              delete updated[leavingId];
              return updated;
            });
            setRemoteFrames((prev) => {
              const updated = { ...prev };
              delete updated[leavingId];
              return updated;
            });
            break;
          }

          case 'device_updated': {
            setDevices(msg.devices || []);
            break;
          }

          case 'camera_frame': {
            setRemoteFrames((prev) => ({
              ...prev,
              [msg.cameraDeviceId]: {
                frame: msg.frame,
                timestamp: msg.timestamp,
                motionScore: msg.motionScore,
              },
            }));
            break;
          }

          case 'motion_alert': {
            setMotionEvents((prev) => [msg.alert, ...prev.slice(0, 49)]);
            if (onMotionAlertRef.current) {
              onMotionAlertRef.current(msg.alert);
            }
            break;
          }

          case 'webrtc_offer': {
            const pc = getOrCreatePeerConnection(msg.senderDeviceId, false);
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            await flushPendingCandidates(msg.senderDeviceId, pc);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: 'webrtc_answer',
                  targetDeviceId: msg.senderDeviceId,
                  sdp: answer,
                })
              );
            }
            break;
          }

          case 'webrtc_answer': {
            const pc = peerConnectionsRef.current.get(msg.senderDeviceId);
            if (pc && pc.signalingState !== 'closed') {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
              await flushPendingCandidates(msg.senderDeviceId, pc);
            }
            break;
          }

          case 'webrtc_ice_candidate': {
            const pc = peerConnectionsRef.current.get(msg.senderDeviceId);
            if (pc && pc.remoteDescription && pc.signalingState !== 'closed' && msg.candidate) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
              } catch (_) {}
            } else if (msg.candidate) {
              const queue = pendingCandidatesRef.current.get(msg.senderDeviceId) || [];
              queue.push(msg.candidate);
              pendingCandidatesRef.current.set(msg.senderDeviceId, queue);
            }
            break;
          }

          case 'remote_command': {
            if (onRemoteCommandRef.current) {
              onRemoteCommandRef.current(msg.command, msg.value, msg.fromDeviceId);
            }
            break;
          }

          case 'intercom_audio': {
            if (onIntercomAudioRef.current) {
              onIntercomAudioRef.current(msg.audioData, msg.fromDeviceId);
            }
            break;
          }

          case 'error': {
            setErrorMessage(msg.message || 'Server error occurred');
            break;
          }
        }
      } catch (err) {
        console.error('Socket message parse error:', err);
      }
    };

    ws.onclose = () => {
      setConnectionState('disconnected');
      connectionStateRef.current = 'disconnected';
      closeAllPeerConnections();

      if (!isExplicitCloseRef.current && configRef.current) {
        reconnectAttemptsRef.current += 1;
        const backoffMs = Math.min(
          1000 * Math.pow(1.5, Math.min(reconnectAttemptsRef.current, 5)) +
            Math.floor(Math.random() * 400),
          5000
        );
        reconnectTimeoutRef.current = setTimeout(() => {
          connectRef.current?.();
        }, backoffMs);
      }
    };

    ws.onerror = () => {
      setConnectionState('disconnected');
      connectionStateRef.current = 'disconnected';
    };
  }, [
    getPersistentDeviceId,
    getOrCreatePeerConnection,
    initiateWebRTC,
    flushPendingCandidates,
    closeAllPeerConnections,
  ]);

  connectRef.current = connect;

  // Periodic ping for continuous RTT latency monitoring and heartbeat keep-alive
  useEffect(() => {
    if (connectionState !== 'connected') return;

    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'ping',
            clientTime: Date.now(),
          })
        );
      }
    }, 3500);

    return () => clearInterval(pingInterval);
  }, [connectionState]);

  // Handle network recovery and tab visibility focus
  useEffect(() => {
    const handleNetworkOnline = () => {
      if (configRef.current && (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
        connect();
      }
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        configRef.current &&
        (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
      ) {
        connect();
      }
    };

    window.addEventListener('online', handleNetworkOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleNetworkOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connect]);

  // Connect on space config change
  useEffect(() => {
    if (config) {
      connect();
    } else {
      isExplicitCloseRef.current = true;
      setConnectionState('disconnected');
      if (wsRef.current) {
        wsRef.current.close();
      }
      closeAllPeerConnections();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      closeAllPeerConnections();
    };
  }, [config?.spaceId, config?.accessCode, config?.role, connect, closeAllPeerConnections]);

  // Dynamic track update when local stream tracks change
  useEffect(() => {
    if (localStream) {
      peerConnectionsRef.current.forEach((pc) => {
        const senders = pc.getSenders();
        localStream.getTracks().forEach((track) => {
          const sender = senders.find((s) => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track).catch(() => {});
          } else {
            try {
              pc.addTrack(track, localStream);
            } catch (_) {}
          }
        });
      });
    }
  }, [localStream]);

  // Connection Quality classification
  const connectionQuality: ConnectionQuality = useMemo(() => {
    if (connectionState !== 'connected') return 'reconnecting';
    if (latencyMs === null) return 'good';
    if (latencyMs < 75) return 'excellent';
    if (latencyMs < 180) return 'good';
    if (latencyMs < 450) return 'fair';
    return 'poor';
  }, [connectionState, latencyMs]);

  // Stream Transport Mode (P2P WebRTC vs Socket Frame Relay)
  const transportMode: TransportMode = useMemo(() => {
    if (connectionState !== 'connected') return 'connecting';
    const streams = Object.values(remoteStreams) as MediaStream[];
    const hasLiveWebRtc = streams.some(
      (s) => s.getVideoTracks().length > 0 && s.getVideoTracks()[0]?.readyState === 'live'
    );
    if (hasLiveWebRtc) return 'webrtc';
    if (Object.keys(remoteFrames).length > 0) return 'relay';
    return 'connecting';
  }, [connectionState, remoteStreams, remoteFrames]);

  // Action methods
  const sendFrame = useCallback((frameBase64: string, motionScore: number = 0) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Congestion control: skip sending frame if socket buffer has > 64KB backlog
      if (wsRef.current.bufferedAmount > 64 * 1024) {
        return;
      }
      wsRef.current.send(
        JSON.stringify({
          type: 'camera_frame',
          frame: frameBase64,
          timestamp: Date.now(),
          motionScore,
        })
      );
    }
  }, []);

  const sendMotionAlert = useCallback((motionScore: number, snapshotBase64?: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'motion_detected',
          motionScore,
          snapshot: snapshotBase64,
        })
      );
    }
  }, []);

  const sendRemoteCommand = useCallback((targetDeviceId: string, command: string, value?: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'remote_command',
          targetDeviceId,
          command,
          value,
        })
      );
    }
  }, []);

  const sendIntercomAudio = useCallback((targetDeviceId: string, audioData: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'intercom_audio',
          targetDeviceId,
          audioData,
        })
      );
    }
  }, []);

  const updateDeviceStatus = useCallback((updates: Partial<DeviceInfo>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'update_device_status',
          updates,
        })
      );
    }
  }, []);

  // Force stream renegotiation / refresh
  const refreshStream = useCallback(
    (targetDeviceId?: string) => {
      if (configRef.current?.role === 'viewer') {
        if (targetDeviceId) {
          const pc = peerConnectionsRef.current.get(targetDeviceId);
          if (pc) {
            try {
              pc.close();
            } catch (_) {}
            peerConnectionsRef.current.delete(targetDeviceId);
          }
          initiateWebRTC(targetDeviceId);
        } else {
          devices.forEach((d) => {
            if (d.role === 'camera') {
              const pc = peerConnectionsRef.current.get(d.deviceId);
              if (pc) {
                try {
                  pc.close();
                } catch (_) {}
                peerConnectionsRef.current.delete(d.deviceId);
              }
              initiateWebRTC(d.deviceId);
            }
          });
        }
      }
    },
    [devices, initiateWebRTC]
  );

  const changeSecurityMode = useCallback((mode: SystemSecurityMode) => {
    setSecurityMode(mode);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'set_security_mode',
          securityMode: mode,
        })
      );
    }
  }, []);

  const saveRecordedClip = useCallback(
    (clipData: {
      cameraDeviceId: string;
      cameraName: string;
      durationSeconds: number;
      blobUrl: string;
      thumbnailUrl?: string;
      motionScore?: number;
      aiCategory?: string;
    }) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'save_recorded_clip',
            ...clipData,
          })
        );
      }
    },
    []
  );

  const togglePrivacyShutter = useCallback((enabled: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'privacy_shutter_toggle',
          enabled,
        })
      );
    }
  }, []);

  const refreshAuditLogs = useCallback(async () => {
    if (!configRef.current?.spaceId) return;
    try {
      const res = await fetch(`/api/spaces/${encodeURIComponent(configRef.current.spaceId)}/audit-logs`);
      const data = await res.json();
      if (Array.isArray(data.logs)) {
        setAuditLogs(data.logs);
      }
    } catch (_) {}
  }, []);

  const refreshRecordings = useCallback(async () => {
    if (!configRef.current?.spaceId) return;
    try {
      const res = await fetch(`/api/spaces/${encodeURIComponent(configRef.current.spaceId)}/recordings`);
      const data = await res.json();
      if (Array.isArray(data.clips)) {
        setRecordedClips(data.clips);
      }
    } catch (_) {}
  }, []);

  const leaveSpace = useCallback(() => {
    isExplicitCloseRef.current = true;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'leave_space' }));
      wsRef.current.close();
    }
    closeAllPeerConnections();
    setConnectionState('disconnected');
    setDevices([]);
    setMotionEvents([]);
    setLatencyMs(null);
  }, [closeAllPeerConnections]);

  return {
    connectionState,
    connectionQuality,
    transportMode,
    latencyMs,
    errorMessage,
    devices,
    motionEvents,
    securityMode,
    recordedClips,
    auditLogs,
    remoteFrames,
    remoteStreams,
    sendFrame,
    sendMotionAlert,
    sendRemoteCommand,
    sendIntercomAudio,
    updateDeviceStatus,
    changeSecurityMode,
    saveRecordedClip,
    togglePrivacyShutter,
    refreshAuditLogs,
    refreshRecordings,
    refreshStream,
    leaveSpace,
    reconnect: connect,
  };
}

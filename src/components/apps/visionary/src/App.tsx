import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SpaceSetupModal } from './components/SpaceSetupModal';
import { CameraView } from './components/CameraView';
import { ViewerDashboard } from './components/ViewerDashboard';
import { QRCodeModal } from './components/QRCodeModal';
import { SpaceConfig, DeviceRole, MotionAlertEvent } from './types';
import { useSecuritySocket } from './hooks/useSecuritySocket';
import { playMotionChime } from './utils/audio';

const STORAGE_KEY = 'ayasec_space_config_v1';

export default function App() {
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfig | null>(() => {
    // Check URL parameters first for instant QR code pairing
    const params = new URLSearchParams(window.location.search);
    const space = params.get('space');
    const code = params.get('code');
    const role = params.get('role') as DeviceRole | null;
    const name = params.get('name');
    const isViewOnly = params.get('viewonly') === 'true';

    if (space && code) {
      return {
        spaceId: space,
        name: name || space,
        accessCode: code,
        role: role === 'camera' ? 'camera' : 'viewer',
        deviceName: role === 'camera' ? 'Mobile Camera' : isViewOnly ? 'Guest Viewer' : 'Web Viewer',
        isViewOnly,
      };
    }

    // Otherwise check localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}

    return null;
  });

  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(!spaceConfig);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [targetPairRole, setTargetPairRole] = useState<DeviceRole>('camera');
  const [remoteCommandSignal, setRemoteCommandSignal] = useState<{
    command: string;
    value?: any;
    fromDeviceId?: string;
    timestamp: number;
  } | null>(null);
  const [intercomAudioSignal, setIntercomAudioSignal] = useState<{
    audioData: string;
    fromDeviceId?: string;
    timestamp: number;
  } | null>(null);

  // Callback when remote command arrives
  const handleRemoteCommand = useCallback((command: string, value?: any, fromDeviceId?: string) => {
    setRemoteCommandSignal({ command, value, fromDeviceId, timestamp: Date.now() });
  }, []);

  // Callback when intercom audio arrives
  const handleIntercomAudio = useCallback((audioData: string, fromDeviceId?: string) => {
    setIntercomAudioSignal({ audioData, fromDeviceId, timestamp: Date.now() });
  }, []);

  // Callback on motion alert
  const handleMotionAlert = useCallback((alert: MotionAlertEvent) => {
    if (spaceConfig?.role === 'viewer') {
      playMotionChime();
    }
  }, [spaceConfig?.role]);

  // Hook into WebSocket & signaling
  const {
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
    reconnect,
  } = useSecuritySocket({
    config: spaceConfig,
    onRemoteCommand: handleRemoteCommand,
    onIntercomAudio: handleIntercomAudio,
    onMotionAlert: handleMotionAlert,
  });

  // Re-open modal if auth failed
  useEffect(() => {
    if (connectionState === 'auth_error') {
      setIsSpaceModalOpen(true);
    }
  }, [connectionState]);

  // Save config to localStorage
  const handleJoinSpace = (config: SpaceConfig) => {
    setSpaceConfig(config);
    setIsSpaceModalOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (_) {}

    // Clean URL params after successful joining so refresh doesn't force query params
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleSwitchRole = (newRole: DeviceRole) => {
    if (!spaceConfig) return;
    const updated: SpaceConfig = {
      ...spaceConfig,
      role: newRole,
      deviceName:
        newRole === 'camera'
          ? spaceConfig.deviceName.replace('Viewer', 'Camera')
          : spaceConfig.deviceName.replace('Camera', 'Viewer'),
    };
    setSpaceConfig(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
  };

  const handleSwitchSpace = (newSpaceId: string, newSpaceName: string, accessCode?: string) => {
    const updated: SpaceConfig = {
      spaceId: newSpaceId,
      name: newSpaceName,
      accessCode: accessCode || spaceConfig?.accessCode || '',
      role: spaceConfig?.role || 'viewer',
      deviceName: spaceConfig?.deviceName || 'Monitoring Console',
      motionSensitivity: spaceConfig?.motionSensitivity ?? 50,
    };
    handleJoinSpace(updated);
  };

  const handleUpdateMotionSensitivity = useCallback(
    (sensitivity: number) => {
      setSpaceConfig((prev) => {
        if (!prev) return null;
        const updated: SpaceConfig = {
          ...prev,
          motionSensitivity: sensitivity,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });

      // Broadcast command to all camera devices in this space
      devices.forEach((dev) => {
        if (dev.role === 'camera') {
          sendRemoteCommand(dev.deviceId, 'set_motion_sensitivity', sensitivity);
        }
      });
    },
    [devices, sendRemoteCommand]
  );

  const handleLeaveSpace = () => {
    leaveSpace();
    setSpaceConfig(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    setIsSpaceModalOpen(true);
  };

  const handleOpenPairQR = (role?: DeviceRole) => {
    // Default pair role is the opposite of current device's role
    const defaultPairRole = role || (spaceConfig?.role === 'camera' ? 'viewer' : 'camera');
    setTargetPairRole(defaultPairRole);
    setIsQRCodeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Top Header */}
      <Header
        spaceName={spaceConfig?.name}
        spaceId={spaceConfig?.spaceId}
        accessCode={spaceConfig?.accessCode}
        currentRole={spaceConfig?.role}
        connectionState={connectionState}
        connectionQuality={connectionQuality}
        transportMode={transportMode}
        latencyMs={latencyMs}
        devices={devices}
        onSwitchRole={handleSwitchRole}
        onOpenPairQR={() => handleOpenPairQR()}
        onOpenSpaceModal={() => setIsSpaceModalOpen(true)}
        onLeaveSpace={handleLeaveSpace}
        onReconnect={reconnect}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {spaceConfig ? (
          spaceConfig.role === 'camera' ? (
            <CameraView
              spaceConfig={spaceConfig}
              devices={devices}
              sendFrame={sendFrame}
              sendMotionAlert={sendMotionAlert}
              updateDeviceStatus={updateDeviceStatus}
              onOpenPairQR={() => handleOpenPairQR('viewer')}
              remoteCommandSignal={remoteCommandSignal}
              intercomAudioSignal={intercomAudioSignal}
              onSaveRecordedClip={saveRecordedClip}
              togglePrivacyShutter={togglePrivacyShutter}
            />
          ) : (
            <ViewerDashboard
              spaceConfig={spaceConfig}
              devices={devices}
              remoteFrames={remoteFrames}
              remoteStreams={remoteStreams}
              motionEvents={motionEvents}
              latencyMs={latencyMs}
              transportMode={transportMode}
              connectionQuality={connectionQuality}
              securityMode={securityMode}
              recordedClips={recordedClips}
              auditLogs={auditLogs}
              onChangeSecurityMode={changeSecurityMode}
              onSaveRecordedClip={saveRecordedClip}
              onTogglePrivacyShutter={togglePrivacyShutter}
              onRefreshAuditLogs={refreshAuditLogs}
              onRefreshRecordings={refreshRecordings}
              sendRemoteCommand={sendRemoteCommand}
              sendIntercomAudio={sendIntercomAudio}
              onRefreshStream={refreshStream}
              onOpenPairQR={() => handleOpenPairQR('camera')}
              onSwitchToCamera={() => handleSwitchRole('camera')}
              onSwitchSpace={handleSwitchSpace}
              onOpenSpaceModal={() => setIsSpaceModalOpen(true)}
              onUpdateMotionSensitivity={handleUpdateMotionSensitivity}
            />
          )
        ) : (
          /* Clean backdrop while modal is waiting */
          <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-500">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center mx-auto">
                <span className="w-2 h-2 rounded-full bg-slate-700" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">AYASEC SURVEILLANCE</h2>
              <p className="text-xs text-slate-500">Awaiting space configuration</p>
            </div>
          </div>
        )}
      </main>

      {/* Space Setup / Join Modal */}
      <SpaceSetupModal
        isOpen={isSpaceModalOpen}
        initialConfig={spaceConfig}
        onJoinSpace={handleJoinSpace}
        onCancel={spaceConfig ? () => setIsSpaceModalOpen(false) : undefined}
        errorMessage={errorMessage}
      />

      {/* QR Code Pair Modal */}
      {spaceConfig && (
        <QRCodeModal
          isOpen={isQRCodeModalOpen}
          onClose={() => setIsQRCodeModalOpen(false)}
          spaceId={spaceConfig.spaceId}
          spaceName={spaceConfig.name}
          accessCode={spaceConfig.accessCode}
          targetRole={targetPairRole}
        />
      )}
    </div>
  );
}

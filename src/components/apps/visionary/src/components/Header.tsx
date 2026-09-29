import React, { useState } from 'react';
import {
  Video,
  Eye,
  QrCode,
  Users,
  LogOut,
  EyeOff,
  Lock,
  Activity,
  Wifi,
  RefreshCw,
} from 'lucide-react';
import { DeviceRole, DeviceInfo, ConnectionState, ConnectionQuality, TransportMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import logoUrl from '../assets/images/aya_sec_logo.png';

interface HeaderProps {
  spaceName?: string;
  spaceId?: string;
  accessCode?: string;
  currentRole?: DeviceRole;
  connectionState?: ConnectionState;
  connectionQuality?: ConnectionQuality;
  transportMode?: TransportMode;
  latencyMs?: number | null;
  devices?: DeviceInfo[];
  onSwitchRole?: (newRole: DeviceRole) => void;
  onOpenPairQR?: () => void;
  onOpenSpaceModal?: () => void;
  onLeaveSpace?: () => void;
  onReconnect?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  spaceName,
  spaceId,
  accessCode,
  currentRole = 'viewer',
  connectionState = 'connected',
  connectionQuality = 'good',
  transportMode = 'connecting',
  latencyMs,
  devices = [],
  onSwitchRole,
  onOpenPairQR,
  onOpenSpaceModal,
  onLeaveSpace,
  onReconnect,
}) => {
  const [showCode, setShowCode] = useState(false);
  const [showDevicesList, setShowDevicesList] = useState(false);

  const camerasCount = devices.filter((d) => d.role === 'camera').length;
  const viewersCount = devices.filter((d) => d.role === 'viewer').length;
  const hasSpace = Boolean(spaceName || spaceId);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 px-3 sm:px-6 py-2 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand: Square Logo + Title + Subtitle */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={logoUrl}
            alt="Aya Sec Security Cam"
            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-xs shrink-0"
          />
          <div className="flex flex-col justify-center min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight whitespace-nowrap">
              Aya Sec Security Cam
            </h1>
            <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5 whitespace-nowrap">
              by Aya The Being
            </p>
          </div>

          {hasSpace && (
            <>
              <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

              {/* Current Space & Code Chip */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                <button
                  onClick={onOpenSpaceModal}
                  className="font-semibold text-slate-900 max-w-[120px] sm:max-w-[180px] truncate hover:text-slate-600 transition text-left"
                  title="Click to change or switch space"
                >
                  {spaceName || spaceId}
                </button>
                {accessCode && (
                  <>
                    <div className="h-3 w-px bg-slate-300" />
                    <button
                      onClick={() => setShowCode(!showCode)}
                      className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 transition font-mono"
                      title="Toggle passcode visibility"
                    >
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>{showCode ? accessCode : '••••'}</span>
                      {showCode ? (
                        <EyeOff className="w-2.5 h-2.5 text-slate-400" />
                      ) : (
                        <Eye className="w-2.5 h-2.5 text-slate-400" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Station Controls */}
        <div className="flex items-center gap-2">
          {hasSpace ? (
            <>
              {/* Connection Status Badge & Latency */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700"
                title={`Status: ${connectionState} • Transport: ${
                  transportMode === 'webrtc'
                    ? 'Direct P2P WebRTC'
                    : transportMode === 'relay'
                    ? 'Low-Latency Relay'
                    : 'Connecting'
                }${latencyMs !== null && latencyMs !== undefined ? ` • Latency: ${latencyMs}ms` : ''}`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    connectionState === 'connected'
                      ? connectionQuality === 'excellent'
                        ? 'bg-emerald-500'
                        : connectionQuality === 'good'
                        ? 'bg-emerald-600'
                        : connectionQuality === 'fair'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                      : connectionState === 'connecting'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-rose-600'
                  }`}
                />
                <span className="capitalize hidden md:inline">
                  {connectionState === 'connected' ? 'Online' : connectionState}
                </span>
                {connectionState === 'connected' && latencyMs !== null && latencyMs !== undefined && (
                  <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                    {latencyMs}ms
                  </span>
                )}
                {connectionState === 'disconnected' && onReconnect && (
                  <button
                    onClick={onReconnect}
                    className="ml-1 p-0.5 text-slate-700 hover:text-slate-900 transition"
                    title="Reconnect now"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-600" />
                  </button>
                )}
              </div>

              {/* Connected Stations counter with popover */}
              <div className="relative">
                <button
                  onClick={() => setShowDevicesList(!showDevicesList)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition"
                  title="Connected endpoints"
                >
                  <Users className="w-3.5 h-3.5 text-slate-600" />
                  <span>{devices.length}</span>
                  <span className="hidden lg:inline text-slate-500 text-[11px]">
                    ({camerasCount} cam, {viewersCount} view)
                  </span>
                </button>

                {/* Devices list dropdown */}
                {showDevicesList && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 p-3 shadow-lg z-50 text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="font-semibold text-slate-900">Active Devices</span>
                      <span className="text-[11px] text-slate-500">{devices.length} Online</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1.5">
                      {devices.map((d) => (
                        <div
                          key={d.deviceId}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`p-1 rounded ${
                                d.role === 'camera'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              {d.role === 'camera' ? (
                                <Video className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate">{d.name}</p>
                              <p className="text-[10px] text-slate-500 capitalize">
                                {d.role} {d.batteryLevel !== undefined && `• ${d.batteryLevel}% battery`}
                              </p>
                            </div>
                          </div>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Operating Mode Segmented Control */}
              {onSwitchRole && (
                <div className="flex items-center rounded-lg bg-slate-100 border border-slate-200 p-0.5">
                  <button
                    onClick={() => onSwitchRole('camera')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                      currentRole === 'camera'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-slate-700" />
                    <span className="hidden sm:inline">Camera</span>
                  </button>
                  <button
                    onClick={() => onSwitchRole('viewer')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                      currentRole === 'viewer'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-700" />
                    <span className="hidden sm:inline">Viewer</span>
                  </button>
                </div>
              )}

              {/* Pair Secondary Device */}
              {onOpenPairQR && (
                <button
                  onClick={onOpenPairQR}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition"
                  title="Scan QR to pair phone or secondary monitor"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Pair Device</span>
                </button>
              )}

              {/* Exit Space */}
              {onLeaveSpace && (
                <button
                  onClick={onLeaveSpace}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
                  title="Disconnect / Change Space"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                Setup Mode
              </span>
            </div>
          )}

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};

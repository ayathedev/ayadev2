import React, { useState, useEffect } from 'react';
import {
  Video,
  Eye,
  Lock,
  ArrowRight,
  Check,
  Radio,
  X,
} from 'lucide-react';
import { DeviceRole, SpaceConfig } from '../types';
import logoUrl from '../assets/images/aya_sec_logo.png';

interface SpaceSetupModalProps {
  isOpen: boolean;
  initialConfig?: SpaceConfig | null;
  onJoinSpace: (config: SpaceConfig) => void;
  onCancel?: () => void;
  defaultRole?: DeviceRole;
  errorMessage?: string | null;
}

interface ActiveSpaceItem {
  spaceId: string;
  name: string;
  accessCode: string;
  deviceCount: number;
  devices: { deviceId: string; name: string; role: 'camera' | 'viewer'; status: string }[];
}

export const SpaceSetupModal: React.FC<SpaceSetupModalProps> = ({
  isOpen,
  initialConfig,
  onJoinSpace,
  onCancel,
  defaultRole = 'camera',
  errorMessage,
}) => {
  const [spaceName, setSpaceName] = useState(initialConfig?.name || 'Living Room');
  const [accessCode, setAccessCode] = useState(initialConfig?.accessCode || '');
  const [role, setRole] = useState<DeviceRole>(initialConfig?.role || defaultRole);
  const [deviceName, setDeviceName] = useState(
    initialConfig?.deviceName || (defaultRole === 'camera' ? 'Camera Station 1' : 'Monitoring Console')
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeSpaces, setActiveSpaces] = useState<ActiveSpaceItem[]>([]);

  // Fetch active spaces from server
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/spaces')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setActiveSpaces(data);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const handleRoleSelect = (newRole: DeviceRole) => {
    setRole(newRole);
    if (!deviceName || deviceName.includes('Camera') || deviceName.includes('Console') || deviceName.includes('Cam')) {
      setDeviceName(newRole === 'camera' ? 'Camera Station 1' : 'Monitoring Console');
    }
  };

  const handleSelectActiveSpace = (item: ActiveSpaceItem) => {
    setSpaceName(item.name);
    if (item.accessCode) {
      setAccessCode(item.accessCode);
    }
  };

  const presetSpaces = [
    'Living Room',
    'Main Entrance',
    'Backyard & Patio',
    'Office',
    'Garage',
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = spaceName.trim();
    const cleanCode = accessCode.trim();

    if (!cleanName) {
      setValidationError('Please enter a Space Name or Identifier');
      return;
    }
    if (!cleanCode) {
      setValidationError('Please provide a Passcode for this Space');
      return;
    }
    if (cleanCode.length < 3) {
      setValidationError('Passcode must be at least 3 characters');
      return;
    }

    setValidationError(null);

    const spaceId = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    onJoinSpace({
      spaceId,
      name: cleanName,
      accessCode: cleanCode,
      role,
      deviceName: deviceName.trim() || (role === 'camera' ? 'Camera Station 1' : 'Monitoring Console'),
      motionSensitivity: initialConfig?.motionSensitivity ?? 50,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl p-6 sm:p-8 my-8 text-slate-900">
        {/* Header with Square Logo, Title, and Subtitle */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <img
              src={logoUrl}
              alt="Aya Sec Security Cam"
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
            />
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                Aya Sec Security Cam
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                by Aya The Being
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {(errorMessage || validationError) && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            <span>{validationError || errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Active Spaces Banner if any other tab/device created one */}
          {activeSpaces.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-slate-500" />
                  Active Spaces on Server:
                </span>
                <span className="text-[10px] text-slate-500">Click to join same space</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeSpaces.map((s) => {
                  const cameraCount = s.devices.filter((d) => d.role === 'camera').length;
                  const isSelected = spaceName.toLowerCase() === s.name.toLowerCase();
                  return (
                    <button
                      key={s.spaceId}
                      type="button"
                      onClick={() => handleSelectActiveSpace(s)}
                      className={`px-2.5 py-1 rounded-md border text-xs font-medium transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cameraCount > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <span>{s.name}</span>
                      <span className="text-[10px] opacity-75">
                        ({cameraCount > 0 ? `${cameraCount} cam` : `${s.deviceCount} dev`})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block font-medium text-slate-700 mb-2">
              Select Device Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('camera')}
                className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between min-h-[90px] ${
                  role === 'camera'
                    ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900 text-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-1.5 rounded-md bg-slate-100 text-slate-800">
                    <Video className="w-4 h-4" />
                  </div>
                  {role === 'camera' && <Check className="w-4 h-4 text-slate-900" />}
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900">Camera Mode</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Streams video & audio feed
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('viewer')}
                className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between min-h-[90px] ${
                  role === 'viewer'
                    ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900 text-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-1.5 rounded-md bg-slate-100 text-slate-800">
                    <Eye className="w-4 h-4" />
                  </div>
                  {role === 'viewer' && <Check className="w-4 h-4 text-slate-900" />}
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900">Viewer Console</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Live watch, recordings & talk
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Space Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-medium text-slate-700">
                Space Name / Location
              </label>
              <span className="text-[10px] text-slate-500">Must match between Camera & Viewer</span>
            </div>
            <input
              type="text"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              placeholder="e.g. Living Room, Front Porch, TEST 1"
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
            />
            {/* Presets */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {presetSpaces.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSpaceName(p)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition ${
                    spaceName === p
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Access Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-medium text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Space Passcode</span>
              </label>
              <span className="text-[10px] text-slate-500">Shared PIN between devices</span>
            </div>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter passcode (e.g. 4040)"
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
            />
          </div>

          {/* Device Label */}
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">
              Device Name
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g. Pixel 8, Desk Monitor"
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition"
            >
              <span>Connect Device</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

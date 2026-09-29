import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Share2,
  Copy,
  Check,
  Shield,
  Eye,
  Key,
  X,
  QrCode,
  ExternalLink,
  Users,
} from 'lucide-react';
import { SpaceConfig } from '../types';

interface ShareAccessModalProps {
  spaceConfig: SpaceConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAccessModal: React.FC<ShareAccessModalProps> = ({
  spaceConfig,
  isOpen,
  onClose,
}) => {
  const [accessType, setAccessType] = useState<'viewonly' | 'full'>('viewonly');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}?space=${encodeURIComponent(spaceConfig.spaceId)}&code=${encodeURIComponent(
    spaceConfig.accessCode
  )}&role=viewer${accessType === 'viewonly' ? '&viewonly=true' : ''}`;

  useEffect(() => {
    if (isOpen && shareUrl) {
      QRCode.toDataURL(shareUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation failed:', err));
    }
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Share Space Access</h3>
              <p className="text-xs text-slate-400">Invite family members or guests to view</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Access Permission Mode Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Permission Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccessType('viewonly')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  accessType === 'viewonly'
                    ? 'bg-cyan-950/60 border-cyan-500/80 shadow-md ring-1 ring-cyan-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-xs text-white">Guest View-Only</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Safely view camera feed. Cannot trigger sirens or change settings.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAccessType('full')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  accessType === 'full'
                    ? 'bg-indigo-950/60 border-indigo-500/80 shadow-md ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-xs text-white">Full Operator</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Allows two-way talk, alarm sirens, night vision and flashlight.
                </p>
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
            {qrDataUrl ? (
              <div className="p-2 bg-white rounded-xl shadow-md mb-2">
                <img src={qrDataUrl} alt="Space QR Code" className="w-40 h-40 object-contain" />
              </div>
            ) : (
              <div className="w-40 h-40 flex items-center justify-center text-slate-600">
                <QrCode className="w-8 h-8 animate-spin" />
              </div>
            )}
            <p className="text-[11px] text-slate-400 text-center font-medium">
              Scan with smartphone camera to open live stream instantly
            </p>
          </div>

          {/* Share Link Copy Field */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Direct Invite Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Quick Space Creds Summary */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              Space: <strong className="text-white">{spaceConfig.name}</strong>
            </span>
            <span>
              Passcode: <strong className="text-white font-mono">{spaceConfig.accessCode}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

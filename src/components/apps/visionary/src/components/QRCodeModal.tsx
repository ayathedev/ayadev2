import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, QrCode, Smartphone, ExternalLink } from 'lucide-react';
import { DeviceRole } from '../types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  spaceName: string;
  accessCode: string;
  targetRole: DeviceRole;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  spaceId,
  spaceName,
  accessCode,
  targetRole,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate pair URL
  const pairUrl = `${window.location.origin}${window.location.pathname}?space=${encodeURIComponent(
    spaceId
  )}&code=${encodeURIComponent(accessCode)}&role=${targetRole}&name=${encodeURIComponent(spaceName)}`;

  useEffect(() => {
    if (isOpen && pairUrl) {
      QRCode.toDataURL(pairUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [isOpen, pairUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pairUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-xl text-slate-900 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pair Device</h3>
              <p className="text-[11px] text-slate-500">Scan code with mobile camera</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Configuration notice */}
        <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
            <span>Target Role: <strong className="capitalize text-slate-900">{targetRole}</strong></span>
          </div>
          <div className="text-slate-500 text-[11px] font-mono">
            {spaceName || spaceId}
          </div>
        </div>

        {/* Cross-Network Remote Badge */}
        <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center gap-2 text-[11px] text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span><strong>Worldwide Remote Access:</strong> Works anywhere over Cellular (4G/5G), Home Wi-Fi, or public hotspots.</span>
        </div>

        {/* QR Code */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Device Pairing QR"
                className="w-52 h-52 object-contain"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
                Generating QR code...
              </div>
            )}
          </div>
          <p className="mt-2.5 text-[11px] text-slate-500 text-center max-w-xs">
            Scanning automatically pairs the device to this Space with the access passcode included.
          </p>
        </div>

        {/* Access Code & Link */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-600 text-xs">Space Passcode:</span>
            <span className="font-mono font-bold text-slate-900 tracking-wider text-xs">
              {accessCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Copy Direct Link'}</span>
            </button>
            <a
              href={pairUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200"
              title="Open in new window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Download,
  Search,
  Filter,
  AlertTriangle,
  Info,
  Clock,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditLogModalProps {
  logs: AuditLogEntry[];
  isOpen: boolean;
  onClose: () => void;
  spaceName: string;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  logs,
  isOpen,
  onClose,
  spaceName,
}) => {
  const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'warn' | 'alert'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (levelFilter !== 'all' && log.level !== levelFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesAction = log.action.toLowerCase().includes(query);
        const matchesDetails = log.details.toLowerCase().includes(query);
        const matchesDevice = log.deviceName?.toLowerCase().includes(query);
        return matchesAction || matchesDetails || matchesDevice;
      }
      return true;
    });
  }, [logs, levelFilter, searchQuery]);

  if (!isOpen) return null;

  const exportCSV = () => {
    const headers = ['Timestamp', 'Level', 'Action', 'Details', 'Device'];
    const rows = filteredLogs.map((log) => [
      new Date(log.timestamp).toISOString(),
      log.level,
      `"${log.action.replace(/"/g, '""')}"`,
      `"${log.details.replace(/"/g, '""')}"`,
      `"${(log.deviceName || log.deviceId || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ayasec_audit_log_${spaceName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Security & Activity Audit Log</h3>
              <p className="text-xs text-slate-400">
                Tamper-evident system activity history for &quot;{spaceName}&quot;
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
              title="Export as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setLevelFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                levelFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setLevelFilter('alert')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                levelFilter === 'alert' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Alerts ({logs.filter((l) => l.level === 'alert').length})
            </button>
            <button
              onClick={() => setLevelFilter('warn')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                levelFilter === 'warn' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Warnings ({logs.filter((l) => l.level === 'warn').length})
            </button>
            <button
              onClick={() => setLevelFilter('info')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                levelFilter === 'info' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Info ({logs.filter((l) => l.level === 'info').length})
            </button>
          </div>

          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Log Entries Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
              let Icon = Info;
              if (log.level === 'alert') {
                badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                Icon = ShieldAlert;
              } else if (log.level === 'warn') {
                badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                Icon = AlertTriangle;
              }

              return (
                <div
                  key={log.id}
                  className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start justify-between gap-3 text-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${badgeColor}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-white text-xs">{log.action}</span>
                        {log.deviceName && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                            {log.deviceName}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{log.details}</p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono shrink-0 whitespace-nowrap mt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-center py-14 text-slate-500 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No audit records matching your current filter.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-500 flex justify-between items-center">
          <span>Showing {filteredLogs.length} events</span>
          <span>Logs are maintained in high-speed encrypted memory</span>
        </div>
      </div>
    </div>
  );
};

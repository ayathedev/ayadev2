import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppId } from '../../types';
import { APPS_METADATA, USER_PROFILE } from '../../data/portfolioData';
import { 
  Search, 
  Globe, 
  Terminal, 
  Folder, 
  Palette, 
  Music, 
  Gamepad2, 
  FileText, 
  Settings,
  Sparkles,
  Radio,
  Layers,
  Film,
  HeartHandshake,
  Newspaper,
  Box,
  LayoutGrid,
  Mic,
  X
} from 'lucide-react';
import { playUiSound } from '../../utils/soundEffects';

interface LauncherProps {
  isOpen: boolean;
  onClose: () => void;
  openApp: (appId: AppId) => void;
  soundEnabled: boolean;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Globe,
  Terminal,
  Folder,
  Palette,
  Music,
  Gamepad2,
  FileText,
  Sparkles,
  Settings,
  Radio,
  Layers,
  Film,
  HeartHandshake,
  Newspaper,
  Box,
  LayoutGrid,
  Mic,
};

export const Launcher: React.FC<LauncherProps> = ({
  isOpen,
  onClose,
  openApp,
  soundEnabled,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredApps = APPS_METADATA.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-slate-900/90 border border-slate-700/80 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Top Search Input */}
          <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
            <Search className="w-5 h-5 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Aya's apps, tools, and creative projects..."
              className="flex-1 bg-transparent text-sm text-slate-100 focus:outline-none placeholder:text-slate-500 font-medium"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Profile Card Header */}
          <div className="px-5 py-3.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/avatar.jpg"
                alt="Aya Kalimah Satya Ruane"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500/40 shadow-md shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="text-xs font-bold text-slate-200">Aya Kalimah Satya Ruane</h3>
                <p className="text-[11px] text-slate-400">Aya OS Portfolio Edition</p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
              {['all', 'portfolio', 'creative', 'utility', 'system'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    playUiSound('click', soundEnabled);
                    setSelectedCategory(cat);
                  }}
                  className={`px-2.5 py-1 rounded-full capitalize font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* App Icons Grid */}
          <div className="p-6 overflow-y-auto flex-1 grid grid-cols-3 sm:grid-cols-4 gap-4">
            {filteredApps.map((app) => {
              const IconComponent = ICON_MAP[app.iconName] || Globe;
              return (
                <button
                  key={app.id}
                  onClick={() => {
                    openApp(app.id);
                    onClose();
                  }}
                  className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-cyan-400 shadow-md group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/50 transition-all">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="mt-2 text-xs font-semibold text-slate-200 group-hover:text-cyan-300 line-clamp-1">
                    {app.name}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-normal">
                    {app.category}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

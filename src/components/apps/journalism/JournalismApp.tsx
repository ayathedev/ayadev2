import React, { useState, useEffect, useRef } from 'react';
import { 
  Newspaper, 
  User, 
  ExternalLink, 
  Columns, 
  Volume2, 
  VolumeX, 
  Search, 
  Share2, 
  BookOpen, 
  ShieldAlert, 
  Check, 
  Heart, 
  Building2, 
  MapPin, 
  Sparkles, 
  Calendar, 
  Clock, 
  Scale, 
  Globe, 
  FileText,
  ChevronRight,
  Flame,
  Award,
  Zap,
  Folder,
  Apple,
  Youtube,
  BrainCircuit,
  PenTool,
  Box
} from 'lucide-react';
import { ARTICLE_DATA, AUTHOR_DATA } from './articleData';
import { AppId } from '../../../types';

type ViewMode = 'split' | 'article' | 'author';
type ReadingTheme = 'editorial' | 'dark' | 'sepia';

interface JournalismProps {
  openApp?: (appId: AppId) => void;
}

export const JournalismApp: React.FC<JournalismProps> = ({ openApp }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('editorial');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [activeSectionId, setActiveSectionId] = useState<string>('introduction');

  const articleScrollRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const toggleSpeech = () => {
    if (!synthRef.current) return;

    if (isPlayingAudio) {
      synthRef.current.cancel();
      setIsPlayingAudio(false);
    } else {
      synthRef.current.cancel();
      // Prepare text to read aloud
      const fullText = `${ARTICLE_DATA.title}. By ${ARTICLE_DATA.byline}. Published on ${ARTICLE_DATA.publishedDate}. ${ARTICLE_DATA.summary}. ${ARTICLE_DATA.sections.map(s => `${s.title}. ${s.paragraphs.join(' ')}`).join(' ')}`;
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.rate = speechRate;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const themeClasses: Record<ReadingTheme, { bg: string; text: string; card: string; border: string; accent: string }> = {
    editorial: {
      bg: 'bg-white',
      text: 'text-stone-900',
      card: 'bg-stone-50',
      border: 'border-stone-200',
      accent: 'text-red-700',
    },
    dark: {
      bg: 'bg-slate-950',
      text: 'text-slate-100',
      card: 'bg-slate-900',
      border: 'border-slate-800',
      accent: 'text-red-400',
    },
    sepia: {
      bg: 'bg-[#fbf0d9]',
      text: 'text-[#433422]',
      card: 'bg-[#f4e2be]',
      border: 'border-[#dfcaa4]',
      accent: 'text-[#9b3815]',
    },
  };

  const currentTheme = themeClasses[readingTheme];

  const fontClasses = {
    normal: 'text-sm sm:text-base leading-relaxed',
    large: 'text-base sm:text-lg leading-relaxed',
    xlarge: 'text-lg sm:text-xl leading-relaxed',
  }[fontSize];

  return (
    <div className={`h-full w-full flex flex-col font-sans select-text ${currentTheme.bg} ${currentTheme.text} transition-colors duration-300`}>
      {/* Top Application Command Bar */}
      <header className={`h-14 border-b ${currentTheme.border} ${currentTheme.card} flex items-center justify-between px-3 sm:px-5 shrink-0 z-20`}>
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-600 text-white px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider shadow-sm">
            <Newspaper className="w-3.5 h-3.5" />
            <span>[your]NEWS Press</span>
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>Aya Kalimah Satya Ruane</span>
              <span className="bg-red-500/10 text-red-600 text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold border border-red-500/20">
                CPRS • CHW
              </span>
            </span>
            <span className="text-[10px] opacity-60">Citizen Journalism & Human Rights Advocacy Archive</span>
          </div>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-lg border border-black/10 dark:border-white/10 text-xs">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              viewMode === 'split' ? 'bg-white dark:bg-slate-800 shadow-sm font-bold text-red-600 dark:text-red-400' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dual Split</span>
          </button>
          <button
            onClick={() => setViewMode('article')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              viewMode === 'article' ? 'bg-white dark:bg-slate-800 shadow-sm font-bold text-red-600 dark:text-red-400' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
          <button
            onClick={() => setViewMode('author')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              viewMode === 'author' ? 'bg-white dark:bg-slate-800 shadow-sm font-bold text-red-600 dark:text-red-400' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Author</span>
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* TTS Audio Reader */}
          <button
            onClick={toggleSpeech}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border transition-all ${
              isPlayingAudio 
                ? 'bg-red-600 text-white border-red-600 animate-pulse' 
                : 'hover:bg-black/5 dark:hover:bg-white/5 border-transparent'
            }`}
            title={isPlayingAudio ? 'Stop reading article' : 'Listen to article text-to-speech'}
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
            <span className="hidden md:inline">{isPlayingAudio ? 'Stop Voice' : 'Listen Audio'}</span>
          </button>

          {/* Theme Selector */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium border-l pl-2 border-stone-300 dark:border-slate-700">
            <button
              onClick={() => setReadingTheme('editorial')}
              className={`w-5 h-5 rounded-full border bg-white ${readingTheme === 'editorial' ? 'ring-2 ring-red-500' : ''}`}
              title="Editorial Light"
            />
            <button
              onClick={() => setReadingTheme('sepia')}
              className={`w-5 h-5 rounded-full border bg-[#fbf0d9] ${readingTheme === 'sepia' ? 'ring-2 ring-red-500' : ''}`}
              title="Sepia Paper"
            />
            <button
              onClick={() => setReadingTheme('dark')}
              className={`w-5 h-5 rounded-full border bg-slate-900 ${readingTheme === 'dark' ? 'ring-2 ring-red-500' : ''}`}
              title="Night Reader"
            />
          </div>

          {/* Font Size Adjuster */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 rounded px-1.5 py-0.5 text-xs font-mono">
            <button 
              onClick={() => setFontSize('normal')} 
              className={`px-1 rounded ${fontSize === 'normal' ? 'font-bold underline' : 'opacity-60'}`}
              title="Standard text"
            >
              A
            </button>
            <button 
              onClick={() => setFontSize('large')} 
              className={`px-1 text-sm rounded ${fontSize === 'large' ? 'font-bold underline' : 'opacity-60'}`}
              title="Large text"
            >
              A+
            </button>
            <button 
              onClick={() => setFontSize('xlarge')} 
              className={`px-1 text-base rounded ${fontSize === 'xlarge' ? 'font-bold underline' : 'opacity-60'}`}
              title="Extra large text"
            >
              A++
            </button>
          </div>

          {/* Copy Direct Live Link */}
          <button
            onClick={() => handleCopyLink(ARTICLE_DATA.url)}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 font-medium transition-colors"
            title="Copy YourNews article URL"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </header>

      {/* Main Dual Workstation Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* ============================================================ */}
        {/* COLUMN 1: AUTHOR PROFILE & ADVOCACY DOSSIER */}
        {/* ============================================================ */}
        {(viewMode === 'author' || viewMode === 'split') && (
          <aside 
            className={`
              ${viewMode === 'split' ? 'w-full md:w-[380px] lg:w-[420px] shrink-0 border-r' : 'w-full'}
              ${currentTheme.border} ${currentTheme.card} flex flex-col overflow-y-auto custom-scrollbar p-5 space-y-6
            `}
          >
            {/* Author Header Card */}
            <div className={`p-5 rounded-2xl border ${currentTheme.border} bg-white/60 dark:bg-slate-900/60 shadow-sm relative overflow-hidden`}>
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={AUTHOR_DATA.avatarUrl}
                    alt={AUTHOR_DATA.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-red-500/30 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full p-1 shadow-sm" title="Verified Author">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">
                    <span>Citizen Journalist</span>
                    <span>•</span>
                    <span>[your]NEWS</span>
                  </div>
                  <h2 className="text-xl font-black tracking-tight leading-tight mt-0.5">
                    {AUTHOR_DATA.name}
                  </h2>
                  <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    {AUTHOR_DATA.credentials}
                  </p>
                  <p className="text-[11px] opacity-70 mt-0.5">
                    {AUTHOR_DATA.credentialsFull}
                  </p>
                </div>
              </div>

              {/* Direct Link to Live Author Profile */}
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <a
                  href={AUTHOR_DATA.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                >
                  <span>Open live author page on YourNews</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Verbatim Biography */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-widest font-black text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Biography & Lived Experience</span>
              </h3>
              
              <div className={`p-4 rounded-xl border ${currentTheme.border} bg-white/40 dark:bg-slate-900/40 text-xs sm:text-sm leading-relaxed space-y-3`}>
                {AUTHOR_DATA.bio.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="opacity-90">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Grassroots Organizations & Roles */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-widest font-black text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Key Affiliations & Coalitions</span>
              </h3>

              <div className="space-y-2.5">
                {AUTHOR_DATA.organizations.map((org, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3.5 rounded-xl border ${currentTheme.border} bg-white/50 dark:bg-slate-900/50 hover:border-red-500/30 transition-all`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold">{org.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-medium">
                        {org.location}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {org.role}
                    </div>
                    <p className="text-[11px] opacity-75 mt-1 leading-snug">
                      {org.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Mission Quote Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-600/10 to-amber-600/10 border border-red-500/20 text-xs leading-relaxed italic text-center">
              "{AUTHOR_DATA.quote}"
            </div>

            {/* Related Interactive Applications */}
            {openApp && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-widest font-black text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Case Studies</span>
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => openApp('haven-care')}
                    className={`w-full p-3.5 rounded-xl border ${currentTheme.border} bg-white/50 dark:bg-slate-900/50 hover:border-red-500/40 transition-all text-left flex items-center gap-3 group`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <Heart className="w-5 h-5 text-red-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold">Haven Care OS</h4>
                      <p className="text-[10px] opacity-70 truncate">Trauma-Informed Admin Workstation</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => openApp('frame-flow')}
                    className={`w-full p-3.5 rounded-xl border ${currentTheme.border} bg-white/50 dark:bg-slate-900/50 hover:border-red-500/40 transition-all text-left flex items-center gap-3 group`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Sparkles className="w-5 h-5 text-emerald-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold">Frame Flow Studio</h4>
                      <p className="text-[10px] opacity-70 truncate">Video-to-Photo Extraction</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => openApp('ol-ave')}
                    className={`w-full p-3.5 rounded-xl border ${currentTheme.border} bg-white/50 dark:bg-slate-900/50 hover:border-red-500/40 transition-all text-left flex items-center gap-3 group`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-cyan-600/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                      <Zap className="w-5 h-5 text-cyan-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold">OL-AVE Engine</h4>
                      <p className="text-[10px] opacity-70 truncate">Generative Signal Processing</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => openApp('files')}
                    className={`w-full p-3.5 rounded-xl border ${currentTheme.border} bg-white/50 dark:bg-slate-900/50 hover:border-red-500/40 transition-all text-left flex items-center gap-3 group`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Folder className="w-5 h-5 text-blue-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold">Aya Files App</h4>
                      <p className="text-[10px] opacity-70 truncate">Advanced Virtual File System</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => openApp('pantry-pal')}
                    className={`w-full p-3.5 rounded-xl border ${currentTheme.border} bg-white/50 dark:bg-slate-900/50 hover:border-emerald-500/40 transition-all text-left flex items-center gap-3 group`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Apple className="w-5 h-5 text-emerald-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold">PantryPal Pro</h4>
                      <p className="text-[10px] opacity-70 truncate">Smart Kitchen Assistant</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => openApp('aya-music')}
                    className={`w-full p-3.5 rounded-xl border ${currentTheme.border} bg-white/50 dark:bg-slate-900/50 hover:border-red-500/40 transition-all text-left flex items-center gap-3 group`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <Youtube className="w-5 h-5 text-red-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold">Aya the Being: Music</h4>
                      <p className="text-[10px] opacity-70 truncate">Official Multimedia Vault</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => openApp('ollama-studio')}
                    className={`w-full p-3.5 rounded-xl border ${currentTheme.border} bg-white/50 dark:bg-slate-900/50 hover:border-indigo-500/40 transition-all text-left flex items-center gap-3 group`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <BrainCircuit className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold">Ollama AI Studio</h4>
                      <p className="text-[10px] opacity-70 truncate">Local AI Command Center</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => openApp('aidefend')}
                    className={`w-full p-3.5 rounded-xl border ${currentTheme.border} bg-white/50 dark:bg-slate-900/50 hover:border-cyan-500/40 transition-all text-left flex items-center gap-3 group`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-cyan-600/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                      <ShieldAlert className="w-5 h-5 text-cyan-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold">AIDEFEND™ Framework</h4>
                      <p className="text-[10px] opacity-70 truncate">AI Security Knowledge Base</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => openApp('novel-writer')}
                    className={`w-full p-3.5 rounded-xl border ${currentTheme.border} bg-white/50 dark:bg-slate-900/50 hover:border-stone-500/40 transition-all text-left flex items-center gap-3 group`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-stone-900/10 flex items-center justify-center shrink-0 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                      <PenTool className="w-5 h-5 text-stone-900 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold">NovelWriter OS</h4>
                      <p className="text-[10px] opacity-70 truncate">Manuscript Drafting Studio</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => openApp('ayasec-visionary')}
                    className={`w-full p-3.5 rounded-xl border ${currentTheme.border} bg-white/50 dark:bg-slate-900/50 hover:border-cyan-500/40 transition-all text-left flex items-center gap-3 group`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                      <Box className="w-5 h-5 text-cyan-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold">Visionary 3D Engine</h4>
                      <p className="text-[10px] opacity-70 truncate">WebGPU Spatial Computing</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            )}

            {/* Switch to article button if on mobile / narrow */}
            {viewMode === 'author' && (
              <button
                onClick={() => setViewMode('article')}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Feature Investigation: The Roadmap to Erasure</span>
              </button>
            )}
          </aside>
        )}

        {/* ============================================================ */}
        {/* COLUMN 2: INVESTIGATIVE REPORT ("The Roadmap to Erasure") */}
        {/* ============================================================ */}
        {(viewMode === 'article' || viewMode === 'split') && (
          <main 
            ref={articleScrollRef} 
            className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 lg:p-12"
          >
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Publication Header Badge */}
              <div className="space-y-3 border-b pb-6 border-stone-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-wider text-[10px]">
                    Investigative Report
                  </span>
                  <span className="text-red-600 dark:text-red-400 font-bold uppercase tracking-wider text-[11px]">
                    Statehouse & Global Rights Analysis
                  </span>
                  <span className="opacity-40">•</span>
                  <span className="flex items-center gap-1 opacity-70 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    {ARTICLE_DATA.publishedDate}
                  </span>
                  <span className="opacity-40">•</span>
                  <span className="flex items-center gap-1 opacity-70 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    {ARTICLE_DATA.readTime}
                  </span>
                </div>

                {/* Article Headline */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight leading-tight">
                  {ARTICLE_DATA.title}
                </h1>

                {/* Author Byline Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={AUTHOR_DATA.avatarUrl}
                      alt={AUTHOR_DATA.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-red-500/20"
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <button
                          onClick={() => setViewMode('author')}
                          className="hover:text-red-600 dark:hover:text-red-400 hover:underline text-left cursor-pointer"
                        >
                          {ARTICLE_DATA.byline}
                        </button>
                      </div>
                      <div className="text-[11px] opacity-70">
                        Citizen Journalist, [your]NEWS • Certified Peer Recovery Supporter & CHW
                      </div>
                    </div>
                  </div>

                  {/* Direct Live Article URL Action */}
                  <a
                    href={ARTICLE_DATA.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-colors shadow-sm"
                  >
                    <span>View on YourNews</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Cover Image Feature Banner */}
              <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-slate-800 shadow-md relative group">
                <img
                  src={ARTICLE_DATA.coverImage}
                  alt={ARTICLE_DATA.title}
                  className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4 sm:p-6">
                  <div className="text-white space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-black">
                      Columbus Statehouse & Federal Doctrine
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-stone-200 line-clamp-2">
                      {ARTICLE_DATA.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Executive Briefing Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ARTICLE_DATA.executiveHighlights.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3.5 rounded-xl border ${currentTheme.border} ${currentTheme.card} space-y-1 shadow-sm`}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-widest font-black text-red-600 dark:text-red-400">
                      {item.label}
                    </span>
                    <p className="text-xs font-medium leading-snug">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Table of Contents Quick Nav */}
              <nav className={`p-4 rounded-xl border ${currentTheme.border} bg-stone-100/60 dark:bg-slate-900/60 space-y-2`}>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-60">
                  Contents in this Investigation
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ARTICLE_DATA.sections.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 text-[11px] font-medium transition-colors border border-black/5 dark:border-white/5 shadow-xs"
                    >
                      {sec.title}
                    </button>
                  ))}
                </div>
              </nav>

              {/* Verbatim Article Sections */}
              <article className="space-y-10 font-serif">
                {ARTICLE_DATA.sections.map((section) => (
                  <section 
                    key={section.id} 
                    id={`section-${section.id}`} 
                    className="space-y-4 pt-4 border-t border-dashed border-stone-200 dark:border-slate-800"
                  >
                    <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-red-700 dark:text-red-400">
                      {section.title}
                    </h2>

                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className={`${fontClasses} font-serif opacity-90`}>
                        {p}
                      </p>
                    ))}

                    {/* Styled Pullout Callout Quote */}
                    {section.callout && (
                      <div className="my-6 pl-4 border-l-4 border-red-600 dark:border-red-500 py-2 italic font-serif text-base sm:text-lg text-red-800 dark:text-red-300 bg-red-500/5 rounded-r-lg pr-4">
                        {section.callout}
                      </div>
                    )}

                    {/* Subsections if available */}
                    {section.subsections && section.subsections.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {section.subsections.map((sub, sIdx) => (
                          <div 
                            key={sIdx} 
                            className={`p-4 rounded-xl border ${currentTheme.border} ${currentTheme.card} font-sans space-y-1`}
                          >
                            <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                              <span>{sub.subtitle}</span>
                            </h3>
                            <p className="text-xs sm:text-sm opacity-80 leading-relaxed font-sans">
                              {sub.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </article>

              {/* Author Closing Callout Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-red-600/10 via-amber-600/10 to-transparent border border-red-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red-600 dark:text-red-400 font-black">
                  <Flame className="w-4 h-4" />
                  <span>Call to Action & Solidarity</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed font-serif italic">
                  "If the international community remains silent while the locks are placed on the doors of democracy, they share the burden of the catastrophe that follows."
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-red-500/20">
                  <span className="text-xs font-bold">Aya Kalimah Satya Ruane</span>
                  <a
                    href={AUTHOR_DATA.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                  >
                    <span>Read all works on YourNews</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default JournalismApp;

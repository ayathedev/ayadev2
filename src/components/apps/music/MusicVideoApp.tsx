import React, { useState } from 'react';
import { 
  Youtube, 
  Play, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  ListMusic, 
  Share2, 
  Info,
  ExternalLink,
  Maximize2,
  Sparkles,
  Search,
  Music
} from 'lucide-react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}

const VIDEOS: Video[] = [
  { 
    id: 'E2BH70BH0tQ', 
    title: 'Aya the Being - Performance I', 
    thumbnail: 'https://img.youtube.com/vi/E2BH70BH0tQ/mqdefault.jpg',
    duration: '4:12'
  },
  { 
    id: '09vaZyHei1o', 
    title: 'Aya the Being - Performance II', 
    thumbnail: 'https://img.youtube.com/vi/09vaZyHei1o/mqdefault.jpg',
    duration: '3:45'
  },
  { 
    id: 'XmufBaGnD1Q', 
    title: 'Aya the Being - Performance III', 
    thumbnail: 'https://img.youtube.com/vi/XmufBaGnD1Q/mqdefault.jpg',
    duration: '5:02'
  },
  { 
    id: 'hAYWYLkt7oI', 
    title: 'Aya the Being - Performance IV', 
    thumbnail: 'https://img.youtube.com/vi/hAYWYLkt7oI/mqdefault.jpg',
    duration: '4:30'
  },
  { 
    id: 'P65O3_8Kx2A', 
    title: 'Aya the Being - Performance V', 
    thumbnail: 'https://img.youtube.com/vi/P65O3_8Kx2A/mqdefault.jpg',
    duration: '3:58'
  },
  { 
    id: '1w9icdgLL8k', 
    title: 'Aya the Being - Performance VI', 
    thumbnail: 'https://img.youtube.com/vi/1w9icdgLL8k/mqdefault.jpg',
    duration: '4:15'
  }
];

export const MusicVideoApp: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video>(VIDEOS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = VIDEOS.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full w-full bg-stone-950 text-stone-200 flex flex-col font-sans select-none overflow-hidden">
      {/* Dynamic Header */}
      <header className="h-16 border-b border-stone-800 bg-stone-900/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-red-600 rounded-xl shadow-lg shadow-red-900/20">
            <Youtube className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase italic">Aya the Being</h1>
            <p className="text-[10px] text-red-500 font-bold tracking-[0.2em] leading-none">Multimedia Vault // v1.2</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-stone-800/50 rounded-full px-4 py-2 border border-stone-700/50">
            <Search className="w-4 h-4 text-stone-500" />
            <input 
              type="text" 
              placeholder="Search discography..." 
              className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-stone-600 w-48 ml-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-stone-800 rounded-full transition-colors">
              <Share2 className="w-4 h-4 text-stone-400" />
            </button>
            <button className="p-2 hover:bg-stone-800 rounded-full transition-colors">
              <Info className="w-4 h-4 text-stone-400" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-72 border-r border-stone-800 bg-stone-900/20 flex flex-col shrink-0">
          <div className="p-4 border-b border-stone-800">
            <h2 className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-4">Official Playlist</h2>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600/10 text-red-500 border border-red-600/20 shadow-sm transition-all">
                <ListMusic className="w-4 h-4" />
                Featured Works
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-stone-400 hover:bg-stone-800/50 hover:text-stone-200 transition-all">
                <Sparkles className="w-4 h-4" />
                Live Sessions
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-stone-400 hover:bg-stone-800/50 hover:text-stone-200 transition-all">
                <Music className="w-4 h-4" />
                B-Sides
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            <div className="space-y-1">
              {filteredVideos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all group ${
                    selectedVideo.id === video.id 
                      ? 'bg-stone-800/80 ring-1 ring-stone-700' 
                      : 'hover:bg-stone-800/40'
                  }`}
                >
                  <div className="w-16 h-10 rounded-lg overflow-hidden bg-stone-900 relative shrink-0">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    {selectedVideo.id === video.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-600/20">
                        <Play className="w-4 h-4 fill-red-600 text-red-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-xs font-bold truncate ${selectedVideo.id === video.id ? 'text-white' : 'text-stone-400'}`}>
                      {video.title}
                    </p>
                    <p className="text-[10px] text-stone-600 font-mono">{video.duration}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 mt-auto border-t border-stone-800 bg-stone-900/40">
            <a 
              href="https://www.youtube.com/@ayathebeing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-stone-200 transition-all"
            >
              Subscribe on YouTube
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </aside>

        {/* Player Workspace */}
        <main className="flex-1 flex flex-col bg-stone-950 relative overflow-hidden">
          {/* Main Stage */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-stone-900/50 to-transparent">
            <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl shadow-2xl shadow-black overflow-hidden border border-stone-800 relative group">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=0&controls=1&modestbranding=1&rel=0`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>

            <div className="w-full max-w-5xl mt-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white mb-2">{selectedVideo.title}</h2>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
                    <Youtube className="w-4 h-4" />
                    YouTube Premiere
                  </span>
                  <span className="text-xs text-stone-700">•</span>
                  <span className="text-xs font-mono text-stone-500">Official Release Archive</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-full text-xs font-bold flex items-center gap-2 transition-all">
                  <Maximize2 className="w-4 h-4" />
                  Theater Mode
                </button>
              </div>
            </div>
          </div>

          {/* Transport Controls (Aesthetic Only) */}
          <div className="h-20 border-t border-stone-800 bg-stone-900/40 backdrop-blur-xl flex items-center px-8 justify-between shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <button className="text-stone-500 hover:text-white transition-colors">
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-all">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
                <button className="text-stone-500 hover:text-white transition-colors">
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>
              </div>
              
              <div className="hidden lg:flex items-center gap-3 w-48">
                <div className="text-[10px] font-mono text-stone-500">0:00</div>
                <div className="flex-1 h-1 bg-stone-800 rounded-full relative overflow-hidden">
                   <div className="absolute inset-0 bg-red-600 w-[0%]" />
                </div>
                <div className="text-[10px] font-mono text-stone-500">{selectedVideo.duration}</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-stone-500" />
                <div className="w-24 h-1 bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

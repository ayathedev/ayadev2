import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, CheckCircle, Copy } from 'lucide-react';

export const NotesApp: React.FC = () => {
  const [notes, setNotes] = useState<Array<{ id: string; title: string; content: string; date: string }>>(() => {
    const saved = localStorage.getItem('portfolio_notes');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: '1',
        title: 'Hotspot Network Details',
        content: `Server AP IP: 192.168.4.1\nSSID: Portfolio_Hotspot_5G\nOffline Cache Status: 100% PWA Active`,
        date: '2026-09-27'
      },
      {
        id: '2',
        title: 'Welcome Visitor!',
        content: `You are connected directly to the offline local server. Feel free to explore the apps on the ChromeOS desktop!`,
        date: '2026-09-27'
      }
    ];
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '1');

  useEffect(() => {
    localStorage.setItem('portfolio_notes', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleAddNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      date: new Date().toISOString().split('T')[0]
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleUpdateActiveNote = (field: 'title' | 'content', value: string) => {
    setNotes(notes.map((n) => (n.id === activeNoteId ? { ...n, [field]: value } : n)));
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    if (updated.length > 0) setActiveNoteId(updated[0].id);
  };

  return (
    <div className="h-full flex bg-slate-950 text-slate-100 font-sans">
      {/* Left Sidebar */}
      <div className="w-56 bg-slate-900 border-r border-slate-800 p-3 flex flex-col justify-between shrink-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <StickyNote className="w-4 h-4 text-amber-400" /> My Notes
            </span>
            <button
              onClick={handleAddNote}
              className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold"
              title="Add Note"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[70vh] pr-1">
            {notes.map((note) => {
              const isActive = note.id === activeNoteId;
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-semibold truncate">{note.title || 'Untitled Note'}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{note.date}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Note Editor */}
      <div className="flex-1 p-6 flex flex-col space-y-4">
        {activeNote ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateActiveNote('title', e.target.value)}
                placeholder="Note Title..."
                className="bg-transparent text-lg font-bold text-slate-100 focus:outline-none focus:ring-0 flex-1"
              />
              <button
                onClick={() => handleDeleteNote(activeNote.id)}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg"
                title="Delete Note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={activeNote.content}
              onChange={(e) => handleUpdateActiveNote('content', e.target.value)}
              placeholder="Type your notes or information here..."
              className="flex-1 bg-transparent text-xs text-slate-200 leading-relaxed focus:outline-none resize-none font-mono"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
            No note selected.
          </div>
        )}
      </div>
    </div>
  );
};

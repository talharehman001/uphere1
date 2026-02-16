
import React, { useState, useEffect, useRef } from 'react';
import { FileItem } from '../types';

interface FileEditorProps {
  file: FileItem;
  onSave: (content: string) => void;
  onClose: () => void;
}

const FileEditor: React.FC<FileEditorProps> = ({ file, onSave, onClose }) => {
  const [localContent, setLocalContent] = useState(file.content);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize when the file prop changes from external source
  useEffect(() => {
    // Only update local state if someone else changed it (external change)
    // We compare with what we have to avoid cursor jumping
    if (file.content !== localContent) {
      const selectionStart = textareaRef.current?.selectionStart;
      const selectionEnd = textareaRef.current?.selectionEnd;
      
      setLocalContent(file.content);
      
      // Restore cursor position after state update (next tick)
      setTimeout(() => {
        if (textareaRef.current && selectionStart !== undefined && selectionEnd !== undefined) {
          textareaRef.current.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
    }
  }, [file.content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setLocalContent(newVal);
    
    // Visual feedback that broadcast is happening
    setIsSyncing(true);
    if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = window.setTimeout(() => setIsSyncing(false), 300);

    // INSTANT GLOBAL BROADCAST
    onSave(newVal);
  };

  return (
    <div className="h-full flex flex-col bg-[#0d0e12]">
      {/* Editor Toolbar */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-slate-800 bg-[#1a1d23]">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white leading-none">{file.name}</h2>
              {isSyncing && <span className="text-[10px] text-blue-400 font-bold italic animate-pulse">Broadcasting...</span>}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] uppercase text-slate-500 bg-slate-800 px-1 rounded font-mono">{file.type}</span>
              <span className="text-[10px] text-slate-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                P2P Encrypted Stream
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all duration-300 ${isSyncing ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/10 text-green-500'}`}>
             <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-blue-500 animate-ping' : 'bg-green-500 animate-pulse'}`}></span>
             {isSyncing ? 'Syncing...' : 'Live Connected'}
          </div>
          <button 
            onClick={onClose}
            className="text-xs font-semibold px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers Sidebar */}
        <div className="w-12 bg-[#0f1115] border-r border-slate-800 flex flex-col items-center pt-4 text-slate-700 select-none font-mono text-xs">
          {Array.from({ length: Math.max(localContent.split('\n').length + 10, 30) }).map((_, i) => (
            <div key={i} className="h-6 leading-6">{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleChange}
            spellCheck={false}
            autoFocus
            className="absolute inset-0 w-full h-full bg-transparent text-slate-200 p-4 font-mono text-sm resize-none focus:outline-none leading-6 whitespace-pre caret-blue-500"
            placeholder="Type anything here... it will show up on other screens instantly."
          />
        </div>

        {/* Collaborative Info Sidebar */}
        <div className="hidden lg:flex w-64 bg-[#14161c] border-l border-slate-800 flex-col p-4 text-xs gap-6">
          <div>
            <h3 className="text-slate-500 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Live Editor Info
            </h3>
            <div className="space-y-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Lines</span>
                <span className="text-blue-400 font-mono font-bold">{localContent.split('\n').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Write</span>
                <span className="text-blue-400 font-mono font-bold">{new Date(file.lastModified).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-slate-500 font-bold uppercase tracking-wider mb-3">Active Peers</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-blue-500/5 rounded border border-blue-500/10">
                <div className="relative">
                   <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-blue-500/20">U</div>
                   <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-[#14161c] rounded-full"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-200 font-medium">You</span>
                  <span className="text-[10px] text-blue-400">Master Session</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 grayscale opacity-40">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">P</div>
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Peer-1</span>
                  <span className="text-[10px] text-slate-600">Waiting for data...</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                Mesh Network
              </div>
              <p className="text-slate-500 leading-relaxed text-[10px]">
                আপনার করা প্রতিটি পরিবর্তন সাথে সাথে গ্রাস-রুট লেভেলে সিঙ্ক হচ্ছে। সেভ করার কোনো প্রয়োজন নেই।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileEditor;

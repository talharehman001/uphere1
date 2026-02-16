
import React, { useState } from 'react';

interface HeaderProps {
  view: 'explorer' | 'editor';
  onBack: () => void;
  roomName: string;
}

const Header: React.FC<HeaderProps> = ({ view, onBack, roomName }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    let shareUrl = window.location.href;
    
    // Check if we are in a blob or temporary environment
    if (shareUrl.startsWith('blob:') || shareUrl.includes('usercontent.goog')) {
      // In preview environments, we try to construct a clean link if possible
      // But once deployed, window.location.origin will be correct.
      const origin = window.location.origin;
      const path = window.location.pathname;
      shareUrl = `${origin}${path}?room=${roomName}`;
      
      // If it's still a blob origin, it's not truly shareable until deployed
      if (origin.startsWith('blob:')) {
        // Strip the blob: prefix for a cleaner string (though it won't work until deployed)
        shareUrl = shareUrl.replace('blob:', '');
      }
    } else {
      // Standard deployment environment
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('room', roomName);
        shareUrl = url.href;
      } catch (e) {
        shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomName}`;
      }
    }

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-[#1a1d23] px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {view === 'editor' && (
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">
            LS
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">LiveSync Drive</h1>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-widest">Global P2P</span>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full">
         <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
         <span className="text-[11px] text-slate-400 font-medium">Network ID:</span>
         <span className="text-[11px] text-blue-400 font-bold font-mono truncate max-w-[150px]">{roomName}</span>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={handleShare}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
            copied 
            ? 'bg-green-600 text-white' 
            : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              Link Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              Share Dashboard
            </>
          )}
        </button>
        <div className="h-8 w-[1px] bg-slate-800 hidden md:block"></div>
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full border-2 border-[#1a1d23] bg-gradient-to-tr from-indigo-500 to-purple-500" title="Host"></div>
          <div className="w-8 h-8 rounded-full border-2 border-[#1a1d23] bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

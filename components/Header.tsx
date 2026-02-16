
import React, { useState } from 'react';
import { ViewState } from '../types';

interface HeaderProps {
  view: ViewState;
  onViewChange: (view: ViewState) => void;
  roomName: string;
}

const Header: React.FC<HeaderProps> = ({ view, onViewChange, roomName }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    let shareUrl = window.location.href;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('room', roomName);
      shareUrl = url.href;
    } catch (e) {
      shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomName}`;
    }

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-[#1a1d23] px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {view !== 'explorer' && (
          <button 
            onClick={() => onViewChange('explorer')}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        )}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange('explorer')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">
            LS
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">LiveSync Drive</h1>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-widest">Global P2P</span>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-4">
        <button 
          onClick={() => onViewChange('api')}
          className={`px-3 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-2 ${
            view === 'api' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          Developer API
        </button>
        <div className="w-[1px] h-4 bg-slate-800"></div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full">
           <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
           <span className="text-[11px] text-slate-400 font-medium">Room:</span>
           <span className="text-[11px] text-blue-400 font-bold font-mono truncate max-w-[120px]">{roomName}</span>
        </div>
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
            <><svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
          ) : (
            <><svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> Share</>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Gun from 'gun';
import { FileItem, ViewState } from './types';
import FileExplorer from './components/FileExplorer';
import FileEditor from './components/FileEditor';
import Header from './components/Header';
import ApiDocs from './components/ApiDocs';

// Initialize Gun with public relay peers
const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://relay.peer.ooo/gun',
    'https://gun-us.herokuapp.com/gun'
  ]
});

const App: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>('explorer');
  const [isSyncing, setIsSyncing] = useState(false);

  // Determine Room ID safely
  const roomId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    let room = params.get('room');
    
    if (!room) {
      room = localStorage.getItem('livesync_room_id');
    }

    if (!room) {
      room = 'sync-' + Math.random().toString(36).substring(2, 7);
    }

    localStorage.setItem('livesync_room_id', room);

    if (window.location.protocol.startsWith('http')) {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.get('room') !== room) {
          url.searchParams.set('room', room);
          window.history.pushState({ path: url.href }, '', url.href);
        }
      } catch (e) {
        console.warn("URL update failed.");
      }
    }
    
    return room;
  }, []);

  const db = useMemo(() => gun.get('livesync-v1').get(roomId).get('files'), [roomId]);

  // Sync files from Gun.js
  useEffect(() => {
    setIsSyncing(true);
    
    db.map().on((data: any, id: string) => {
      if (!data) {
        setFiles(prev => prev.filter(f => f.id !== id));
        return;
      }
      
      setFiles(prev => {
        const index = prev.findIndex(f => f.id === id);
        if (index > -1) {
          if (prev[index].content === data.content && prev[index].lastModified === data.lastModified) {
            return prev;
          }
          const updated = [...prev];
          updated[index] = { ...data, id };
          return updated;
        } else {
          return [...prev, { ...data, id }];
        }
      });
      
      setIsSyncing(false);
    });

    return () => {
      // @ts-ignore
      db.off();
    };
  }, [db]);

  const handleUpload = useCallback((newFiles: FileItem[]) => {
    newFiles.forEach(file => {
      const { id, ...fileData } = file;
      db.get(id).put(fileData as any);
    });
  }, [db]);

  const handleDelete = useCallback((id: string) => {
    db.get(id).put(null as any);
    if (currentFileId === id) {
      setCurrentFileId(null);
      setView('explorer');
    }
  }, [db, currentFileId]);

  const handleEdit = useCallback((id: string) => {
    setCurrentFileId(id);
    setView('editor');
  }, []);

  const handleSaveFileContent = useCallback((id: string, newContent: string) => {
    const file = files.find(f => f.id === id);
    if (file && file.content !== newContent) {
      db.get(id).put({
        content: newContent,
        lastModified: Date.now(),
        size: new TextEncoder().encode(newContent).length
      } as any);
    }
  }, [db, files]);

  // Expose Global API for developers
  useEffect(() => {
    (window as any).liveSyncAPI = {
      roomId,
      getFiles: () => files,
      updateFile: (id: string, content: string) => handleSaveFileContent(id, content),
      deleteFile: (id: string) => handleDelete(id),
      uploadRaw: (name: string, content: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        handleUpload([{
          id,
          name,
          content,
          lastModified: Date.now(),
          size: new TextEncoder().encode(content).length,
          type: name.split('.').pop()?.toUpperCase() || 'TXT'
        }]);
        return id;
      }
    };
  }, [files, roomId, handleSaveFileContent, handleDelete, handleUpload]);

  const currentFile = files.find(f => f.id === currentFileId);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1115] text-slate-300">
      <Header 
        view={view} 
        onViewChange={(v) => setView(v)}
        roomName={roomId}
      />
      
      <main className="flex-1 overflow-hidden relative">
        {view === 'explorer' && (
          <FileExplorer 
            files={files} 
            onUpload={handleUpload}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
        {view === 'editor' && currentFile && (
          <FileEditor 
            file={currentFile} 
            onSave={(content: string) => handleSaveFileContent(currentFile.id, content)}
            onClose={() => setView('explorer')}
          />
        )}
        {view === 'api' && (
          <ApiDocs files={files} roomId={roomId} />
        )}
      </main>

      <footer className="h-8 border-t border-slate-800 bg-[#1a1d23] px-4 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>{files.length} items total</span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">Room: <span className="font-mono text-blue-400">{roomId}</span></span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
            <span className="font-medium text-slate-400">
              {isSyncing ? 'Syncing Mesh...' : 'Global Mesh Connected'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

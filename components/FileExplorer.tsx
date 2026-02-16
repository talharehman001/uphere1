
import React, { useRef } from 'react';
import { FileItem } from '../types';

interface FileExplorerProps {
  files: FileItem[];
  onUpload: (newFiles: FileItem[]) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onUpload, onDelete, onEdit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const newFiles: FileItem[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      const content = await f.text();
      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        name: f.name,
        content: content,
        type: f.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        size: f.size,
        lastModified: f.lastModified
      });
    }
    onUpload(newFiles);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'json') return (
      <div className="w-8 h-8 bg-amber-500/10 rounded flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 13a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 13a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1 1 1 0 0 0-1 1v1a1 1 0 0 1-1 1"/></svg>
      </div>
    );
    if (t === 'txt' || t === 'md') return (
      <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
      </div>
    );
    return (
      <div className="w-8 h-8 bg-slate-500/10 rounded flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search & Actions Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap gap-4 items-center justify-between bg-[#1a1d23]/50 backdrop-blur-sm">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input 
            type="text" 
            placeholder="Search your drive..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            multiple 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload Files
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm text-left">
          <thead className="sticky top-0 bg-[#0f1115] z-10 border-b border-slate-800">
            <tr>
              <th className="py-3 px-6 font-medium text-slate-500 w-12"></th>
              <th className="py-3 px-2 font-medium text-slate-500">Name</th>
              <th className="py-3 px-4 font-medium text-slate-500">Date modified</th>
              <th className="py-3 px-4 font-medium text-slate-500">Type</th>
              <th className="py-3 px-4 font-medium text-slate-500 text-right">Size</th>
              <th className="py-3 px-4 font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 15h18"/><path d="M9 21v-6"/><path d="M15 21v-6"/></svg>
                    </div>
                    <div className="max-w-[250px]">
                      <h3 className="text-white font-medium mb-1">Your drive is empty</h3>
                      <p className="text-slate-500 text-sm">Upload JSON or TXT files to start collaborating in real-time.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              files.map(file => (
                <tr 
                  key={file.id} 
                  className="group hover:bg-slate-800/30 transition-colors cursor-pointer border-b border-slate-800/50"
                  onClick={() => onEdit(file.id)}
                >
                  <td className="py-3 px-6">{getFileIcon(file.type)}</td>
                  <td className="py-3 px-2 font-medium text-slate-200">
                    <span className="hover:text-blue-400 transition-colors">{file.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{formatDate(file.lastModified)}</td>
                  <td className="py-3 px-4 text-slate-500 uppercase">{file.type}</td>
                  <td className="py-3 px-4 text-slate-400 text-right font-mono text-xs">{formatSize(file.size)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(file.id); }}
                        className="p-1.5 hover:bg-blue-500/20 hover:text-blue-400 rounded transition-colors"
                        title="Edit file"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(file.id); }}
                        className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors"
                        title="Delete file"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileExplorer;

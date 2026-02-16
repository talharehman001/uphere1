
import React, { useState } from 'react';
import { FileItem } from '../types';

interface ApiDocsProps {
  files: FileItem[];
  roomId: string;
}

const ApiDocs: React.FC<ApiDocsProps> = ({ files, roomId }) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'raw'>('docs');
  const baseUrl = window.location.origin;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col bg-[#0d0e12] overflow-auto">
      <div className="p-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">LiveSync REST API</h1>
            <p className="text-slate-400">বাইরের যেকোনো সার্ভিস থেকে আপনার এই ড্রাইভটি অ্যাক্সেস করুন।</p>
          </div>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setActiveTab('docs')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'docs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              API Docs
            </button>
            <button 
              onClick={() => setActiveTab('raw')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'raw' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Raw State
            </button>
          </div>
        </div>

        {activeTab === 'docs' ? (
          <div className="space-y-10">
            {/* List Files */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 text-[10px] font-bold rounded">GET</span>
                  <code className="text-slate-200 text-xs font-mono">/api/files?room={roomId}</code>
                </div>
                <button onClick={() => copyToClipboard(`${baseUrl}/api/files?room=${roomId}`)} className="text-slate-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-400 mb-4">সবগুলো ফাইলের তালিকা JSON ফরম্যাটে রিটার্ন করে।</p>
                <div className="bg-black/40 p-4 rounded-lg font-mono text-xs text-blue-400">
                  curl "{baseUrl}/api/files?room={roomId}"
                </div>
              </div>
            </section>

            {/* Download File */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 text-[10px] font-bold rounded">GET</span>
                  <code className="text-slate-200 text-xs font-mono">/api/download?room={roomId}&file=FILENAME</code>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-400 mb-4">ফাইলের র-কন্টেন্ট (Plain Text) ডাউনলোড করার জন্য এন্ডপয়েন্ট।</p>
                <div className="bg-black/40 p-4 rounded-lg font-mono text-xs text-blue-400">
                  {baseUrl}/api/download?room={roomId}&file=test.txt
                </div>
              </div>
            </section>

            {/* Upload File */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-[10px] font-bold rounded">POST</span>
                  <code className="text-slate-200 text-xs font-mono">/api/upload</code>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-400 mb-4">নতুন ফাইল যুক্ত করতে বা আপডেট করতে নিচের মতো বডি পাঠিয়ে রিকোয়েস্ট করুন।</p>
                <pre className="bg-black/40 p-4 rounded-lg font-mono text-xs text-amber-400 overflow-x-auto">
{`// Request Body (JSON)
{
  "room": "${roomId}",
  "filename": "hello.txt",
  "content": "This is from external API"
}`}
                </pre>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Live Client JSON</h2>
            <div className="bg-black/50 border border-slate-800 rounded-xl p-6 font-mono text-xs text-green-400 max-h-[600px] overflow-auto">
              <pre>{JSON.stringify(files, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDocs;

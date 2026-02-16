
import React, { useState } from 'react';
import { FileItem } from '../types';

interface ApiDocsProps {
  files: FileItem[];
  roomId: string;
}

const ApiDocs: React.FC<ApiDocsProps> = ({ files, roomId }) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'tester' | 'raw'>('docs');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testRoomId, setTestRoomId] = useState(roomId);
  const [testFilename, setTestFilename] = useState('');
  const [testContent, setTestContent] = useState('Hello from API Tester!');
  
  const baseUrl = window.location.origin;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const runApiTest = async (endpoint: string, method: string = 'GET') => {
    setIsLoading(true);
    setTestResponse(null);
    try {
      let url = `${baseUrl}/api/${endpoint}`;
      let options: RequestInit = { method };

      if (method === 'GET' || method === 'DELETE') {
        const params = new URLSearchParams({ room: testRoomId });
        if (testFilename) params.append('file', testFilename);
        url += `?${params.toString()}`;
      } else if (method === 'POST') {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify({
          room: testRoomId,
          filename: testFilename || 'test_api.txt',
          content: testContent
        });
      }

      const res = await fetch(url, options);
      const data = await res.json().catch(() => ({ error: 'Failed to parse JSON' }));
      setTestResponse({
        status: res.status,
        statusText: res.statusText,
        data
      });
    } catch (err: any) {
      setTestResponse({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0d0e12] overflow-auto">
      <div className="p-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">LiveSync Developer Hub</h1>
            <p className="text-slate-400">API কল করুন এবং রিয়েল-টাইম রেসপন্স চেক করুন।</p>
          </div>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            {['docs', 'tester', 'raw'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                  activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'tester' ? 'API Tester' : tab === 'docs' ? 'Documentation' : 'Raw Data'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'docs' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* Documentation Sections (Existing) */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 text-[10px] font-bold rounded">GET</span>
                  <code className="text-slate-200 text-xs font-mono">/api/files?room={roomId}</code>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-400 mb-4">রুমের সব ফাইলের মেটাডেটা লিস্ট রিটার্ন করে।</p>
                <div className="bg-black/40 p-4 rounded-lg font-mono text-xs text-blue-400 flex justify-between items-center">
                  <span>curl "{baseUrl}/api/files?room={roomId}"</span>
                  <button onClick={() => copyToClipboard(`curl "${baseUrl}/api/files?room=${roomId}"`)} className="hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  </button>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-[10px] font-bold rounded">POST</span>
                  <code className="text-slate-200 text-xs font-mono">/api/upload</code>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-400 mb-4">নতুন ফাইল আপলোড বা আপডেট করার জন্য ব্যবহার করুন।</p>
                <pre className="bg-black/40 p-4 rounded-lg font-mono text-xs text-amber-400 overflow-x-auto">
{`{
  "room": "${roomId}",
  "filename": "demo.txt",
  "content": "Hello World"
}`}
                </pre>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'tester' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Tester Controls */}
            <div className="space-y-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
                  API Configuration
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block">Room ID</label>
                    <input 
                      type="text" 
                      value={testRoomId} 
                      onChange={(e) => setTestRoomId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-blue-400 font-mono focus:border-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block">Filename (for Download/Delete/Upload)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. test.txt"
                      value={testFilename} 
                      onChange={(e) => setTestFilename(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block">POST Body Content</label>
                    <textarea 
                      value={testContent} 
                      onChange={(e) => setTestContent(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-blue-600 outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button 
                    disabled={isLoading}
                    onClick={() => runApiTest('files')}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    List Files (GET)
                  </button>
                  <button 
                    disabled={isLoading || !testFilename}
                    onClick={() => runApiTest('download')}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Download (GET)
                  </button>
                  <button 
                    disabled={isLoading}
                    onClick={() => runApiTest('upload', 'POST')}
                    className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    Upload (POST)
                  </button>
                  <button 
                    disabled={isLoading || !testFilename}
                    onClick={() => runApiTest('delete', 'DELETE')}
                    className="py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Delete (DEL)
                  </button>
                </div>
              </div>
            </div>

            {/* Response Terminal */}
            <div className="flex flex-col h-full min-h-[400px]">
              <div className="flex-1 bg-black rounded-xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
                <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 ml-2 tracking-widest">Server Response</span>
                  </div>
                  {testResponse && (
                    <button 
                      onClick={() => setTestResponse(null)}
                      className="text-[10px] text-slate-500 hover:text-white uppercase font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed">
                  {isLoading ? (
                    <div className="flex items-center gap-3 text-blue-400 animate-pulse">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Waiting for server...</span>
                    </div>
                  ) : testResponse ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          testResponse.status < 300 ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                        }`}>
                          HTTP {testResponse.status}
                        </span>
                        <span className="text-slate-500">{testResponse.statusText}</span>
                      </div>
                      <pre className="text-green-400 whitespace-pre-wrap">
                        {JSON.stringify(testResponse.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-slate-600 italic">
                      // Select an operation to test the API endpoint.
                      <br />// Results will appear here in real-time.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Live Client State (JSON)
            </h2>
            <div className="bg-black/50 border border-slate-800 rounded-xl p-6 font-mono text-xs text-indigo-300 max-h-[600px] overflow-auto shadow-inner">
              <pre>{JSON.stringify({
                room: roomId,
                clientTimestamp: new Date().toISOString(),
                files: files
              }, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDocs;

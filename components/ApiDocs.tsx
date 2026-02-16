
import React, { useState } from 'react';
import { FileItem } from '../types';

interface ApiDocsProps {
  files: FileItem[];
  roomId: string;
}

interface RequestLog {
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
}

const ApiDocs: React.FC<ApiDocsProps> = ({ files, roomId }) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'tester' | 'raw'>('tester');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testRoomId, setTestRoomId] = useState(roomId);
  const [testFilename, setTestFilename] = useState('');
  const [testContent, setTestContent] = useState('Hello from LiveSync API Tester!');
  const [requestHistory, setRequestHistory] = useState<RequestLog[]>([]);
  
  const baseUrl = window.location.origin;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const runApiTest = async (endpoint: string, method: string = 'GET') => {
    setIsLoading(true);
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
          filename: testFilename || 'api_test.txt',
          content: testContent
        });
      }

      const startTime = Date.now();
      const res = await fetch(url, options);
      const data = await res.json().catch(() => ({ error: 'Failed to parse JSON' }));
      
      const responseData = {
        status: res.status,
        statusText: res.statusText,
        latency: `${Date.now() - startTime}ms`,
        method,
        url: url.replace(baseUrl, ''),
        data
      };

      setTestResponse(responseData);
      
      // Update History
      const log: RequestLog = {
        timestamp: new Date().toLocaleTimeString(),
        method,
        endpoint: `/api/${endpoint}`,
        status: res.status
      };
      setRequestHistory(prev => [log, ...prev].slice(0, 5));
    } catch (err: any) {
      setTestResponse({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0d0e12] overflow-auto">
      <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Developer Hub</h1>
            <p className="text-slate-400 text-sm">সরাসরি ব্রাউজার থেকে API টেস্ট করুন এবং রেসপন্স বক্স চেক করুন।</p>
          </div>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            {['docs', 'tester', 'raw'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                  activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab === 'tester' ? 'API Tester' : tab === 'docs' ? 'Documentation' : 'Raw Data'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'tester' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Left side: Inputs */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                  Parameters
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block tracking-widest">Room ID</label>
                    <input 
                      type="text" 
                      value={testRoomId} 
                      onChange={(e) => setTestRoomId(e.target.value)}
                      className="w-full bg-black/40 border border-slate-800 rounded-lg py-2.5 px-4 text-sm text-blue-400 font-mono focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block tracking-widest">Filename</label>
                    <input 
                      type="text" 
                      placeholder="e.g. hello.txt"
                      value={testFilename} 
                      onChange={(e) => setTestFilename(e.target.value)}
                      className="w-full bg-black/40 border border-slate-800 rounded-lg py-2.5 px-4 text-sm text-slate-200 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block tracking-widest">Body Content (POST)</label>
                    <textarea 
                      value={testContent} 
                      onChange={(e) => setTestContent(e.target.value)}
                      rows={3}
                      className="w-full bg-black/40 border border-slate-800 rounded-lg py-2.5 px-4 text-sm text-slate-300 focus:border-blue-600 outline-none resize-none font-mono transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-8">
                  <button 
                    disabled={isLoading}
                    onClick={() => runApiTest('files')}
                    className="py-3 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    GET Files
                  </button>
                  <button 
                    disabled={isLoading || !testFilename}
                    onClick={() => runApiTest('download')}
                    className="py-3 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    GET Download
                  </button>
                  <button 
                    disabled={isLoading}
                    onClick={() => runApiTest('upload', 'POST')}
                    className="col-span-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
                  >
                    POST Upload / Update
                  </button>
                  <button 
                    disabled={isLoading || !testFilename}
                    onClick={() => runApiTest('delete', 'DELETE')}
                    className="col-span-2 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-900/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    DELETE File
                  </button>
                </div>
              </div>

              {/* Mini History */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
                 <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest">Recent Activity</h4>
                 <div className="space-y-1.5">
                   {requestHistory.map((log, i) => (
                     <div key={i} className="flex items-center justify-between text-[10px] font-mono p-1.5 rounded bg-black/20">
                       <span className={log.status < 300 ? 'text-green-500' : 'text-red-500'}>{log.status}</span>
                       <span className="text-slate-400">{log.method}</span>
                       <span className="text-slate-500 truncate max-w-[100px]">{log.endpoint}</span>
                       <span className="text-slate-600">{log.timestamp}</span>
                     </div>
                   ))}
                   {requestHistory.length === 0 && <div className="text-[10px] text-slate-600 italic">No requests yet.</div>}
                 </div>
              </div>
            </div>

            {/* Right side: Console Box */}
            <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
              <div className="flex-1 bg-[#050505] rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
                <div className="h-10 bg-slate-900/80 border-b border-slate-800 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/30"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/30"></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Response Console</span>
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
                
                <div className="flex-1 p-6 overflow-auto font-mono text-[13px] leading-relaxed relative">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-blue-500/50">
                      <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-xs uppercase font-bold animate-pulse tracking-widest">Awaiting Response...</span>
                    </div>
                  ) : testResponse ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-[10px] font-bold">STATUS:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            testResponse.status < 300 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                          }`}>
                            {testResponse.status} {testResponse.statusText}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-[10px] font-bold">TIME:</span>
                          <span className="text-blue-400 text-[10px]">{testResponse.latency}</span>
                        </div>
                      </div>
                      
                      {/* P2P Warning if result is empty on a file list */}
                      {testResponse.data?.count === 0 && testResponse.url?.includes('files') && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-200/70 mb-4">
                          <span className="font-bold text-amber-500 block mb-1">ℹ️ P2P Sync Notice:</span>
                          ফাইল আপলোড করার পর রিলে সার্ভারের মাধ্যমে এই এপিআই-তে আসতে ৫-১০ সেকেন্ড সময় লাগতে পারে। অনুগ্রহ করে একটু পর আবার চেষ্টা করুন।
                        </div>
                      )}

                      <pre className="text-blue-300 filter drop-shadow-sm">
                        {JSON.stringify(testResponse.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none select-none">
                       <svg className="w-20 h-20 text-slate-700 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14 19l5 5 5-5M14 5l5-5 5 5M3 12h14M3 6h7M3 18h10"/></svg>
                       <p className="text-slate-500 text-center max-w-xs text-xs">বামের প্যারামিটার সেট করে একটি রিকোয়েস্ট করুন। আউটপুট এখানে প্রদর্শিত হবে।</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs remain simple or as before */}
        {activeTab === 'docs' && (
          <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
            <h2 className="text-2xl font-bold text-white">Endpoints Documentation</h2>
            <div className="grid gap-4">
              {[
                { method: 'GET', path: '/api/files?room=ROOM_ID', desc: 'রুমের সকল ফাইলের মেটাডেটা লিস্ট দেয়।' },
                { method: 'GET', path: '/api/download?room=ROOM_ID&file=FILE_NAME', desc: 'ফাইলের মূল টেক্সট কন্টেন্ট সরাসরি ডাউনলোড করতে।' },
                { method: 'POST', path: '/api/upload', desc: 'JSON বডি দিয়ে ফাইল তৈরি বা আপডেট করতে।' },
                { method: 'DELETE', path: '/api/delete?room=ROOM_ID&file=FILE_NAME', desc: 'নেটওয়ার্ক থেকে ফাইলটি স্থায়ীভাবে মুছে ফেলতে।' }
              ].map((api, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${api.method === 'GET' ? 'bg-green-500/20 text-green-500' : api.method === 'POST' ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>{api.method}</span>
                    <code className="text-slate-200 font-mono text-sm">{api.path}</code>
                  </div>
                  <p className="text-slate-400 text-xs">{api.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="bg-black/50 border border-slate-800 rounded-2xl p-8 font-mono text-xs text-indigo-300 max-h-[600px] overflow-auto shadow-inner animate-in fade-in duration-500">
             <div className="text-[10px] uppercase font-bold text-slate-500 mb-4 tracking-[0.3em]">Current Browser Instance State</div>
             <pre>{JSON.stringify({
               room: roomId,
               activeFiles: files.length,
               localTimestamp: new Date().toISOString(),
               files: files
             }, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDocs;

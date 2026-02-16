
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Gun from 'gun';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { room } = req.query;
  if (!room) return res.status(400).json({ error: 'Room ID is required' });

  const gun = new Gun({
    peers: [
      'https://gun-manhattan.herokuapp.com/gun',
      'https://relay.peer.ooo/gun'
    ],
    web: false,
    radisk: false,
    localStorage: false
  });

  const filesMap = new Map();
  const db = gun.get('livesync-v1').get(room as string).get('files');

  // We use a longer timeout for serverless to ensure the graph discovery happens
  await new Promise(resolve => {
    db.map().once((data, id) => {
      if (data && data.name) {
        filesMap.set(id, {
          name: data.name,
          size: data.size || 0,
          type: data.type || 'TXT',
          modified: data.lastModified ? new Date(data.lastModified).toISOString() : new Date().toISOString()
        });
      }
    });
    // 3 seconds is usually enough for a cold start discovery on these relays
    setTimeout(resolve, 3000);
  });

  const files = Array.from(filesMap.values());
  res.status(200).json({ files });
}

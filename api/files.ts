
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Gun from 'gun';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { room } = req.query;
  if (!room) return res.status(400).json({ error: 'Room ID is required' });

  try {
    const gun = new Gun({
      peers: [
        'https://gun-manhattan.herokuapp.com/gun',
        'https://relay.peer.ooo/gun',
        'https://gun-us.herokuapp.com/gun'
      ],
      web: false,
      radisk: false,
      localStorage: false,
      axe: false
    });

    const filesMap = new Map();
    const db = gun.get('livesync-v1').get(room as string).get('files');

    // Start a collection period
    await new Promise(resolve => {
      let timeout = setTimeout(resolve, 4000); // Wait 4 seconds for P2P discovery
      
      db.map().once((data, id) => {
        if (data && data.name) {
          filesMap.set(id, {
            name: data.name,
            size: data.size || 0,
            type: data.type || 'TXT',
            modified: data.lastModified ? new Date(data.lastModified).toISOString() : new Date().toISOString()
          });
          // If we find many files, we can resolve early, but in serverless usually wait
        }
      });
    });

    const files = Array.from(filesMap.values());
    res.status(200).json({ 
      files, 
      count: files.length,
      room: room 
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

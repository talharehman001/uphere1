
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
    // We must ensure Gun doesn't try to write to the read-only file system on Vercel
    const gun = new Gun({
      peers: [
        'https://gun-manhattan.herokuapp.com/gun',
        'https://relay.peer.ooo/gun',
        'https://gun-us.herokuapp.com/gun'
      ],
      web: false,
      radisk: false,
      localStorage: false,
      axe: false,
      file: false // CRITICAL: Stop Gun from creating 'radata' folder
    });

    const filesMap = new Map();
    const db = gun.get('livesync-v1').get(room as string).get('files');

    await new Promise(resolve => {
      const timeout = setTimeout(resolve, 5000); 
      
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

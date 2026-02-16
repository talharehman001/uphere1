
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Gun from 'gun';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { room, file } = req.query;
  if (!room || !file) return res.status(400).json({ error: 'Room and file name required' });

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

    let fileContent: string | null = null;
    const db = gun.get('livesync-v1').get(room as string).get('files');

    await new Promise(resolve => {
      const timeout = setTimeout(resolve, 4500);
      
      db.map().once((data: any) => {
        if (data && data.name === file) {
          fileContent = data.content;
          clearTimeout(timeout);
          resolve(null);
        }
      });
    });

    if (fileContent === null) {
      return res.status(404).json({ 
        error: 'File not found', 
        message: `Could not find file '${file}' in room '${room}'. Check for typos or wait for sync.` 
      });
    }
    
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(fileContent);
  } catch (err: any) {
    res.status(500).json({ error: 'Download failed', details: err.message });
  }
}

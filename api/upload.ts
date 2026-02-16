
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Gun from 'gun';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { room, filename, content } = req.body;
  if (!room || !filename || content === undefined) {
    return res.status(400).json({ error: 'Missing room, filename or content' });
  }

  const gun = new Gun({
    peers: ['https://gun-manhattan.herokuapp.com/gun', 'https://relay.peer.ooo/gun'],
    web: false
  });

  const id = Math.random().toString(36).substr(2, 9);
  const fileData = {
    name: filename,
    content: content,
    lastModified: Date.now(),
    size: new TextEncoder().encode(content).length,
    type: filename.split('.').pop()?.toUpperCase() || 'TXT'
  };

  gun.get('livesync-v1').get(room).get('files').get(id).put(fileData as any);

  res.status(200).json({ success: true, message: 'File uploaded to P2P mesh', id });
}

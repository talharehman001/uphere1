
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Gun from 'gun';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { room, file } = req.query;
  if (!room || !file) return res.status(400).json({ error: 'Room and file name required' });

  const gun = new Gun({
    peers: [
      'https://gun-manhattan.herokuapp.com/gun',
      'https://relay.peer.ooo/gun'
    ],
    web: false,
    radisk: false,
    localStorage: false
  });

  let content = null;
  const db = gun.get('livesync-v1').get(room as string).get('files');

  await new Promise(resolve => {
    db.map().once((data: any) => {
      if (data && data.name === file) {
        content = data.content;
        resolve(null);
      }
    });
    // Stop waiting after 4 seconds if not found
    setTimeout(resolve, 4000);
  });

  if (content === null) {
    return res.status(404).json({ error: 'File not found in this room. Make sure the filename matches exactly.' });
  }
  
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(content);
}

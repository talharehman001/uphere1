
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Gun from 'gun';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { room } = req.query;
  if (!room) return res.status(400).json({ error: 'Room ID is required' });

  const gun = new Gun({
    peers: ['https://gun-manhattan.herokuapp.com/gun', 'https://relay.peer.ooo/gun'],
    web: false
  });

  const files: any[] = [];
  const db = gun.get('livesync-v1').get(room as string).get('files');

  // Wait 2 seconds to gather data from P2P network
  await new Promise(resolve => {
    db.map().once((data, id) => {
      if (data) {
        files.push({
          name: data.name,
          size: data.size,
          type: data.type,
          modified: new Date(data.lastModified).toISOString()
        });
      }
    });
    setTimeout(resolve, 2000);
  });

  res.status(200).json({ files });
}

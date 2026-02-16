
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Gun from 'gun';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { room, file } = req.query;

  if (!room || !file) return res.status(400).json({ error: 'Missing room or file name' });

  const gun = new Gun({
    peers: [
      'https://gun-manhattan.herokuapp.com/gun',
      'https://relay.peer.ooo/gun'
    ],
    web: false,
    radisk: false,
    localStorage: false
  });

  const db = gun.get('livesync-v1').get(room as string).get('files');
  let foundId = null;

  await new Promise(resolve => {
    db.map().once((data: any, id: string) => {
      if (data && data.name === file) {
        foundId = id;
        db.get(id).put(null as any, () => resolve(null));
      }
    });
    setTimeout(resolve, 2500);
  });

  if (foundId) {
    res.status(200).json({ success: true, message: `File '${file}' deleted from room '${room}'` });
  } else {
    res.status(404).json({ error: 'File not found or delete signal timed out' });
  }
}

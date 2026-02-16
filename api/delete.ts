
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Gun from 'gun';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { room, file } = req.query;

  if (!room || !file) return res.status(400).json({ error: 'Missing room or file name' });

  const gun = new Gun({
    peers: ['https://gun-manhattan.herokuapp.com/gun', 'https://relay.peer.ooo/gun'],
    web: false
  });

  const db = gun.get('livesync-v1').get(room as string).get('files');
  
  // Need to find the internal Gun key first
  db.map().once((data: any, id: string) => {
    if (data && data.name === file) {
      db.get(id).put(null as any);
    }
  });

  setTimeout(() => {
    res.status(200).json({ success: true, message: 'Delete signal broadcasted' });
  }, 1500);
}

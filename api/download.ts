
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Gun from 'gun';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { room, file } = req.query;

  if (!room || !file) return res.status(400).json({ error: 'Room and file name required' });

  const gun = new Gun({
    peers: ['https://gun-manhattan.herokuapp.com/gun', 'https://relay.peer.ooo/gun'],
    web: false
  });

  let content = '';
  const db = gun.get('livesync-v1').get(room as string).get('files');

  await new Promise(resolve => {
    db.map().once((data: any) => {
      if (data && data.name === file) {
        content = data.content;
      }
    });
    setTimeout(resolve, 2500);
  });

  if (!content) return res.status(404).send('File not found or empty');
  
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(content);
}

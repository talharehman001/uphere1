
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Gun from 'gun';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { room, filename, content } = req.body;
  if (!room || !filename || content === undefined) {
    return res.status(400).json({ error: 'Missing room, filename or content' });
  }

  const gun = new Gun({
    peers: [
      'https://gun-manhattan.herokuapp.com/gun',
      'https://relay.peer.ooo/gun'
    ],
    web: false,
    radisk: false,
    localStorage: false
  });

  // Create a deterministic key based on name and room if you want to overwrite, 
  // or a random one for new entries. We'll try to find if it exists first.
  const filesRef = gun.get('livesync-v1').get(room).get('files');
  let existingId = null;

  // Attempt to find if filename already exists to update instead of duplicate
  await new Promise(resolve => {
    filesRef.map().once((data, id) => {
      if (data && data.name === filename) {
        existingId = id;
      }
    });
    setTimeout(resolve, 1500);
  });

  const id = existingId || Math.random().toString(36).substr(2, 9);
  const fileData = {
    name: filename,
    content: content,
    lastModified: Date.now(),
    size: new TextEncoder().encode(content).length,
    type: filename.split('.').pop()?.toUpperCase() || 'TXT'
  };

  try {
    await new Promise((resolve, reject) => {
      // Gun.put has a callback that triggers when the message is sent/acked
      filesRef.get(id).put(fileData as any, (ack: any) => {
        if (ack.err) reject(ack.err);
        else resolve(ack);
      });
      // Safety timeout for the put operation
      setTimeout(resolve, 3000);
    });

    res.status(200).json({ 
      success: true, 
      message: existingId ? 'File updated successfully' : 'File uploaded successfully',
      id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync with P2P network', details: String(error) });
  }
}

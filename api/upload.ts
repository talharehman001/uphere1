
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
      axe: false,
      file: false
    });

    const filesRef = gun.get('livesync-v1').get(room).get('files');
    let existingId: string | null = null;

    // Discovery phase - try to find if file already exists
    await new Promise(resolve => {
      const timeout = setTimeout(resolve, 2000);
      filesRef.map().once((data, id) => {
        if (data && data.name === filename) {
          existingId = id;
          clearTimeout(timeout);
          resolve(null);
        }
      });
    });

    const id = existingId || Math.random().toString(36).substr(2, 9);
    const fileData = {
      name: filename,
      content: content,
      lastModified: Date.now(),
      size: typeof content === 'string' ? new TextEncoder().encode(content).length : 0,
      type: filename.split('.').pop()?.toUpperCase() || 'TXT'
    };

    // Put data into the mesh
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve({ ok: true, note: 'Signal broadcasted' });
      }, 5000);

      filesRef.get(id).put(fileData as any, (ack: any) => {
        if (ack.err) {
          clearTimeout(timeout);
          reject(ack.err);
        } else {
          clearTimeout(timeout);
          resolve(ack);
        }
      });
    });

    res.status(200).json({ 
      success: true, 
      message: existingId ? 'File updated' : 'File created',
      filename,
      id 
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}

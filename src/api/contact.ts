import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const body = req.body || {};
  const { name, email, phone, subject, message } = body;
  
  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: 'Please fill in all required fields.' });
    return;
  }
  
  // In a real app, this would save to a database
  res.json({ ok: true, id: Date.now() });
}
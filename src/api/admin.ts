import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query as { action: string };
  
  switch (action) {
    case 'me':
      res.json({ user: { id: 1, email: 'admin@yummytummy.com', name: 'Admin', role: 'super_admin' } });
      break;
    case 'login':
      const { email, password } = req.body || {};
      if (email && password) {
        res.json({ user: { id: 1, email, name: 'Admin', role: 'super_admin' } });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
      break;
    case 'logout':
      res.json({ ok: true });
      break;
    case 'dashboard':
      res.json({
        totalOrders: 12,
        pendingOrders: 3,
        completedOrders: 8,
        revenueUsd: 5420.00,
        productCount: 15,
        lowStockProducts: [],
        recentOrders: [],
        wholesaleEnquiriesCount: 5,
      });
      break;
    default:
      res.status(404).json({ error: 'Admin endpoint not found' });
  }
}
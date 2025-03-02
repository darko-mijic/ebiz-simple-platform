import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cookies } = req;
  const isAuthenticated = Boolean(cookies.auth_session);
  
  res.status(200).json({ isAuthenticated });
} 
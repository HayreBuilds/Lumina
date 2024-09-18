import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Simple check for NVIDIA_API_KEY as a proxy for 'is configured'
  if (!process.env.NVIDIA_API_KEY) {
    return res.status(500).json({ 
      error: 'NVIDIA API Key not configured on server' 
    });
  }
  next();
};

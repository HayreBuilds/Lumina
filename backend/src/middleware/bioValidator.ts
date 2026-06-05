import { Request, Response, NextFunction } from 'express';

export const validateAminoSequence = (req: Request, res: Response, next: NextFunction) => {
  const { sequence } = req.body;
  if (sequence && !/^[ACDEFGHIKLMNPQRSTVWY]+$/i.test(sequence)) {
    return res.status(400).json({ error: 'Invalid amino acid sequence' });
  }
  next();
};

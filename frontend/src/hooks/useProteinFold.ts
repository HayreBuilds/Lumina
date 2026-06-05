import { useState } from 'react';
import axios from 'axios';

export const useProteinFold = () => {
  const [pdb, setPdb] = useState<string | null>(null);
  const [folding, setFolding] = useState(false);

  const fold = async (sequence: string) => {
    setFolding(true);
    try {
      const res = await axios.post('/api/biology/protein-fold', { sequence });
      setPdb(res.data.pdbStructure);
      return res.data;
    } finally {
      setFolding(false);
    }
  };

  return { pdb, folding, fold };
};

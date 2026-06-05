export const parsePDBAtoms = (pdb: string) => {
  return pdb.split('\n')
    .filter(line => line.startsWith('ATOM'))
    .map(line => ({
      atom: line.slice(12, 16).trim(),
      residue: line.slice(17, 20).trim(),
      x: parseFloat(line.slice(30, 38)),
      y: parseFloat(line.slice(38, 46)),
      z: parseFloat(line.slice(46, 54)),
    }));
};

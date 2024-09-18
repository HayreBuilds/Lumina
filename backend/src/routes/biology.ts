import { Router, Request, Response } from "express";
import { foldProtein, generateMolecules, optimizeMolecule } from "../services/nvidia";

const router = Router();

// POST /api/biology/protein-fold
router.post("/protein-fold", async (req: Request, res: Response) => {
  try {
    const { sequence } = req.body;
    if (!sequence) return res.status(400).json({ error: "sequence (amino acid) is required" });
    if (sequence.length > 400) {
      return res.status(400).json({ error: "Sequence must be <= 400 amino acids for ESMFold" });
    }

    const pdb = await foldProtein(sequence);
    res.json({
      success: true,
      sequence,
      sequenceLength: sequence.length,
      pdbStructure: pdb,
      model: "esmfold",
      note: "PDB structure can be visualized with Mol* or PyMOL",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/biology/generate-molecules
router.post("/generate-molecules", async (req: Request, res: Response) => {
  try {
    const { smiles, numMolecules = 10, optimizeFor } = req.body;
    if (!smiles) return res.status(400).json({ error: "smiles is required" });

    const molecules = await generateMolecules(smiles, Math.min(numMolecules, 20));

    let optimized = null;
    if (optimizeFor) {
      optimized = await optimizeMolecule(smiles, optimizeFor);
    }

    res.json({
      success: true,
      inputSmiles: smiles,
      generatedMolecules: molecules,
      count: molecules.length,
      optimized,
      model: "genmol + molmim",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/biology/optimize-molecule
router.post("/optimize-molecule", async (req: Request, res: Response) => {
  try {
    const { smiles, property = "QED" } = req.body;
    if (!smiles) return res.status(400).json({ error: "smiles is required" });

    const result = await optimizeMolecule(smiles, property);
    res.json({ success: true, inputSmiles: smiles, property, result, model: "molmim" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

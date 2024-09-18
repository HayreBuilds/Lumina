import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  parseDocument,
  foldProtein,
  generateMolecules,
  optimizeMolecule,
  synthesizeLiterature,
  embedTexts,
  detectPII,
  generateMolecularVideo,
} from "../services/nvidia";

const router = Router();

// In-memory pipeline store (use a database in production)
const pipelines = new Map<string, Record<string, unknown>>();

// POST /api/pipeline/start - Start a full research pipeline
router.post("/start", async (req: Request, res: Response) => {
  try {
    const { question, documents = [], proteinSequence, moleculeSmiles } = req.body;

    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }

    const pipelineId = uuidv4();
    const pipeline: Record<string, unknown> = {
      id: pipelineId,
      status: "running",
      question,
      createdAt: new Date().toISOString(),
      steps: {},
    };

    pipelines.set(pipelineId, pipeline);

    // Return immediately with pipeline ID — process async
    res.status(202).json({ pipelineId, status: "running", message: "Pipeline started" });

    // Run pipeline asynchronously
    runPipelineAsync(pipelineId, question, documents, proteinSequence, moleculeSmiles).catch(
      (err) => {
        const p = pipelines.get(pipelineId);
        if (p) {
          p.status = "failed";
          p.error = err.message;
        }
      }
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function runPipelineAsync(
  pipelineId: string,
  question: string,
  documents: string[],
  proteinSequence?: string,
  moleculeSmiles?: string
) {
  const pipeline = pipelines.get(pipelineId)!;

  try {
    // Step 1 - PII check
    pipeline.steps = { ...(pipeline.steps as Record<string, unknown>), step1: { status: "running", name: "Safety & PII Check" } };
    const safetyResult = await detectPII(question);
    (pipeline.steps as any).step1 = { status: "complete", name: "Safety & PII Check", result: safetyResult };

    // Step 2 - Protein folding (if sequence provided)
    if (proteinSequence) {
      (pipeline.steps as any).step2 = { status: "running", name: "Protein Structure Prediction" };
      const pdbStructure = await foldProtein(proteinSequence);
      (pipeline.steps as any).step2 = {
        status: "complete",
        name: "Protein Structure Prediction",
        result: { pdb: pdbStructure.slice(0, 500) + "..." },
      };
    }

    // Step 3 - Molecule generation (if SMILES provided)
    if (moleculeSmiles) {
      (pipeline.steps as any).step3 = { status: "running", name: "Drug Candidate Generation" };
      const molecules = await generateMolecules(moleculeSmiles, 10);
      const optimized = await optimizeMolecule(moleculeSmiles, "QED");
      (pipeline.steps as any).step3 = {
        status: "complete",
        name: "Drug Candidate Generation",
        result: { molecules, optimized },
      };
    }

    // Step 4 - Literature synthesis
    (pipeline.steps as any).step4 = { status: "running", name: "Literature Synthesis (Nemotron-Ultra)" };
    const corpus = documents.join("\n\n---\n\n") || "No documents provided. Reason based on general biomedical knowledge.";
    const synthesis = await synthesizeLiterature(corpus, question);
    (pipeline.steps as any).step4 = {
      status: "complete",
      name: "Literature Synthesis",
      result: { synthesis },
    };

    // Step 5 - Embed synthesis for future retrieval
    (pipeline.steps as any).step5 = { status: "running", name: "Knowledge Embedding" };
    const embeddings = await embedTexts([synthesis]);
    (pipeline.steps as any).step5 = {
      status: "complete",
      name: "Knowledge Embedding",
      result: { dimensions: embeddings[0]?.length ?? 0 },
    };

    // Step 6 - Generate visualization video
    if (moleculeSmiles) {
      (pipeline.steps as any).step6 = { status: "running", name: "Molecular Visualization (Cosmos3)" };
      try {
        const video = await generateMolecularVideo(
          `Physics-accurate 3D molecular binding visualization: ${question}. Show the molecule interacting with the protein target in a scientific visualization style.`
        );
        (pipeline.steps as any).step6 = {
          status: "complete",
          name: "Molecular Visualization",
          result: { videoBase64: video.slice(0, 100) + "..." },
        };
      } catch {
        (pipeline.steps as any).step6 = { status: "skipped", name: "Molecular Visualization", note: "Video generation unavailable" };
      }
    }

    pipeline.status = "complete";
    pipeline.completedAt = new Date().toISOString();
    pipeline.summary = synthesis;
  } catch (err: any) {
    pipeline.status = "failed";
    pipeline.error = err.message;
  }
}

// GET /api/pipeline/:id/status
router.get("/:id/status", (req: Request, res: Response) => {
  const pipeline = pipelines.get(req.params.id);
  if (!pipeline) return res.status(404).json({ error: "Pipeline not found" });
  res.json({
    id: pipeline.id,
    status: pipeline.status,
    createdAt: pipeline.createdAt,
    completedAt: pipeline.completedAt,
    stepCount: Object.keys(pipeline.steps as object).length,
    steps: Object.entries(pipeline.steps as Record<string, any>).map(([k, v]) => ({
      id: k,
      name: v.name,
      status: v.status,
    })),
  });
});

// GET /api/pipeline/:id/results
router.get("/:id/results", (req: Request, res: Response) => {
  const pipeline = pipelines.get(req.params.id);
  if (!pipeline) return res.status(404).json({ error: "Pipeline not found" });
  res.json(pipeline);
});

// GET /api/pipeline - List all pipelines
router.get("/", (_req: Request, res: Response) => {
  const all = Array.from(pipelines.values()).map((p: any) => ({
    id: p.id,
    status: p.status,
    question: p.question,
    createdAt: p.createdAt,
    completedAt: p.completedAt,
  }));
  res.json({ pipelines: all.reverse() });
});

export default router;

import { Router, Request, Response } from "express";
import { synthesizeLiterature, embedTexts, rerankPassages } from "../services/nvidia";

const router = Router();

// POST /api/reasoning/synthesize
router.post("/synthesize", async (req: Request, res: Response) => {
  try {
    const { corpus, question, passages } = req.body;
    if (!question) return res.status(400).json({ error: "question is required" });

    // If passages provided, rerank first
    let rankedContext = corpus ?? "";
    if (passages && passages.length > 0) {
      const rankings = await rerankPassages(question, passages);
      const sorted = rankings
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((r) => passages[r.index]);
      rankedContext = sorted.join("\n\n---\n\n");
    }

    const synthesis = await synthesizeLiterature(rankedContext, question);
    const embeddings = await embedTexts([synthesis]);

    res.json({
      success: true,
      question,
      synthesis,
      contextLength: rankedContext.length,
      embeddingDimensions: embeddings[0]?.length ?? 0,
      model: "nemotron-3-ultra-550b-a55b",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reasoning/embed
router.post("/embed", async (req: Request, res: Response) => {
  try {
    const { texts } = req.body;
    if (!texts || !Array.isArray(texts)) return res.status(400).json({ error: "texts array required" });

    const embeddings = await embedTexts(texts);
    res.json({
      success: true,
      count: texts.length,
      dimensions: embeddings[0]?.length ?? 0,
      model: "nv-embedqa-e5-v5",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reasoning/rerank
router.post("/rerank", async (req: Request, res: Response) => {
  try {
    const { query, passages } = req.body;
    if (!query || !passages) return res.status(400).json({ error: "query and passages required" });

    const rankings = await rerankPassages(query, passages);
    const ranked = rankings
      .sort((a, b) => b.score - a.score)
      .map((r) => ({ passage: passages[r.index], score: r.score, originalIndex: r.index }));

    res.json({ success: true, query, ranked, model: "rerank-qa-mistral-4b" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import { Router, Request, Response } from "express";
import { detectPII, checkContentSafety } from "../services/nvidia";

const router = Router();

// POST /api/safety/check
router.post("/check", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    const [piiResult, safetyResult] = await Promise.allSettled([
      detectPII(text),
      checkContentSafety(text),
    ]);

    res.json({
      success: true,
      pii: piiResult.status === "fulfilled" ? piiResult.value : { error: (piiResult as PromiseRejectedResult).reason?.message },
      safety: safetyResult.status === "fulfilled" ? safetyResult.value : { error: (safetyResult as PromiseRejectedResult).reason?.message },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/safety/redact-pii
router.post("/redact-pii", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    const piiResult = await detectPII(text);
    res.json({ success: true, original: text, piiDetected: piiResult, model: "gliner-pii" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

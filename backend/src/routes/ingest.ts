import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { parseDocument, embedTexts } from "../services/nvidia";

const router = Router();

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_DIR ?? "./uploads",
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB ?? "50") * 1024 * 1024) },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".txt", ".csv"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

// POST /api/ingest/document
router.post("/document", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    const fileBuffer = fs.readFileSync(req.file.path);
    const base64 = fileBuffer.toString("base64");
    const mimeType = req.file.mimetype;

    // Parse with NemoRetriever
    const parsed = await parseDocument(base64, mimeType);

    // Embed for semantic search
    const embeddings = await embedTexts([parsed]);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      filename: req.file.originalname,
      mimeType,
      parsedContent: parsed,
      contentLength: parsed.length,
      embeddingDimensions: embeddings[0]?.length ?? 0,
      preview: parsed.slice(0, 500),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ingest/text
router.post("/text", async (req: Request, res: Response) => {
  try {
    const { text, source } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    const embeddings = await embedTexts([text]);

    res.json({
      success: true,
      source: source ?? "manual",
      contentLength: text.length,
      embeddingDimensions: embeddings[0]?.length ?? 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import { Router, Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import { analyzeMedicalImage } from "../services/nvidia";

const router = Router();
const upload = multer({ dest: process.env.UPLOAD_DIR ?? "./uploads" });

// POST /api/vision/analyze-image
router.post("/analyze-image", upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file && !req.body.base64Image) {
      return res.status(400).json({ error: "image file or base64Image required" });
    }

    const prompt = req.body.prompt ?? "Analyze this medical image. Describe all visible structures, anomalies, and findings in scientific detail.";

    let base64: string;
    if (req.file) {
      base64 = fs.readFileSync(req.file.path).toString("base64");
      fs.unlinkSync(req.file.path);
    } else {
      base64 = req.body.base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
    }

    const analysis = await analyzeMedicalImage(base64, prompt);

    res.json({
      success: true,
      prompt,
      analysis,
      model: "llama-3.2-90b-vision-instruct",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

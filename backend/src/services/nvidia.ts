import fetch from "node-fetch";
import FormData from "form-data";

const BASE_URL = "https://integrate.api.nvidia.com/v1";
const BIOLOGY_BASE = "https://health.api.nvidia.com/v1";

export function getNvidiaApiKey(): string {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) throw new Error("NVIDIA_API_KEY environment variable is not set");
  return key;
}

async function nvidiaChat(
  model: string,
  messages: { role: string; content: string }[],
  options: Record<string, unknown> = {}
): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getNvidiaApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, max_tokens: 4096, ...options }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`NVIDIA API error ${res.status}: ${err}`);
  }
  const data = (await res.json()) as any;
  return data.choices?.[0]?.message?.content ?? "";
}

async function nvidiaEmbedding(model: string, input: string[]): Promise<number[][]> {
  const res = await fetch(`${BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getNvidiaApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, input, input_type: "query" }),
  });
  if (!res.ok) throw new Error(`Embedding API error ${res.status}`);
  const data = (await res.json()) as any;
  return data.data.map((d: any) => d.embedding);
}

// Document parsing with NemoRetriever
export async function parseDocument(base64Content: string, mimeType: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/nvidia/nemoretriever-parse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getNvidiaApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: `data:${mimeType};base64,${base64Content}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`NemoRetriever parse error ${res.status}`);
  const data = (await res.json()) as any;
  return data.choices?.[0]?.message?.content ?? "";
}

// Medical image analysis with LLaMA-3.2-90b-Vision
export async function analyzeMedicalImage(base64Image: string, prompt: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getNvidiaApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta/llama-3.2-90b-vision-instruct",
      messages: [
        {
          role: "user",
          content: `${prompt} <img src="data:image/jpeg;base64,${base64Image}" />`,
        },
      ],
      max_tokens: 2048,
    }),
  });
  if (!res.ok) throw new Error(`Vision API error ${res.status}`);
  const data = (await res.json()) as any;
  return data.choices?.[0]?.message?.content ?? "";
}

// ESMFold - Protein Structure Prediction
export async function foldProtein(sequence: string): Promise<string> {
  const res = await fetch(`${BIOLOGY_BASE}/biology/ipd/esmfold/v1/multimer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getNvidiaApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sequence }),
  });
  if (!res.ok) throw new Error(`ESMFold error ${res.status}`);
  const data = (await res.json()) as any;
  return data.pdbs?.[0] ?? data.pdb ?? JSON.stringify(data);
}

// GenMol - Generate drug molecules
export async function generateMolecules(
  smiles: string,
  numMolecules: number = 10
): Promise<string[]> {
  const res = await fetch(`${BIOLOGY_BASE}/biology/nvidia/genmol/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getNvidiaApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      smi: smiles,
      num_molecules: numMolecules,
      unique: true,
      sanitize: true,
    }),
  });
  if (!res.ok) throw new Error(`GenMol error ${res.status}`);
  const data = (await res.json()) as any;
  return data.molecules ?? [];
}

// MolMIM - Molecule property optimization
export async function optimizeMolecule(
  smiles: string,
  property: string
): Promise<Record<string, unknown>> {
  const res = await fetch(`${BIOLOGY_BASE}/biology/nvidia/molmim/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getNvidiaApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      smi: smiles,
      num_molecules: 5,
      property_name: property,
      iterations: 10,
    }),
  });
  if (!res.ok) throw new Error(`MolMIM error ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

// Nemotron-Ultra - Deep literature reasoning (1M context)
export async function synthesizeLiterature(
  corpus: string,
  question: string
): Promise<string> {
  return nvidiaChat("nvidia/nemotron-3-ultra-550b-a55b", [
    {
      role: "system",
      content:
        "You are a world-class scientific research analyst. You synthesize complex research literature and identify novel connections, gaps, and opportunities. Be precise, cite specific findings, and generate actionable insights.",
    },
    {
      role: "user",
      content: `Research Corpus:\n\n${corpus}\n\n---\n\nQuestion: ${question}\n\nProvide a comprehensive synthesis including: key findings, novel connections, knowledge gaps, and recommended next steps.`,
    },
  ]);
}

// Embeddings for semantic search
export async function embedTexts(texts: string[]): Promise<number[][]> {
  return nvidiaEmbedding("nvidia/nv-embedqa-e5-v5", texts);
}

// GLiNER - PII Detection
export async function detectPII(text: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE_URL}/nvidia/gliner-pii`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getNvidiaApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: text }),
  });
  if (!res.ok) throw new Error(`GLiNER error ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

// Content Safety
export async function checkContentSafety(text: string): Promise<Record<string, unknown>> {
  return (await nvidiaChat("nvidia/nemotron-3.5-content-safety", [
    { role: "user", content: text },
  ])) as unknown as Record<string, unknown>;
}

// Reranking
export async function rerankPassages(
  query: string,
  passages: string[]
): Promise<Array<{ index: number; score: number }>> {
  const res = await fetch(`${BASE_URL}/rankings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getNvidiaApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/rerank-qa-mistral-4b",
      query: { text: query },
      passages: passages.map((p) => ({ text: p })),
      truncate: "END",
    }),
  });
  if (!res.ok) throw new Error(`Rerank error ${res.status}`);
  const data = (await res.json()) as any;
  return data.rankings ?? [];
}

// Cosmos3-Nano - Physics-aware video generation
export async function generateMolecularVideo(
  prompt: string
): Promise<string> {
  const res = await fetch(`${BASE_URL}/nvidia/cosmos3-nano`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getNvidiaApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      cfg_scale: 7,
      num_frames: 49,
    }),
  });
  if (!res.ok) throw new Error(`Cosmos error ${res.status}`);
  const data = (await res.json()) as any;
  return data.video ?? data.artifacts?.[0]?.base64 ?? "";
}

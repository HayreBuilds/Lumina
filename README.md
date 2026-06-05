[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![NVIDIA NIM](https://img.shields.io/badge/NVIDIA-NIM-76B900?logo=nvidia&logoColor=white)](https://build.nvidia.com) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/HayreBuilds/lumina/pulls)

# LUMINA — AI-Powered Research-to-Treatment Platform

> Compress the 12-year drug discovery pipeline into hours using NVIDIA NIM AI orchestration.

LUMINA orchestrates 28 NVIDIA NIM endpoints into a coherent research-to-treatment pipeline. Upload scientific papers, protein sequences, or clinical questions — LUMINA returns drug candidates, protein structures, literature synthesis, and multimedia briefings automatically.

## Features

- **Document Intelligence** — Parse PDFs, extract tables, charts, and figures using NemoRetriever
- **Protein Structure Prediction** — ESMFold 3D structure prediction from amino acid sequences
- **Drug Molecule Generation** — GenMol + MolMIM for novel drug candidate synthesis
- **Medical Image Analysis** — LLaMA-3.2-Vision for X-rays, MRI scans, microscopy
- **1M-Context Literature Synthesis** — Nemotron-Ultra reasons across entire research corpora
- **Voice Research Briefs** — Magpie TTS with zero-shot voice cloning
- **Multilingual Delivery** — RIVA translation in 36+ languages
- **Molecular Visualization Video** — Cosmos3-Nano physics-aware 3D videos
- **Safety & Compliance** — GLiNER PII redaction + NemoGuard content safety

## Architecture

```
User Input (papers/sequences/images)
        ↓
┌─────────────────────────────────────┐
│         Ingestion Layer             │
│  nemoretriever-parse + parakeet-asr │
│  llama-3.2-90b-vision + paligemma   │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         Biology Engine              │
│  esmfold + esm2 + rfdiffusion       │
│  genmol + molmim + Boltz-2          │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         Reasoning Engine            │
│  nemotron-3-ultra-550b (1M context) │
│  nv-embedqa-e5-v5 + rerank          │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         Delivery Engine             │
│  magpie-tts + riva-translate        │
│  cosmos3-nano (molecular video)     │
└─────────────────────────────────────┘
```

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **AI**: NVIDIA NIM APIs (28 endpoints)
- **Storage**: Local filesystem + in-memory vector store
- **Database**: SQLite (via better-sqlite3) for session/result storage

## Quick Start

```bash
# Clone and install
git clone https://github.com/HayreBuilds/lumina.git
cd lumina

# Set up environment
cp .env.example .env
# Edit .env and add your NVIDIA API key

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start development
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Open http://localhost:5173

## Environment Variables

```env
NVIDIA_API_KEY=your_nvidia_api_key_here
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/pipeline/start` | Start a full research pipeline |
| POST | `/api/ingest/document` | Upload and parse a document |
| POST | `/api/biology/protein-fold` | Predict protein 3D structure |
| POST | `/api/biology/generate-molecules` | Generate drug candidates |
| POST | `/api/vision/analyze-image` | Analyze medical images |
| POST | `/api/reasoning/synthesize` | Literature synthesis with Nemotron-Ultra |
| POST | `/api/safety/check` | PII redaction + content safety |
| GET | `/api/pipeline/:id/status` | Get pipeline run status |
| GET | `/api/pipeline/:id/results` | Get pipeline results |

## NVIDIA Endpoints Used

| Endpoint | Use Case |
|----------|----------|
| `nemoretriever-parse` | Document parsing |
| `nemotron-ocr-v1` | Image OCR |
| `llama-3.2-90b-vision-instruct` | Medical image analysis |
| `paligemma` | Chart/graph interpretation |
| `parakeet-ctc-1.1b-asr` | Audio transcription |
| `esmfold` | Protein 3D structure prediction |
| `esm2-650m` | Protein embeddings |
| `msa-search` | Sequence alignment |
| `rfdiffusion` | Protein backbone generation |
| `genmol` | Drug molecule generation |
| `molmim` | Molecule property optimization |
| `Boltz-2` | Molecular interaction prediction |
| `nemotron-3-ultra-550b-a55b` | Deep literature reasoning (1M ctx) |
| `nv-embedqa-e5-v5` | Semantic search over papers |
| `rerank-qa-mistral-4b` | Passage relevance reranking |
| `gliner-pii` | Patient data redaction |
| `nemotron-3.5-content-safety` | Content safety |
| `llama-3.1-nemoguard-8b-topic-control` | Topic enforcement |
| `nemojail-jailbreak-detect` | Misuse protection |
| `magpie-tts-zeroshot` | Voice cloning TTS |
| `Background Noise Removal` | Audio cleanup |
| `riva-translate-4b-instruct-v1.1` | Report translation |
| `cosmos3-nano` | Molecular visualization video |
| `cosmos-transfer1-7b` | Video world state transfer |
| `llama-nemotron-embed-1b-v2` | Multilingual embeddings |
| `nemotron-rerank-1b-v2` | Hypothesis re-scoring |
| `fourcastnet` | Climate/environmental correlation |

## License

MIT

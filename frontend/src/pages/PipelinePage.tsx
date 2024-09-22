import { useState } from 'react'
import axios from 'axios'
import { Zap, Plus, Trash2, CheckCircle, Clock, XCircle, Loader } from 'lucide-react'

const SAMPLE_PROTEINS = ["MKTIIALSYIFCLVFA", "ACDEFGHIKLMNPQRSTVWY"]
const SAMPLE_SMILES = ["CC1=CC=CC=C1", "CCO"]

export default function PipelinePage() {
  const [question, setQuestion] = useState('')
  const [documents, setDocuments] = useState<string[]>([''])
  const [proteinSeq, setProteinSeq] = useState('')
  const [smiles, setSmiles] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [pollingId, setPollingId] = useState<string | null>(null)
  const [status, setStatus] = useState<any>(null)

  const startPipeline = async () => {
    if (!question.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await axios.post('/api/pipeline/start', {
        question,
        documents: documents.filter(Boolean),
        proteinSequence: proteinSeq || undefined,
        moleculeSmiles: smiles || undefined,
      })
      const id = res.data.pipelineId
      setPollingId(id)
      // Poll status
      const interval = setInterval(async () => {
        const s = await axios.get(`/api/pipeline/${id}/status`)
        setStatus(s.data)
        if (s.data.status === 'complete' || s.data.status === 'failed') {
          clearInterval(interval)
          const full = await axios.get(`/api/pipeline/${id}/results`)
          setResult(full.data)
          setLoading(false)
        }
      }, 2000)
    } catch (e: any) {
      alert(e.response?.data?.error ?? e.message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Research Pipeline</h1>
        <p className="text-gray-400">Orchestrate 28 NVIDIA NIM endpoints into a complete drug discovery workflow</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Research Question */}
          <div className="card">
            <label className="label">Research Question *</label>
            <textarea
              className="input resize-none h-24"
              placeholder="e.g. What protein-drug interactions make temozolomide effective against glioblastoma?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
          </div>

          {/* Documents */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Research Documents (optional)</label>
              <button className="btn-secondary text-xs py-1 px-2 flex items-center gap-1" onClick={() => setDocuments([...documents, ''])}>
                <Plus className="w-3 h-3" /> Add Document
              </button>
            </div>
            {documents.map((doc, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <textarea
                  className="input resize-none h-20 flex-1 text-xs"
                  placeholder={`Paste research text, abstract, or clinical notes...`}
                  value={doc}
                  onChange={e => { const d = [...documents]; d[i] = e.target.value; setDocuments(d) }}
                />
                {documents.length > 1 && (
                  <button onClick={() => setDocuments(documents.filter((_, idx) => idx !== i))} className="text-gray-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Biology Inputs */}
          <div className="card grid grid-cols-2 gap-4">
            <div>
              <label className="label">Protein Sequence (ESMFold)</label>
              <input className="input" placeholder="ACDEFGHIKLMN..." value={proteinSeq} onChange={e => setProteinSeq(e.target.value)} />
              <div className="flex gap-2 mt-1">
                {SAMPLE_PROTEINS.map(p => (
                  <button key={p} onClick={() => setProteinSeq(p)} className="text-xs text-blue-400 hover:text-blue-300">{p.slice(0, 8)}...</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Molecule SMILES (GenMol)</label>
              <input className="input" placeholder="CC1=CC=CC=C1" value={smiles} onChange={e => setSmiles(e.target.value)} />
              <div className="flex gap-2 mt-1">
                {SAMPLE_SMILES.map(s => (
                  <button key={s} onClick={() => setSmiles(s)} className="text-xs text-blue-400 hover:text-blue-300">{s}</button>
                ))}
              </div>
            </div>
          </div>

          <button
            className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
            onClick={startPipeline}
            disabled={loading || !question.trim()}
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {loading ? 'Pipeline Running...' : 'Launch Full Pipeline'}
          </button>
        </div>

        {/* Status Panel */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-white mb-3">Pipeline Architecture</h3>
            {[
              { name: 'Safety & PII Check', model: 'GLiNER + NemoGuard', color: 'text-red-400' },
              { name: 'Protein Structure', model: 'ESMFold', color: 'text-green-400' },
              { name: 'Drug Generation', model: 'GenMol + MolMIM', color: 'text-blue-400' },
              { name: 'Literature Synthesis', model: 'Nemotron-Ultra (1M ctx)', color: 'text-purple-400' },
              { name: 'Knowledge Embedding', model: 'nv-embedqa-e5-v5', color: 'text-yellow-400' },
              { name: 'Molecular Video', model: 'Cosmos3-Nano', color: 'text-pink-400' },
            ].map((step, i) => {
              const stepStatus = status?.steps?.find((s: any) => s.id === `step${i + 1}`)
              return (
                <div key={i} className="flex items-start gap-3 mb-3">
                  <div className="mt-0.5">
                    {stepStatus?.status === 'complete' ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                     stepStatus?.status === 'running' ? <Loader className="w-4 h-4 text-blue-400 animate-spin" /> :
                     stepStatus?.status === 'failed' ? <XCircle className="w-4 h-4 text-red-400" /> :
                     <Clock className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div>
                    <div className="text-sm text-gray-200">{step.name}</div>
                    <div className={`text-xs ${step.color}`}>{step.model}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-bold text-white">Pipeline Results</h2>
            <span className="badge badge-green ml-auto">Complete</span>
          </div>
          {result.summary && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Literature Synthesis</h3>
              <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{result.summary}</div>
            </div>
          )}
          {result.steps && Object.entries(result.steps).map(([key, step]: any) => (
            step.result && (
              <details key={key} className="mb-3">
                <summary className="cursor-pointer text-sm font-medium text-blue-400 hover:text-blue-300">
                  {step.name} — {step.status}
                </summary>
                <pre className="mt-2 bg-gray-800 rounded p-3 text-xs text-gray-300 overflow-auto max-h-48">{JSON.stringify(step.result, null, 2)}</pre>
              </details>
            )
          ))}
        </div>
      )}
    </div>
  )
}

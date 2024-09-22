import { useState } from 'react'
import axios from 'axios'
import { Brain, Plus, Trash2, Loader } from 'lucide-react'

export default function ReasoningPage() {
  const [question, setQuestion] = useState('')
  const [passages, setPassages] = useState<string[]>([''])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const synthesize = async () => {
    if (!question.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await axios.post('/api/reasoning/synthesize', { question, passages: passages.filter(Boolean) })
      setResult(res.data)
    } catch (e: any) { alert(e.response?.data?.error ?? e.message) }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Literature Synthesis</h1>
        <p className="text-gray-400">Nemotron-Ultra (1M context) — reason across entire research corpora</p>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="card">
            <label className="label">Synthesis Question</label>
            <textarea className="input resize-none h-24" placeholder="What mechanisms underlie treatment resistance in EGFR-mutant lung cancer?" value={question} onChange={e => setQuestion(e.target.value)} />
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Research Passages</label>
              <button className="btn-secondary text-xs py-1 px-2 flex items-center gap-1" onClick={() => setPassages([...passages, ''])}>
                <Plus className="w-3 h-3" /> Add Passage
              </button>
            </div>
            {passages.map((p, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <textarea className="input text-xs resize-none h-20 flex-1" placeholder="Paste a research passage, abstract, or excerpt..." value={p} onChange={e => { const a = [...passages]; a[i] = e.target.value; setPassages(a) }} />
                {passages.length > 1 && <button onClick={() => setPassages(passages.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-gray-500 hover:text-red-400" /></button>}
              </div>
            ))}
          </div>
          <button className="btn-primary w-full py-3 flex items-center justify-center gap-2" onClick={synthesize} disabled={loading || !question.trim()}>
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            Synthesize with Nemotron-Ultra
          </button>
        </div>
        <div className="card">
          <h3 className="font-semibold text-white mb-3">Model Details</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Model', value: 'nemotron-3-ultra-550b' },
              { label: 'Context', value: '1,000,000 tokens' },
              { label: 'Parameters', value: '550B (55B active)' },
              { label: 'Specialization', value: 'Scientific reasoning' },
              { label: 'Embedding', value: 'nv-embedqa-e5-v5' },
              { label: 'Reranking', value: 'rerank-qa-mistral-4b' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-200 text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {result && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-400" />
            <h2 className="font-semibold text-white">Synthesis</h2>
            <span className="badge badge-blue ml-auto">{result.model}</span>
          </div>
          <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{result.synthesis}</div>
          <div className="mt-4 pt-4 border-t border-gray-800 flex gap-4 text-xs text-gray-500">
            <span>Context: {result.contextLength?.toLocaleString()} chars</span>
            <span>Embeddings: {result.embeddingDimensions}d</span>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import axios from 'axios'
import { Shield, Loader, CheckCircle, AlertTriangle } from 'lucide-react'

export default function SafetyPage() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const check = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await axios.post('/api/safety/check', { text })
      setResult(res.data)
    } catch (e: any) { alert(e.response?.data?.error ?? e.message) }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Safety & Compliance</h1>
        <p className="text-gray-400">GLiNER PII detection + NemoGuard content safety — HIPAA/GDPR compliance</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="card space-y-4">
          <label className="label">Text to Check</label>
          <textarea className="input h-48 resize-none" placeholder="Paste any text to scan for PII, unsafe content, or compliance issues..." value={text} onChange={e => setText(e.target.value)} />
          <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={check} disabled={loading || !text.trim()}>
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Run Safety Check
          </button>
        </div>
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Safety Layers</h3>
          {['GLiNER PII Detection', 'NemoGuard Content Safety', 'NemoJail Jailbreak Detection', 'Topic Enforcement'].map((layer, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-gray-300">{layer}</span>
            </div>
          ))}
          {result && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                {result.pii?.entities?.length > 0 ? <AlertTriangle className="w-4 h-4 text-yellow-400" /> : <CheckCircle className="w-4 h-4 text-green-400" />}
                <span className="text-sm font-medium text-white">PII Check</span>
              </div>
              <pre className="text-xs text-gray-400 bg-gray-800 rounded p-3 overflow-auto max-h-64">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

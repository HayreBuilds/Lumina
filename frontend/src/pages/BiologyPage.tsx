import { useState } from 'react'
import axios from 'axios'
import { Dna, Atom, Loader } from 'lucide-react'

export default function BiologyPage() {
  const [seq, setSeq] = useState('')
  const [smiles, setSmiles] = useState('')
  const [foldResult, setFoldResult] = useState<any>(null)
  const [molResult, setMolResult] = useState<any>(null)
  const [foldLoading, setFoldLoading] = useState(false)
  const [molLoading, setMolLoading] = useState(false)

  const foldProtein = async () => {
    if (!seq) return
    setFoldLoading(true)
    try {
      const res = await axios.post('/api/biology/protein-fold', { sequence: seq })
      setFoldResult(res.data)
    } catch (e: any) { alert(e.response?.data?.error ?? e.message) }
    setFoldLoading(false)
  }

  const generateMols = async () => {
    if (!smiles) return
    setMolLoading(true)
    try {
      const res = await axios.post('/api/biology/generate-molecules', { smiles, numMolecules: 10, optimizeFor: 'QED' })
      setMolResult(res.data)
    } catch (e: any) { alert(e.response?.data?.error ?? e.message) }
    setMolLoading(false)
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Biology Engine</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Dna className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Protein Structure Prediction</h2>
            <span className="badge badge-green ml-auto">ESMFold</span>
          </div>
          <div>
            <label className="label">Amino Acid Sequence (max 400 aa)</label>
            <textarea className="input h-28 resize-none font-mono text-xs" placeholder="MKTIIALSYIFCLVFAQKIPGQHSQLDAIIEQKL..." value={seq} onChange={e => setSeq(e.target.value)} />
          </div>
          <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={foldProtein} disabled={foldLoading || !seq}>
            {foldLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Dna className="w-4 h-4" />}
            Predict 3D Structure
          </button>
          {foldResult && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-green-400 font-medium mb-2">✓ Structure Predicted ({foldResult.sequenceLength} aa)</div>
              <div className="text-xs text-gray-400 mb-2">Model: {foldResult.model}</div>
              <details>
                <summary className="text-xs text-blue-400 cursor-pointer">View PDB Structure</summary>
                <pre className="mt-2 text-xs text-gray-400 overflow-auto max-h-40">{foldResult.pdbStructure?.slice(0, 500)}...</pre>
              </details>
              <p className="text-xs text-gray-500 mt-2">{foldResult.note}</p>
            </div>
          )}
        </div>

        <div className="card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Atom className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Drug Candidate Generation</h2>
            <span className="badge badge-blue ml-auto">GenMol + MolMIM</span>
          </div>
          <div>
            <label className="label">Lead Molecule (SMILES)</label>
            <input className="input font-mono" placeholder="CC1=CC=CC=C1" value={smiles} onChange={e => setSmiles(e.target.value)} />
          </div>
          <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={generateMols} disabled={molLoading || !smiles}>
            {molLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Atom className="w-4 h-4" />}
            Generate Drug Candidates
          </button>
          {molResult && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-blue-400 font-medium mb-2">✓ {molResult.count} molecules generated</div>
              <div className="space-y-1 max-h-48 overflow-auto">
                {(molResult.generatedMolecules ?? []).map((m: string, i: number) => (
                  <div key={i} className="text-xs font-mono text-gray-300 bg-gray-900 rounded px-2 py-1">{m}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

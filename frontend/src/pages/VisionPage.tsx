import { useState, useRef } from 'react'
import axios from 'axios'
import { Eye, Upload, Loader } from 'lucide-react'

export default function VisionPage() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('Analyze this medical/scientific image. Describe all visible structures, anomalies, and findings in clinical detail.')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setImage(file)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const analyze = async () => {
    if (!image) return
    setLoading(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('image', image)
      fd.append('prompt', prompt)
      const res = await axios.post('/api/vision/analyze-image', fd)
      setResult(res.data.analysis)
    } catch (e: any) { alert(e.response?.data?.error ?? e.message) }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Medical Image Analysis</h1>
        <p className="text-gray-400">LLaMA-3.2-90B Vision — X-rays, MRI, microscopy, pathology slides</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div
            className="card border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors cursor-pointer min-h-48 flex items-center justify-center"
            onClick={() => inputRef.current?.click()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
            onDragOver={e => e.preventDefault()}
          >
            {preview ? (
              <img src={preview} alt="preview" className="max-h-64 rounded-lg object-contain" />
            ) : (
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <div className="text-gray-400">Drop medical image here or click to upload</div>
                <div className="text-xs text-gray-600 mt-1">PNG, JPG, JPEG</div>
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

          <div>
            <label className="label">Analysis Prompt</label>
            <textarea className="input h-20 resize-none text-sm" value={prompt} onChange={e => setPrompt(e.target.value)} />
          </div>

          <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={analyze} disabled={loading || !image}>
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Analyze Image
          </button>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Analysis Results</h3>
            {result && <span className="badge badge-green ml-auto">llama-3.2-90b-vision</span>}
          </div>
          {loading && (
            <div className="flex items-center gap-3 text-gray-400">
              <Loader className="w-5 h-5 animate-spin text-blue-400" />
              <span>Analyzing image with LLaMA-3.2-90B Vision...</span>
            </div>
          )}
          {result ? (
            <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{result}</div>
          ) : !loading && (
            <p className="text-gray-500 text-sm">Upload a medical image and click Analyze to see AI findings</p>
          )}
        </div>
      </div>
    </div>
  )
}

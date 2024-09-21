import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { FlaskConical, FileText, Dna, Eye, Brain, Shield, Zap } from 'lucide-react'
import PipelinePage from './pages/PipelinePage'
import BiologyPage from './pages/BiologyPage'
import VisionPage from './pages/VisionPage'
import ReasoningPage from './pages/ReasoningPage'
import SafetyPage from './pages/SafetyPage'

const nav = [
  { to: '/', label: 'Pipeline', icon: Zap },
  { to: '/biology', label: 'Biology', icon: Dna },
  { to: '/vision', label: 'Vision', icon: Eye },
  { to: '/reasoning', label: 'Synthesis', icon: Brain },
  { to: '/safety', label: 'Safety', icon: Shield },
]

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">LUMINA</span>
                <span className="text-xs text-gray-500 block -mt-1">AI Drug Discovery Platform</span>
              </div>
            </div>
            <nav className="flex gap-1">
              {nav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<PipelinePage />} />
            <Route path="/biology" element={<BiologyPage />} />
            <Route path="/vision" element={<VisionPage />} />
            <Route path="/reasoning" element={<ReasoningPage />} />
            <Route path="/safety" element={<SafetyPage />} />
          </Routes>
        </main>

        <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
          LUMINA — Powered by NVIDIA NIM APIs · 28 AI Endpoints
        </footer>
      </div>
    </BrowserRouter>
  )
}

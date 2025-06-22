// src/App.tsx
import React, { useState, useEffect } from 'react'
import PromptForm, { type PromptData } from './components/PromptForm'
import ResultGallery from './components/ResultGallery'
import type { ImageResult } from './types/ImageResult'
import HistoryList from './components/HistoryList'
import FavoritesList from './components/FavoritesList'
import SettingsPanel from './components/SettingsPanel'
// If you need the Settings type, import it from its actual location or define it here:
export type Settings = {
  apiUrl: string
  apiKey: string
  defaultSteps: number
  defaultCfg: number
}
import { generateImage, type GenerateRequest, type GenerateResponse } from './services/api'

const DEFAULT_SETTINGS: Settings = {
  apiUrl: import.meta.env.VITE_API_URL!,
  apiKey: import.meta.env.VITE_API_KEY || '',
  defaultSteps: Number(import.meta.env.VITE_DEFAULT_STEPS) || 20,
  defaultCfg: Number(import.meta.env.VITE_DEFAULT_CFG) || 7,
}

const App: React.FC = () => {
  //
  // --- Settings state (persisted) ---
  //
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('appSettings')
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
  })
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
  }, [settings])

  //
  // --- History & Favorites (persisted) ---
  //
  const [history, setHistory] = useState<ImageResult[]>(() => {
    const raw = localStorage.getItem('history')
    return raw ? JSON.parse(raw) : []
  })
  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history))
  }, [history])

  const [favorites, setFavorites] = useState<ImageResult[]>(() => {
    const raw = localStorage.getItem('favorites')
    return raw ? JSON.parse(raw) : []
  })
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  //
  // --- Generation results & loading ---
  //
  const [results, setResults] = useState<ImageResult[]>([])
  const [loading, setLoading] = useState(false)

  //
  // --- Handlers ---
  //
  const handleGenerate = async (data: PromptData) => {
    setLoading(true)
    try {
      // Build the payload to match FastAPI's Pydantic model
      const payload: GenerateRequest = {
        prompt: data.prompt,
        negative_prompt: data.negativePrompt,
        lora_model: data.loraModel,
        steps: data.steps,
        cfg: data.cfg,
        seed: data.seed,
      }
      // Call backend
      const resp: GenerateResponse = await generateImage(
        settings.apiUrl,
        settings.apiKey,
        payload
      )
      // Assemble a full ImageResult
      const newResult: ImageResult = {
        id: Date.now().toString(),
        prompt: data.prompt,
        negativePrompt: data.negativePrompt,
        loraModel: data.loraModel,
        steps: data.steps,
        cfg: data.cfg,
        seed: resp.seed,
        imageData: resp.image,
      }
      // Update UI state
      setResults((prev) => [newResult, ...prev])
      setHistory((prev) => [newResult, ...prev])
    } catch (err: any) {
      alert(`Generation error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (res: ImageResult) => {
    const blob = new Blob([Uint8Array.from(atob(res.imageData), c => c.charCodeAt(0))], {
      type: 'image/png',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `image-${res.id}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRegenerate = (res: ImageResult) => {
    handleGenerate({
      prompt: res.prompt,
      negativePrompt: res.negativePrompt,
      loraModel: res.loraModel,
      steps: res.steps,
      cfg: res.cfg,
      seed: res.seed,
    })
  }

  const handleSaveFavorite = (res: ImageResult) => {
    setFavorites((prev) => [res, ...prev])
  }

  const handleSelectHistory = (res: ImageResult) => {
    // Show this item as the only result
    setResults([res])
  }

  const handleSelectFavorite = (res: ImageResult) => {
    setResults([res])
  }

  //
  // --- Render ---
  //
  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <SettingsPanel settings={settings} onChange={setSettings} />
        <HistoryList items={history} onSelect={handleSelectHistory} />
        <FavoritesList items={favorites} onSelect={handleSelectFavorite} />
      </aside>

      {/* Main content */}
      <main className="main">
        <PromptForm
          defaultValues={{
            prompt: '',
            negativePrompt: '',
            loraModel: '',
            steps: settings.defaultSteps,
            cfg: settings.defaultCfg,
            seed: Math.floor(Math.random() * 1_000_000),
          }}
          onSubmit={handleGenerate}
        />

        <ResultGallery
          results={results}
          onDownload={handleDownload}
          onRegenerate={handleRegenerate}
          onSaveFavorite={handleSaveFavorite}
        />

        {loading && <div style={{ marginTop: '1rem' }}>Generating image…</div>}
      </main>
    </div>
  )
}

export default App

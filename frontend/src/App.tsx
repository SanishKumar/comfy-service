import React, { useState, useEffect } from 'react'
import PromptForm, { type PromptData } from './components/PromptForm'
import ResultGallery from './components/ResultGallery'
import type { ImageResult } from './types/ImageResult'
import HistoryList from './components/HistoryList'
import FavoritesList from './components/FavoritesList'
import SettingsPanel from './components/SettingsPanel'

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
      // Create a more elegant error notification
      const errorDiv = document.createElement('div')
      errorDiv.className = 'error-notification'
      errorDiv.textContent = `Generation error: ${err.message}`
      errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
      `
      document.body.appendChild(errorDiv)
      setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease forwards'
        setTimeout(() => document.body.removeChild(errorDiv), 300)
      }, 3000)
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
    a.download = `ai-art-${res.id}.png`
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
    // Check if already in favorites
    if (!favorites.find(fav => fav.id === res.id)) {
      setFavorites((prev) => [res, ...prev])
      
      // Show success notification
      const successDiv = document.createElement('div')
      successDiv.textContent = 'Added to favorites!'
      successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #22c55e;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
      `
      document.body.appendChild(successDiv)
      setTimeout(() => {
        successDiv.style.animation = 'slideOut 0.3s ease forwards'
        setTimeout(() => document.body.removeChild(successDiv), 300)
      }, 2000)
    }
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
        <div className="fade-in">
          <SettingsPanel settings={settings} onChange={setSettings} />
          <HistoryList items={history} onSelect={handleSelectHistory} />
          <FavoritesList items={favorites} onSelect={handleSelectFavorite} />
        </div>
      </aside>

      {/* Main content */}
      <main className="main">
        <div className="slide-up">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              AI Art Generator
            </h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1.125rem',
              marginBottom: '2rem' 
            }}>
              Create stunning images with artificial intelligence
            </p>
          </div>

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
            loading={loading}
          />

          <ResultGallery
            results={results}
            onDownload={handleDownload}
            onRegenerate={handleRegenerate}
            onSaveFavorite={handleSaveFavorite}
            loading={loading}
          />

          {loading && (
            <div className="loading" style={{ 
              marginTop: '2rem', 
              padding: '2rem',
              textAlign: 'center' as const,
              fontSize: '1.125rem'
            }}>
              Creating your masterpiece...
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

export default App
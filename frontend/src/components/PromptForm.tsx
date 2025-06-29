import React, { useState, type FormEvent } from 'react';

export interface PromptData {
  prompt: string;
  negativePrompt: string;
  loraModel: string;
  steps: number;
  cfg: number;
  seed: number;
}

interface PromptFormProps {
  defaultValues: PromptData;
  onSubmit: (data: PromptData) => void;
  loading?: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({ defaultValues, onSubmit, loading = false }) => {
  const [prompt, setPrompt] = useState(defaultValues.prompt);
  const [negativePrompt, setNegativePrompt] = useState(defaultValues.negativePrompt);
  const [loraModel, setLoraModel] = useState(defaultValues.loraModel);
  const [steps, setSteps] = useState(defaultValues.steps);
  const [cfg, setCfg] = useState(defaultValues.cfg);
  const [seed, setSeed] = useState(defaultValues.seed);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ prompt, negativePrompt, loraModel, steps, cfg, seed });
  };

  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1_000_000));
  };

  const quickPrompts = [
    "A serene landscape with mountains and lakes",
    "Portrait of a futuristic cyborg",
    "Abstract digital art with vibrant colors",
    "Mystical forest with glowing flowers",
    "Steampunk mechanical dragon"
  ];

  const addQuickPrompt = (quickPrompt: string) => {
    setPrompt(prev => prev ? `${prev}, ${quickPrompt}` : quickPrompt);
  };

  return (
    <form onSubmit={handleSubmit} className="fade-in">
      {/* Main Prompt */}
      <div>
        <label>
          ✨ Describe your vision
        </label>
        <textarea 
          value={prompt} 
          onChange={e => setPrompt(e.target.value)} 
          required 
          rows={3}
          placeholder="A beautiful sunset over the ocean with dramatic clouds..."
          style={{ resize: 'vertical', minHeight: '80px' }}
        />
        
        {/* Quick Prompt Suggestions */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          flexWrap: 'wrap' as const, 
          marginTop: '0.5rem' 
        }}>
          {quickPrompts.map((quickPrompt, index) => (
            <button
              key={index}
              type="button"
              onClick={() => addQuickPrompt(quickPrompt)}
              className="btn-secondary btn-small"
              style={{ 
                fontSize: '0.75rem',
                padding: '0.375rem 0.75rem',
                opacity: 0.8
              }}
            >
              + {quickPrompt}
            </button>
          ))}
        </div>
      </div>

      {/* Negative Prompt */}
      <div>
        <label>
          🚫 What to avoid
        </label>
        <textarea 
          value={negativePrompt} 
          onChange={e => setNegativePrompt(e.target.value)} 
          rows={2}
          placeholder="blurry, low quality, distorted..."
          style={{ resize: 'vertical', minHeight: '60px' }}
        />
      </div>

      {/* Advanced Settings Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.5rem',
        marginTop: '1rem',
        padding: '1.5rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {/* LoRA Model */}
        <div>
          <label>
            🎨 Style Model
          </label>
          <select value={loraModel} onChange={e => setLoraModel(e.target.value)}>
            <option value="">(Default Style)</option>
            <option value="lora-A">Artistic Style A</option>
            <option value="lora-B">Artistic Style B</option>
            <option value="lora-C">Photorealistic</option>
            <option value="lora-D">Anime Style</option>
            <option value="lora-E">Oil Painting</option>
          </select>
        </div>

        {/* Steps */}
        <div className="range-wrapper">
          <label>
            <span>⚙️ Quality Steps</span>
            <span className="range-value">{steps}</span>
          </label>
          <input 
            type="range" 
            min="10" 
            max="100" 
            value={steps} 
            onChange={e => setSteps(parseInt(e.target.value))} 
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)',
            marginTop: '0.25rem'
          }}>
            <span>Fast</span>
            <span>Balanced</span>
            <span>High Quality</span>
          </div>
        </div>

        {/* CFG Scale */}
        <div className="range-wrapper">
          <label>
            <span>🎯 Prompt Strength</span>
            <span className="range-value">{cfg}</span>
          </label>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={cfg} 
            onChange={e => setCfg(parseInt(e.target.value))} 
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)',
            marginTop: '0.25rem'
          }}>
            <span>Creative</span>
            <span>Balanced</span>
            <span>Strict</span>
          </div>
        </div>

        {/* Seed */}
        <div>
          <label>
            🎲 Seed (Randomness)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="number" 
              value={seed} 
              onChange={e => setSeed(parseInt(e.target.value) || 0)} 
              style={{ flex: 1 }}
              placeholder="Random seed..."
            />
            <button
              type="button"
              onClick={generateRandomSeed}
              className="btn-secondary"
              style={{ 
                padding: '0.875rem', 
                minWidth: 'auto',
                fontSize: '1.2rem'
              }}
              title="Generate random seed"
            >
              🎲
            </button>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div style={{ 
        textAlign: 'center' as const, 
        marginTop: '2rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button 
          type="submit" 
          disabled={loading || !prompt.trim()}
          style={{
            background: loading ? 'var(--text-muted)' : 'var(--gradient)',
            transform: loading ? 'none' : undefined,
            cursor: loading ? 'not-allowed' : 'pointer',
            minWidth: '200px',
            position: 'relative' as const,
            overflow: 'hidden' as const
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></span>
              Generating...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span>✨</span>
              Generate Artwork
            </span>
          )}
        </button>
        
        {!prompt.trim() && (
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.875rem', 
            marginTop: '0.5rem' 
          }}>
            Please enter a prompt to generate your artwork
          </p>
        )}
      </div>

      {/* Tips Section */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'rgba(99, 102, 241, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(99, 102, 241, 0.1)'
      }}>
        <h4 style={{ 
          fontSize: '0.875rem', 
          fontWeight: '600', 
          marginBottom: '0.5rem',
          color: 'var(--primary-light)'
        }}>
          💡 Pro Tips
        </h4>
        <ul style={{ 
          fontSize: '0.75rem', 
          color: 'var(--text-secondary)',
          listStyle: 'none',
          margin: 0,
          padding: 0
        }}>
          <li style={{ marginBottom: '0.25rem' }}>• Be specific with details (colors, lighting, style)</li>
          <li style={{ marginBottom: '0.25rem' }}>• Use quality steps 20-50 for best results</li>
          <li style={{ marginBottom: '0.25rem' }}>• Higher CFG = more prompt adherence</li>
          <li>• Same seed + prompt = reproducible results</li>
        </ul>
      </div>
    </form>
  );
};

export default PromptForm;
// src/components/PromptForm.tsx
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
}

const PromptForm: React.FC<PromptFormProps> = ({ defaultValues, onSubmit }) => {
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

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Prompt:</label>
        <input 
          type="text" 
          value={prompt} 
          onChange={e => setPrompt(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label>Negative Prompt:</label>
        <input 
          type="text" 
          value={negativePrompt} 
          onChange={e => setNegativePrompt(e.target.value)} 
        />
      </div>
      <div>
        <label>LoRA Model:</label>
        <select value={loraModel} onChange={e => setLoraModel(e.target.value)}>
          <option value="">(none)</option>
          <option value="lora-A">LoRA A</option>
          <option value="lora-B">LoRA B</option>
          {/* Populate with actual model names from backend if available */}
        </select>
      </div>
      <div>
        <label>Steps: {steps}</label>
        <input 
          type="range" 
          min="1" max="100" value={steps} 
          onChange={e => setSteps(parseInt(e.target.value))} 
        />
      </div>
      <div>
        <label>CFG Scale: {cfg}</label>
        <input 
          type="range" 
          min="1" max="20" value={cfg} 
          onChange={e => setCfg(parseInt(e.target.value))} 
        />
      </div>
      <div>
        <label>Seed:</label>
        <input 
          type="number" 
          value={seed} 
          onChange={e => setSeed(parseInt(e.target.value))} 
        />
      </div>
      <button type="submit">Generate</button>
    </form>
  );
};

export default PromptForm;

// src/hooks/useImageGenerator.ts
import { useState } from 'react';
import { type GenerateRequest, type GenerateResponse, generateImage } from '../services/api';

export function useImageGenerator() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerateResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const callGenerate = async (payload: GenerateRequest, settings: { apiUrl: string, apiKey: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateImage(settings.apiUrl, settings.apiKey, payload);
      setResults(prev => [...prev, res]);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, results, error, callGenerate };
}

// src/components/ResultGallery.tsx
import React from 'react';

import type { ImageResult } from '../types/ImageResult';


interface ResultGalleryProps {
  results: ImageResult[];
  onDownload: (result: ImageResult) => void;
  onRegenerate: (result: ImageResult) => void;
  onSaveFavorite: (result: ImageResult) => void;
}

const ResultGallery: React.FC<ResultGalleryProps> = ({ results, onDownload, onRegenerate, onSaveFavorite }) => (
  <div>
    {results.map((res) => (
      <div key={res.id} style={{ border: '1px solid #ccc', margin: '1em', padding: '1em' }}>
        <div>Prompt: {res.prompt}</div>
        <div>Seed: {res.seed}</div>
        <img 
          src={`data:image/png;base64,${res.imageData}`} 
          alt="Generated" 
          style={{ maxWidth: '100%' }} 
        />
        <div>
          <button onClick={() => onDownload(res)}>Download</button>
          <button onClick={() => onRegenerate(res)}>Regenerate</button>
          <button onClick={() => onSaveFavorite(res)}>Save to Favorites</button>
        </div>
      </div>
    ))}
  </div>
);

export default ResultGallery;

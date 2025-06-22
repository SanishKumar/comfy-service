// src/components/FavoritesList.tsx (similarly for FavoritesList)
import React from 'react';
import type { ImageResult } from '../types/ImageResult';

interface ListProps {
  items: ImageResult[];
  onSelect: (item: ImageResult) => void;
}

const FavoritesList: React.FC<ListProps> = ({ items, onSelect }) => (
  <div>
    <h3>Favorites</h3>
    {items.map(item => (
      <div key={item.id}>
        {item.prompt} (seed: {item.seed})
        <button onClick={() => onSelect(item)}>View</button>
      </div>
    ))}
  </div>
);
export default FavoritesList;

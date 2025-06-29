import React from 'react';
import type { ImageResult } from '../types/ImageResult';

interface ListProps {
  items: ImageResult[];
  onSelect: (item: ImageResult) => void;
}

const FavoritesList: React.FC<ListProps> = ({ items, onSelect }) => (
  <div className="settings-section">
    <h3>
      ⭐ Favorites
    </h3>
    
    {items.length === 0 ? (
      <div className="empty-state" style={{ padding: '1.5rem 0', textAlign: 'center' as const }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.3 }}>⭐</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          No favorites yet
        </div>
      </div>
    ) : (
      <div style={{ maxHeight: '300px', overflowY: 'auto' as const }}>
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="list-item"
            onClick={() => onSelect(item)}
            style={{ 
              position: 'relative' as const,
              background: 'rgba(255, 215, 0, 0.1)',
              borderColor: 'rgba(255, 215, 0, 0.3)'
            }}
          >
            {/* Thumbnail */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '0.75rem' 
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--surface)',
                border: '1px solid var(--border)'
              }}>
                <img 
                  src={`data:image/png;base64,${item.imageData}`}
                  alt="Thumbnail"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover' as const
                  }}
                />
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="list-item-prompt">
                  {item.prompt}
                </div>
                <div className="list-item-meta">
                  <span>Seed: {item.seed}</span>
                  <span style={{ 
                    background: 'rgba(255, 215, 0, 0.2)',
                    color: '#fbbf24',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '4px',
                    fontSize: '0.625rem',
                    fontWeight: '600'
                  }}>
                    ⭐ FAVORITE
                  </span>
                </div>
              </div>
            </div>
            
            
            <div style={{
              position: 'absolute' as const,
              top: '0.5rem',
              right: '0.5rem',
              fontSize: '0.75rem',
              opacity: 0.5,
              transition: 'opacity 0.2s ease'
            }}>
              👁️
            </div>
          </div>
        ))}
      </div>
    )}
    
    {items.length > 0 && (
      <div style={{ 
        marginTop: '0.5rem', 
        fontSize: '0.75rem', 
        color: 'var(--text-muted)',
        textAlign: 'center' as const
      }}>
        {items.length} favorite{items.length !== 1 ? 's' : ''}
      </div>
    )}
  </div>
);

export default FavoritesList;
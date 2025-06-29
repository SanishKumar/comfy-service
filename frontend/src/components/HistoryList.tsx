import React from 'react';
import type { ImageResult } from '../types/ImageResult';

interface ListProps {
  items: ImageResult[];
  onSelect: (item: ImageResult) => void;
}

const HistoryList: React.FC<ListProps> = ({ items, onSelect }) => (
  <div className="settings-section">
    <h3>📚 History</h3>
    {items.length === 0 ? (
      <div className="empty-state" style={{ padding: '2rem 1rem', textAlign: 'center' as const }}>
        <div className="empty-state-icon">🎨</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          No creations yet.<br />
          Start generating!
        </p>
      </div>
    ) : (
      <div style={{ maxHeight: '400px', overflowY: 'auto' as const }}>
        {items.slice(0, 20).map((item, index) => (
          <div 
            key={item.id} 
            className="list-item"
            onClick={() => onSelect(item)}
            style={{ 
              position: 'relative' as const,
              overflow: 'hidden' as const
            }}
          >
            {index === 0 && (
              <div style={{
                position: 'absolute' as const,
                top: '4px',
                right: '4px',
                background: 'var(--accent)',
                color: 'white',
                fontSize: '0.625rem',
                padding: '0.125rem 0.375rem',
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                NEW
              </div>
            )}
            <div className="list-item-prompt">
              {item.prompt}
            </div>
            <div className="list-item-meta">
              <span>Seed: {item.seed}</span>
              <span style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.6875rem' 
              }}>
                {item.steps} steps • CFG {item.cfg}
              </span>
            </div>
          </div>
        ))}
        {items.length > 20 && (
          <div style={{ 
            textAlign: 'center' as const, 
            padding: '1rem', 
            color: 'var(--text-muted)', 
            fontSize: '0.75rem' 
          }}>
            Showing recent 20 items
          </div>
        )}
      </div>
    )}
  </div>
);

export default HistoryList;
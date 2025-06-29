import React, { useState } from 'react';
import type { ImageResult } from '../types/ImageResult';

interface ResultGalleryProps {
  results: ImageResult[];
  onDownload: (result: ImageResult) => void;
  onRegenerate: (result: ImageResult) => void;
  onSaveFavorite: (result: ImageResult) => void;
  loading?: boolean;
}

const ResultGallery: React.FC<ResultGalleryProps> = ({ 
  results, 
  onDownload, 
  onRegenerate, 
  onSaveFavorite,
  loading = false 
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});

  const handleImageLoad = (id: string) => {
    setImageLoading(prev => ({ ...prev, [id]: false }));
  };

  const handleImageError = (id: string) => {
    setImageLoading(prev => ({ ...prev, [id]: false }));
  };

  const openModal = (result: ImageResult) => {
    setSelectedImage(result);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const formatPrompt = (prompt: string, maxLength: number = 100) => {
    return prompt.length > maxLength ? `${prompt.substring(0, maxLength)}...` : prompt;
  };

  if (results.length === 0 && !loading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎨</div>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
          No artwork yet
        </h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Create your first AI masterpiece by entering a prompt above
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="gallery">
        {results.map((result) => (
          <div key={result.id} className="gallery-item fade-in">
            <div 
              style={{ 
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
              onClick={() => openModal(result)}
            >
              {imageLoading[result.id] !== false && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}>
                  <div className="loading">Loading image...</div>
                </div>
              )}
              
              <img 
                src={`data:image/png;base64,${result.imageData}`} 
                alt="Generated artwork"
                onLoad={() => handleImageLoad(result.id)}
                onError={() => handleImageError(result.id)}
                style={{ 
                  width: '100%',
                  height: 'auto',
                  minHeight: '200px',
                  backgroundColor: 'var(--surface)'
                }}
              />
              
              {/* Hover Overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(245, 158, 11, 0.8) 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: '600'
              }}
              className="hover-overlay"
              >
                🔍 Click to view
              </div>
            </div>
            
            <div className="gallery-item-content">
              <div className="gallery-item-prompt">
                {formatPrompt(result.prompt)}
              </div>
              
              <div className="gallery-item-meta">
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' as const }}>
                  <span>🎲 Seed: {result.seed}</span>
                  <span>⚙️ Steps: {result.steps}</span>
                  <span>🎯 CFG: {result.cfg}</span>
                  {result.loraModel && <span>🎨 {result.loraModel}</span>}
                </div>
              </div>
              
              <div className="gallery-item-actions">
                <button 
                  onClick={() => onDownload(result)}
                  className="btn-secondary btn-small"
                  title="Download image"
                >
                  📥 Download
                </button>
                <button 
                  onClick={() => onRegenerate(result)}
                  className="btn-secondary btn-small"
                  title="Generate again with same settings"
                >
                  🔄 Regenerate
                </button>
                <button 
                  onClick={() => onSaveFavorite(result)}
                  className="btn-secondary btn-small"
                  title="Save to favorites"
                >
                  ⭐ Favorite
                </button>
                <button 
                  onClick={() => openModal(result)}
                  className="btn-secondary btn-small"
                  title="View full size"
                >
                  🔍 View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full-size image viewing */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem',
            backdropFilter: 'blur(20px)'
          }}
          onClick={closeModal}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: 'var(--surface)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.5rem',
                zIndex: 10,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>

            <img 
              src={`data:image/png;base64,${selectedImage.imageData}`}
              alt="Generated artwork"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
            
            {/* Image details */}
            <div style={{
              padding: '1.5rem',
              background: 'var(--surface)',
              borderTop: '1px solid var(--border)'
            }}>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: 'var(--text-primary)',
                lineHeight: '1.4'
              }}>
                {selectedImage.prompt}
              </div>
              
              {selectedImage.negativePrompt && (
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1rem'
                }}>
                  <strong>Negative:</strong> {selectedImage.negativePrompt}
                </div>
              )}
              
              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap' as const,
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem'
              }}>
                <span>🎲 Seed: {selectedImage.seed}</span>
                <span>⚙️ Steps: {selectedImage.steps}</span>
                <span>🎯 CFG: {selectedImage.cfg}</span>
                {selectedImage.loraModel && <span>🎨 {selectedImage.loraModel}</span>}
              </div>
              
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap' as const
              }}>
                <button 
                  onClick={() => onDownload(selectedImage)}
                  className="btn-secondary btn-small"
                >
                  📥 Download
                </button>
                <button 
                  onClick={() => {
                    onRegenerate(selectedImage);
                    closeModal();
                  }}
                  className="btn-secondary btn-small"
                >
                  🔄 Regenerate
                </button>
                <button 
                  onClick={() => onSaveFavorite(selectedImage)}
                  className="btn-secondary btn-small"
                >
                  ⭐ Favorite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gallery-item:hover .hover-overlay {
          opacity: 1;
        }
        
        .gallery-item {
          animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default ResultGallery;
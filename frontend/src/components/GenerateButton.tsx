import React from 'react';

interface GenerateButtonProps {
  isLoading: boolean;
  disabled?: boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ isLoading, disabled = false }) => (
  <button 
    type="submit" 
    disabled={isLoading || disabled}
    style={{
      position: 'relative' as const,
      overflow: 'hidden' as const,
      background: isLoading 
        ? 'linear-gradient(45deg, #6366f1, #8b5cf6, #6366f1)' 
        : 'var(--gradient)',
      backgroundSize: isLoading ? '200% 200%' : '100% 100%',
      animation: isLoading ? 'gradientShift 2s ease-in-out infinite' : 'none',
    }}
  >
    {isLoading ? (
      <span style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '0.5rem' 
      }}>
        <span style={{
          display: 'inline-block',
          width: '16px',
          height: '16px',
          border: '2px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></span>
        Generating Magic...
      </span>
    ) : (
      <span style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '0.5rem' 
      }}>
        ✨ Generate Art
      </span>
    )}
    
    <style>{`
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `}</style>
  </button>
);

export default GenerateButton;
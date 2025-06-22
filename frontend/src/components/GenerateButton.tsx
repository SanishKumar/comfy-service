// src/components/GenerateButton.tsx
import React from 'react';

interface GenerateButtonProps {
  isLoading: boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ isLoading }) => (
  <button type="submit" disabled={isLoading}>
    {isLoading ? (
      <span>Loading&#8230;</span>  // or use a spinner icon/component
    ) : (
      'Generate Image'
    )}
  </button>
);

export default GenerateButton;

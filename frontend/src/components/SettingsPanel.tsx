import React, { useState } from 'react';

interface Settings {
  apiUrl: string;
  apiKey: string;
  defaultSteps: number;
  defaultCfg: number;
}

interface SettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof Settings, value: string | number) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(settings));
  };

  const handleSave = () => {
    onChange(localSettings);
    setHasChanges(false);
    
    // Show success notification
    const successDiv = document.createElement('div');
    successDiv.textContent = 'Settings saved!';
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--success);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(successDiv);
    setTimeout(() => {
      successDiv.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => document.body.removeChild(successDiv), 300);
    }, 2000);
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const validateApiUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getConnectionStatus = () => {
    if (!localSettings.apiUrl) return { status: 'warning', text: 'No API URL set' };
    if (!validateApiUrl(localSettings.apiUrl)) return { status: 'error', text: 'Invalid URL format' };
    return { status: 'success', text: 'Configuration looks good' };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="settings-section">
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          padding: '0.75rem 0',
          borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
          marginBottom: isExpanded ? '1rem' : '0'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 style={{ 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1rem'
        }}>
          ⚙️ Settings
          {hasChanges && (
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--warning)',
              display: 'inline-block'
            }} />
          )}
        </h3>
        <span style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease'
        }}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Connection Status */}
          <div style={{
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            background: connectionStatus.status === 'success' 
              ? 'rgba(34, 197, 94, 0.1)' 
              : connectionStatus.status === 'warning'
              ? 'rgba(245, 158, 11, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${
              connectionStatus.status === 'success' 
                ? 'rgba(34, 197, 94, 0.2)' 
                : connectionStatus.status === 'warning'
                ? 'rgba(245, 158, 11, 0.2)'
                : 'rgba(239, 68, 68, 0.2)'
            }`
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: connectionStatus.status === 'success' 
                ? 'var(--success)' 
                : connectionStatus.status === 'warning'
                ? 'var(--warning)'
                : 'var(--error)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {connectionStatus.status === 'success' ? '✅' : 
               connectionStatus.status === 'warning' ? '⚠️' : '❌'}
              {connectionStatus.text}
            </div>
          </div>

          {/* API Configuration */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label>🌐 API Endpoint</label>
            <input 
              type="url" 
              value={localSettings.apiUrl} 
              onChange={e => handleChange('apiUrl', e.target.value)}
              placeholder="https://your-api-endpoint.com"
              style={{
                borderColor: !localSettings.apiUrl || validateApiUrl(localSettings.apiUrl) 
                  ? 'var(--border)' 
                  : 'var(--error)'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label>🔑 API Key</label>
            <input 
              type="password" 
              value={localSettings.apiKey} 
              onChange={e => handleChange('apiKey', e.target.value)}
              placeholder="Your API key (optional)"
            />
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '0.25rem'
            }}>
              Leave empty if your API doesn't require authentication
            </div>
          </div>

          {/* Default Parameters */}
          <div style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: 'var(--text-primary)'
            }}>
              🎛️ Default Parameters
            </h4>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span>Quality Steps</span>
                <span className="range-value">{localSettings.defaultSteps}</span>
              </label>
              <input 
                type="range"
                min="10" 
                max="100" 
                value={localSettings.defaultSteps} 
                onChange={e => handleChange('defaultSteps', parseInt(e.target.value))}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                marginTop: '0.25rem'
              }}>
                <span>10</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            <div>
              <label style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span>CFG Scale</span>
                <span className="range-value">{localSettings.defaultCfg}</span>
              </label>
              <input 
                type="range"
                min="1" 
                max="20" 
                value={localSettings.defaultCfg} 
                onChange={e => handleChange('defaultCfg', parseInt(e.target.value))}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                marginTop: '0.25rem'
              }}>
                <span>1</span>
                <span>10</span>
                <span>20</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {hasChanges && (
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '1.5rem'
            }}>
              <button 
                onClick={handleSave}
                style={{
                  flex: 1,
                  background: 'var(--success)',
                  color: 'white'
                }}
              >
                💾 Save Changes
              </button>
              <button 
                onClick={handleReset}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                🔄 Reset
              </button>
            </div>
          )}

          {/* Quick Setup Tips */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(99, 102, 241, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(99, 102, 241, 0.1)'
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: 'var(--primary-light)'
            }}>
              💡 Quick Setup
            </div>
            <div style={{
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.4'
            }}>
              • Set your API endpoint URL<br/>
              • Add API key if required<br/>
              • Adjust default quality settings<br/>
              • Settings are saved automatically
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SettingsPanel;
// src/components/SettingsPanel.tsx
import React, { useState, useEffect } from 'react';

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
  const [apiUrl, setApiUrl] = useState(settings.apiUrl);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [defaultSteps, setDefaultSteps] = useState(settings.defaultSteps);
  const [defaultCfg, setDefaultCfg] = useState(settings.defaultCfg);

  const handleSave = () => {
    const newSettings = { apiUrl, apiKey, defaultSteps, defaultCfg };
    onChange(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };

  return (
    <div>
      <h3>Settings</h3>
      <div>
        <label>API URL:</label>
        <input type="text" value={apiUrl} onChange={e => setApiUrl(e.target.value)} />
      </div>
      <div>
        <label>API Key:</label>
        <input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} />
      </div>
      <div>
        <label>Default Steps:</label>
        <input type="number" value={defaultSteps} onChange={e => setDefaultSteps(parseInt(e.target.value))} />
      </div>
      <div>
        <label>Default CFG:</label>
        <input type="number" value={defaultCfg} onChange={e => setDefaultCfg(parseInt(e.target.value))} />
      </div>
      <button onClick={handleSave}>Save Settings</button>
    </div>
  );
};

export default SettingsPanel;

'use client';
import { useEffect, useState } from 'react';

export default function ConfigPage() {
  const [provider, setProvider] = useState('chatgpt');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setProvider(localStorage.getItem('api_provider') || 'chatgpt');
    setApiKey(localStorage.getItem('openai_api_key') || '');
    setModel(localStorage.getItem('openai_model') || '');
    setBaseUrl(localStorage.getItem('openai_base_url') || '');
  }, []);

  const save = () => {
    localStorage.setItem('api_provider', provider);
    localStorage.setItem('openai_api_key', apiKey);
    localStorage.setItem('openai_model', model);
    localStorage.setItem('openai_base_url', baseUrl);
    alert('Saved');
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Configuration</h1>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span>Provider</span>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="chatgpt">Use ChatGPT.com</option>
            <option value="openai">Use OpenAI API</option>
          </select>
        </label>
        {provider === 'openai' && (
          <>
            <label className="flex flex-col gap-1">
              <span>OpenAI API Key</span>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="border p-2 rounded"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>OpenAI Model</span>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="border p-2 rounded"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>OpenAI Base URL</span>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="border p-2 rounded"
              />
            </label>
          </>
        )}
        <button onClick={save} className="bg-blue-600 text-white rounded py-2">
          Save
        </button>
      </div>
    </div>
  );
}

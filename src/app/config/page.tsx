'use client';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ConfigPage() {
  const [provider, setProvider] = useState('chatgpt');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setProvider(localStorage.getItem('api_provider') || 'chatgpt');
    setApiKey(localStorage.getItem('openai_api_key') || '');
    setModel(localStorage.getItem('openai_model') || '');
    setBaseUrl(localStorage.getItem('openai_base_url') || '');
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const save = () => {
    localStorage.setItem('api_provider', provider);
    localStorage.setItem('openai_api_key', apiKey);
    localStorage.setItem('openai_model', model);
    localStorage.setItem('openai_base_url', baseUrl);
    setShowSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="provider">Provider</label>
            <Select value={provider} onValueChange={(value) => {
              setProvider(value);
              setShowSaved(false);
            }}>
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chatgpt">Use ChatGPT.com</SelectItem>
                <SelectItem value="openai">Use OpenAI API</SelectItem>
              </SelectContent>
            </Select>
          </div>
        {provider === 'openai' && (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor="api-key">OpenAI API Key</label>
              <Input
                id="api-key"
                type="text"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setShowSaved(false);
                }}
                placeholder="sk-..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="model">OpenAI Model</label>
              <Input
                id="model"
                type="text"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  setShowSaved(false);
                }}
                placeholder="gpt-4"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="base-url">OpenAI Base URL</label>
              <Input
                id="base-url"
                type="text"
                value={baseUrl}
                onChange={(e) => {
                  setBaseUrl(e.target.value);
                  setShowSaved(false);
                }}
                placeholder="https://api.openai.com/v1"
              />
            </div>
          </>
        )}
          {showSaved && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 text-center text-sm">
              Configuration saved
            </div>
          )}
          <Button onClick={save} className="w-full">
            Save
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Key, Shield, Download, Upload, Trash2, ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';
import ApiKeyForm from '@/components/settings/ApiKeyForm';
import type { Provider } from '@/lib/storage/apiKeyStorage';
import {
  getConfiguredProviders,
  clearAllApiKeys,
  exportApiKeys,
  importApiKeys,
} from '@/lib/storage/apiKeyStorage';

const PROVIDERS: Provider[] = [
  'OpenAI',
  'Anthropic',
  'Perplexity',
  'Google',
];

export default function SettingsPage() {
  const [configuredProviders, setConfiguredProviders] = useState<Provider[]>([]);
  const [showDangerZone, setShowDangerZone] = useState(false);

  useEffect(() => {
    // Load configured providers on mount
    setConfiguredProviders(getConfiguredProviders());
  }, []);

  const handleRefresh = () => {
    setConfiguredProviders(getConfiguredProviders());
  };

  const handleExport = () => {
    const json = exportApiKeys();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modelviz-api-keys-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const json = e.target?.result as string;
        const result = importApiKeys(json);

        if (result.success) {
          alert(`Successfully imported ${result.imported} API key(s)`);
          handleRefresh();
        } else {
          alert(`Import failed: ${result.error}`);
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  const handleClearAll = () => {
    if (
      !window.confirm(
        'Are you sure you want to delete ALL API keys? This action cannot be undone.'
      )
    ) {
      return;
    }

    if (
      !window.confirm(
        'This will permanently delete all stored API keys. Are you absolutely sure?'
      )
    ) {
      return;
    }

    clearAllApiKeys();
    setConfiguredProviders([]);
    alert('All API keys have been deleted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-matrix-secondary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-matrix-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/playground"
            className="inline-flex items-center gap-2 text-matrix-tertiary hover:text-matrix-primary
                     transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Playground</span>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-matrix-secondary/10 rounded-xl border border-matrix-secondary/20">
              <Settings className="w-8 h-8 text-matrix-secondary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-matrix-primary mb-2">Settings</h1>
              <p className="text-matrix-tertiary">
                Configure your API keys to start using ModelViz
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4 p-4 bg-black/20 border border-matrix-secondary/20 rounded-lg">
            <Key className="w-5 h-5 text-matrix-secondary" />
            <div>
              <p className="text-matrix-primary font-semibold">
                {configuredProviders.length} Provider{configuredProviders.length !== 1 ? 's' : ''} Configured
              </p>
              {configuredProviders.length > 0 && (
                <p className="text-sm text-matrix-tertiary mt-1">
                  {configuredProviders.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-blue-400 font-semibold mb-1">Privacy & Security</h3>
              <p className="text-sm text-blue-300/80">
                Your API keys are stored locally in your browser and are never sent to our servers.
                All API calls are made directly from your browser to the respective AI providers.
                Keep your API keys secure and never share them publicly.
              </p>
            </div>
          </div>
        </div>

        {/* API Key Forms */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-matrix-primary mb-4">API Keys</h2>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {PROVIDERS.map((provider) => (
              <ApiKeyForm
                key={provider}
                provider={provider}
                onSave={handleRefresh}
                onDelete={handleRefresh}
              />
            ))}
          </div>
        </div>

        {/* Save & Refresh Button */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-matrix-secondary to-matrix-primary
                     text-black font-bold rounded-lg hover:shadow-[0_0_30px_rgba(0,255,0,0.3)]
                     transition-all duration-300 transform hover:scale-105"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Save & Refresh Page to Load Models</span>
          </button>
        </div>

        {/* Data Management */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-matrix-primary mb-4">Data Management</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={handleExport}
              disabled={configuredProviders.length === 0}
              className="flex items-center gap-3 p-4 bg-black/20 border border-matrix-secondary/20 rounded-lg
                       hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5 text-matrix-secondary" />
              <div className="text-left">
                <p className="text-matrix-primary font-semibold">Export API Keys</p>
                <p className="text-sm text-matrix-tertiary">Download your API keys as JSON</p>
              </div>
            </button>

            <button
              onClick={handleImport}
              className="flex items-center gap-3 p-4 bg-black/20 border border-matrix-secondary/20 rounded-lg
                       hover:bg-black/40 transition-colors"
            >
              <Upload className="w-5 h-5 text-matrix-secondary" />
              <div className="text-left">
                <p className="text-matrix-primary font-semibold">Import API Keys</p>
                <p className="text-sm text-matrix-tertiary">Restore from a backup file</p>
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div>
          <button
            onClick={() => setShowDangerZone(!showDangerZone)}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors mb-4"
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Danger Zone</span>
          </button>

          {showDangerZone && (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <h3 className="text-red-400 font-semibold mb-1">Delete All API Keys</h3>
                  <p className="text-sm text-red-300/80 mb-4">
                    This will permanently delete all stored API keys. This action cannot be undone.
                    Consider exporting your keys first.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearAll}
                disabled={configuredProviders.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 font-semibold rounded-lg
                         hover:bg-red-500/30 transition-colors border border-red-500/30
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete All API Keys</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

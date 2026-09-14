import React, { ChangeEvent, useState } from 'react';

interface ValidationResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export const SchemaLoader = (): React.JSX.Element => {
  const [activeSchemaName, setActiveSchemaName] = useState<string>('None (Using Default)');
  const [schemaSource, setSchemaSource] = useState<string>('None');
  const [error, setError] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState<string>('');

  // Stub validator (placeholder until A4/A5 land)
  const stubValidator = (content: string): ValidationResult => {
    try {
      const parsed: unknown = JSON.parse(content);
      if (typeof parsed !== 'object' || parsed === null) {
        return { success: false, error: 'Schema must be a valid JSON object.' };
      }
      return { success: true, data: parsed };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown parsing error';
      return { success: false, error: errorMessage };
    }
  };

  // 1. Handle Bundled Schema Load
  const handleBundledLoad = (presetName: string): void => {
    setError(null);
    setActiveSchemaName(presetName);
    setSchemaSource('Bundled');
  };

  // 2. Handle Local File Upload
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result;
      if (typeof content !== 'string') return;

      const validation = stubValidator(content);

      if (!validation.success) {
        setError(`File Parse Error: ${validation.error}`);
        return;
      }

      setError(null);
      setActiveSchemaName(file.name);
      setSchemaSource('Local File');
    };
    reader.readAsText(file);
  };

  // 3. Handle Pasted Code Submission
  const handlePastedSubmit = (): void => {
    const validation = stubValidator(pastedText);

    if (!validation.success) {
      setError(`Paste Error: ${validation.error}`);
      return;
    }

    setError(null);
    setActiveSchemaName('Custom Pasted Schema');
    setSchemaSource('Pasted');
  };

  // 4. Handle Fetched URL Load
  const handleFetchUrl = async (url: string): Promise<void> => {
    try {
      setError(null);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
      const text = await response.text();

      const validation = stubValidator(text);
      if (!validation.success) {
        setError(`Fetch Parse Error: ${validation.error}`);
        return;
      }

      setActiveSchemaName(url);
      setSchemaSource('Fetched URL');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown network error';
      setError(`Network/Fetch Error: ${errorMessage}`);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Schema Loader Debug Panel</h1>
      <p>Internal tool to load and test degree requirement schemas against the stub validator.</p>

      {/* Attribution Banner */}
      <div
        style={{
          background: '#f0f4f8',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem'
          // borderLeft: '5px solid #6200ee'
        }}
      >
        <strong>Active Schema:</strong> {activeSchemaName} <br />
        <small style={{ color: '#555' }}>Source: {schemaSource}</small>
      </div>

      {/* Error Display Area */}
      {error && (
        <div
          style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #ef9a9a'
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Input Options Grid */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Option 1: Bundled */}
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>1. Load Bundled Schema</h3>
          <button
            type="button"
            onClick={() => handleBundledLoad('3779-Advanced-Computer-Science.json')}
            style={{ marginRight: '10px', padding: '8px 12px' }}
          >
            Load 3779 (Default)
          </button>
        </div>

        {/* Option 2: Local File */}
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>2. Upload Local File</h3>
          <input type="file" accept=".json" onChange={handleFileUpload} />
        </div>

        {/* Option 3: Pasted text */}
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>3. Paste Schema JSON</h3>
          <textarea
            rows={5}
            style={{ width: '100%', marginBottom: '10px', fontFamily: 'monospace' }}
            placeholder="Paste raw JSON schema here..."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
          />
          <br />
          <button type="button" onClick={handlePastedSubmit} style={{ padding: '8px 12px' }}>
            Load Pasted Text
          </button>
        </div>

        {/* Option 4: Fetched URL */}
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>4. Fetch from URL</h3>
          <input
            type="text"
            placeholder="https://raw.githubusercontent.com/.../schema.json"
            style={{ width: '70%', marginRight: '10px', padding: '6px' }}
            id="url-input"
          />
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById('url-input') as HTMLInputElement;
              if (input?.value) {
                handleFetchUrl(input.value);
              }
            }}
            style={{ padding: '8px 12px' }}
          >
            Fetch
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchemaLoader;

import React, { useState, useEffect } from 'react';
import axios from 'axios';


const Pastebin = () => {
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [view, setView] = useState('home');
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [pasteUrl, setPasteUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pasteData, setPasteData] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/p/')) {
      const id = path.split('/p/')[1];
      loadPaste(id);
    }
  }, []);

  const loadPaste = async (id) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE}/api/pastes/${id}`);
      setPasteData(response.data);
      setView('view');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Paste not found or has expired');
      } else {
        setError('Failed to load paste');
      }
      setView('error');
    } finally {
      setLoading(false);
    }
  };

  const createPaste = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { content };
      
      if (ttlSeconds && parseInt(ttlSeconds) > 0) {
        payload.ttl_seconds = parseInt(ttlSeconds);
      }
      
      if (maxViews && parseInt(maxViews) > 0) {
        payload.max_views = parseInt(maxViews);
      }

      const response = await axios.post(`${API_BASE}/api/pastes`, payload);
      setPasteUrl(response.data.url);
      setView('success');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create paste');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setTtlSeconds('');
    setMaxViews('');
    setPasteUrl('');
    setError('');
    setPasteData(null);
    setView('home');
    window.history.pushState({}, '', '/');
  };

  if (view === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Paste Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={resetForm}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create New Paste
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'view' && pasteData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">View Paste</h1>
              <button
                onClick={resetForm}
                className="text-blue-600 hover:text-blue-800"
              >
                Create New
              </button>
            </div>
            
            <div className="mb-4 flex gap-4 text-sm text-gray-600">
              {pasteData.remaining_views !== null && (
                <div className="bg-yellow-50 px-3 py-1 rounded">
                  Remaining views: {pasteData.remaining_views}
                </div>
              )}
              {pasteData.expires_at && (
                <div className="bg-red-50 px-3 py-1 rounded">
                  Expires: {new Date(pasteData.expires_at).toLocaleString()}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                {pasteData.content}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Paste Created!</h1>
            <p className="text-gray-600">Share this link to let others view your paste</p>
          </div>

          <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6">
            <div className="flex items-center justify-between">
              <code className="text-sm break-all">{pasteUrl}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pasteUrl);
                  alert('Copied to clipboard!');
                }}
                className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex-shrink-0"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => window.open(pasteUrl, '_blank')}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              View Paste
            </button>
            <button
              onClick={resetForm}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pastebin-Lite</h1>
          <p className="text-gray-600 mb-6">Share text snippets with optional expiry and view limits</p>

          <form onSubmit={createPaste}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 h-64 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste your content here..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Time to Live (seconds)
                </label>
                <input
                  type="number"
                  value={ttlSeconds}
                  onChange={(e) => setTtlSeconds(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 3600 (1 hour)"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Max Views
                </label>
                <input
                  type="number"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited views</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Creating...' : 'Create Paste'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Pastebin;

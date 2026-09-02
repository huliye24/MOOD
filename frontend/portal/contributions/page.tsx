/**
 * MOOD Contribution Portal
 * Version: v0.1.0
 * 
 * Minimal demo showing contribution registry functionality.
 */

'use client';

import { useState, useEffect } from 'react';

// Contribution types
const CONTRIBUTION_TYPES = [
  { value: 'code', label: 'Code' },
  { value: 'research', label: 'Research' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'community', label: 'Community' },
  { value: 'infrastructure', label: 'Infrastructure' }
];

// Status colors
const STATUS_COLORS = {
  created: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  recorded: 'bg-blue-100 text-blue-800',
  rewarded: 'bg-purple-100 text-purple-800'
};

export default function ContributionPortal() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'code',
    title: '',
    description: '',
    evidence: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch contributions
  useEffect(() => {
    fetchContributions();
  }, []);

  async function fetchContributions() {
    try {
      const response = await fetch('/api/contributions');
      if (!response.ok) throw new Error('Failed to fetch contributions');
      const data = await response.json();
      setContributions(data.contributions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const evidence = formData.evidence 
        ? formData.evidence.split(',').map(s => s.trim())
        : [];
      
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title,
          description: formData.description,
          evidence
        })
      });
      
      if (!response.ok) throw new Error('Failed to create contribution');
      
      // Reset form
      setFormData({ type: 'code', title: '', description: '', evidence: '' });
      setShowForm(false);
      
      // Refresh list
      fetchContributions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            MOOD Contributions
          </h1>
          <p className="mt-2 text-gray-600">
            Contribution Registry v0.1 — Genesis Phase
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">
              {contributions.length}
            </div>
            <div className="text-gray-600">Total Contributions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">
              {contributions.filter(c => c.status === 'verified').length}
            </div>
            <div className="text-gray-600">Verified</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600">
              {new Set(contributions.map(c => c.contributor)).size}
            </div>
            <div className="text-gray-600">Contributors</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Contribution History
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'New Contribution'}
          </button>
        </div>

        {/* New Contribution Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Submit Contribution</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {CONTRIBUTION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Brief description of your contribution"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Detailed description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evidence (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.evidence}
                  onChange={(e) => setFormData({...formData, evidence: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="commit_hash, pr_link, etc."
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-gray-600">
            Loading contributions...
          </div>
        )}

        {/* Contributions List */}
        {!loading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Evidence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contributions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No contributions yet. Be the first to contribute!
                    </td>
                  </tr>
                ) : (
                  contributions.map((c) => (
                    <tr key={c.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {c.id.slice(0, 16)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded bg-gray-100">
                          {c.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {c.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${STATUS_COLORS[c.status] || ''}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {c.evidence?.length > 0 ? c.evidence.join(', ') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>MOOD Network v0.1 — Genesis Phase</p>
          <p className="mt-1">The network that records who contributed what.</p>
        </div>
      </main>
    </div>
  );
}

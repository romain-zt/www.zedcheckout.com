'use client';

import { useState } from 'react';

export default function TestLeadPage() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLead = async () => {
    setLoading(true);
    setStatus('📤 Sending test lead...');

    try {
      const response = await fetch('/api/chat-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          company: 'Test Company',
          platform: 'Shopify',
          monthlyRevenue: '10K-50K',
          cartValue: '50-100€',
          challenge: 'Testing the email system',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(`✅ SUCCESS! ${JSON.stringify(data, null, 2)}`);
      } else {
        setStatus(`❌ ERROR (${response.status}): ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setStatus(`❌ EXCEPTION: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>🧪 Test Chat Lead API</h1>
      <p>This page tests the /api/chat-lead endpoint</p>
      
      <button
        onClick={testLead}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#E88B7A',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '20px',
        }}
      >
        {loading ? '⏳ Sending...' : '📨 Send Test Lead'}
      </button>

      {status && (
        <pre
          style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {status}
        </pre>
      )}

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
        <h3>📋 How to use:</h3>
        <ol>
          <li>Click the "Send Test Lead" button</li>
          <li>Check your terminal/console for detailed logs (look for [chat-lead] messages)</li>
          <li>Check your email inbox for the test email</li>
          <li>If it fails, check the error message above and the console logs</li>
        </ol>
      </div>
    </div>
  );
}

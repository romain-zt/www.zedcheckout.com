import ZedCheckoutChat from '@/components/ZedCheckoutChat';

export const metadata = {
  title: 'ZedCheckout Chat Demo | Test du système de qualification',
  description: 'Démo interactive du système conversationnel de qualification ZedCheckout',
};

export default function ZedCheckoutDemoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-beige via-white to-salmon/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            ZedCheckout Chat AI
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Assistant conversationnel de qualification B2B
          </p>
          <p className="text-sm text-gray-600">
            Système de streaming SSE avec splitting de messages et funnel de qualification en 7 étapes
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-bold text-lg text-navy mb-2">Messages Split</h3>
            <p className="text-sm text-gray-600">
              Réponses divisées en messages courts (5-25 mots) avec signal <code>[SPLIT]</code>
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="text-3xl mb-3">⏱️</div>
            <h3 className="font-bold text-lg text-navy mb-2">Typing Delays</h3>
            <p className="text-sm text-gray-600">
              Délais de frappe réalistes (600-2500ms) basés sur la longueur du texte
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold text-lg text-navy mb-2">Funnel 7 Étapes</h3>
            <p className="text-sm text-gray-600">
              Qualification progressive : plateforme → trafic → CA → frustration → booking
            </p>
          </div>
        </div>

        {/* Technical Info */}
        <div className="bg-navy text-white rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">🔧 Spécifications Techniques</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-salmon mb-3">Backend</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Next.js 14+ App Router</li>
                <li>✓ Server-Sent Events (SSE) streaming</li>
                <li>✓ Claude 3.5 Sonnet (Anthropic API)</li>
                <li>✓ Session context management</li>
                <li>✓ Spam detection & rate limiting</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-salmon mb-3">Frontend</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ React with TypeScript</li>
                <li>✓ Real-time SSE parsing</li>
                <li>✓ Animated typing indicators</li>
                <li>✓ Context-aware UI updates</li>
                <li>✓ Mobile-responsive design</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20">
            <h3 className="font-semibold text-salmon mb-3">Funnel Stages</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'initial',
                'platform_identification',
                'traffic_volume',
                'revenue_check',
                'frustration_discovery',
                'abandon_rate_analysis',
                'urgency_assessment',
                'booking_proposal'
              ].map((stage) => (
                <span
                  key={stage}
                  className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono"
                >
                  {stage}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Test Scenarios */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-12">
          <h2 className="text-2xl font-bold text-navy mb-6">🧪 Scénarios de Test</h2>
          
          <div className="space-y-4">
            <details className="group">
              <summary className="cursor-pointer font-semibold text-navy hover:text-salmon transition-colors">
                Scénario 1: Lead Qualifié HOT (50K-800K€ CA)
              </summary>
              <div className="mt-3 pl-4 border-l-2 border-salmon text-sm text-gray-700 space-y-1">
                <p><strong>1.</strong> "Bonjour, je cherche à améliorer mes conversions"</p>
                <p><strong>2.</strong> "Shopify Standard"</p>
                <p><strong>3.</strong> "5000 visiteurs/mois"</p>
                <p><strong>4.</strong> "150K€/an"</p>
                <p><strong>5.</strong> "Taux d'abandon 75%"</p>
                <p><strong>Résultat attendu:</strong> Proposition d'audit, stage = booking_proposal</p>
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold text-navy hover:text-salmon transition-colors">
                Scénario 2: Disqualification Rapide (CA trop bas)
              </summary>
              <div className="mt-3 pl-4 border-l-2 border-salmon text-sm text-gray-700 space-y-1">
                <p><strong>1.</strong> "Salut, je débute en e-commerce"</p>
                <p><strong>2.</strong> "Shopify"</p>
                <p><strong>3.</strong> "20K€/an"</p>
                <p><strong>Résultat attendu:</strong> Disqualification polie + ressources gratuites</p>
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold text-navy hover:text-salmon transition-colors">
                Scénario 3: Hors-cible Plateforme
              </summary>
              <div className="mt-3 pl-4 border-l-2 border-salmon text-sm text-gray-700 space-y-1">
                <p><strong>1.</strong> "Je suis sur WooCommerce"</p>
                <p><strong>Résultat attendu:</strong> Disqualification immédiate (&lt;3 messages)</p>
              </div>
            </details>
          </div>
        </div>

        {/* API Endpoint Info */}
        <div className="bg-gray-50 rounded-xl p-8 border border-gray-300">
          <h2 className="text-xl font-bold text-navy mb-4">📡 API Endpoint</h2>
          <div className="bg-white rounded-lg p-4 border border-gray-200 font-mono text-sm">
            <p className="text-gray-600 mb-2">POST</p>
            <p className="text-navy font-bold">/api/zedcheckout-chat</p>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Payload:</p>
            <pre className="bg-navy text-white p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "sessionId": "session_123",
  "message": "Bonjour",
  "conversationHistory": [...],
  "context": { ... }
}`}
            </pre>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Response (SSE Stream):</p>
            <pre className="bg-navy text-white p-4 rounded-lg text-xs overflow-x-auto">
{`event: typing_start
data: {"typing": true}

event: message_chunk
data: {"content": "Ok parfait.", "index": 0}

event: split_signal
data: {"split": true, "typing_delay_ms": 800}

event: message_chunk
data: {"content": "Vous êtes sur Shopify ?", "index": 1}

event: message_complete
data: {"typing": false, "context": {...}}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Chat Widget (always visible) */}
      <ZedCheckoutChat autoOpen={false} />
    </main>
  );
}

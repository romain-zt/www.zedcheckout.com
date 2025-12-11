import ChatWidget from '@/components/ChatWidget';

export default function ChatDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5EDE4] via-white to-[#FFC9B9]/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-[#E88B7A]/10 to-[#FFC9B9]/10 rounded-full border border-[#E88B7A]/20">
            <span className="text-sm font-semibold text-[#1E2A47]">
              ✨ Chat Widget Demo
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-[#1E2A47] mb-6 leading-tight">
            Découvrez notre
            <br />
            <span className="bg-gradient-to-r from-[#E88B7A] to-[#FFC9B9] bg-clip-text text-transparent">
              Chat Conversationnel
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Testez en direct notre système de qualification de leads par chat.
            Une expérience fluide, élégante et efficace pour engager vos visiteurs.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1E2A47] mb-2">
                Qualification Intelligente
              </h3>
              <p className="text-gray-600 text-sm">
                Questions contextuelles pour qualifier vos leads en temps réel
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1E2A47] mb-2">
                Expérience Premium
              </h3>
              <p className="text-gray-600 text-sm">
                Design glassmorphism moderne avec animations fluides
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E88B7A] to-[#FFC9B9] flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1E2A47] mb-2">
                Conversion Rapide
              </h3>
              <p className="text-gray-600 text-sm">
                Captez les informations essentielles en quelques secondes
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-16 bg-gradient-to-br from-[#1E2A47] to-[#2D3E5F] rounded-2xl p-8 text-left">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#FFC9B9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-3">
                  Comment tester ?
                </h3>
                <ol className="space-y-2 text-white/80">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E88B7A] text-white text-xs flex items-center justify-center font-bold">1</span>
                    <span>Cliquez sur le chat widget glassmorphism en bas de page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E88B7A] text-white text-xs flex items-center justify-center font-bold">2</span>
                    <span>Répondez aux questions de qualification (testez avec vraies infos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E88B7A] text-white text-xs flex items-center justify-center font-bold">3</span>
                    <span>Observez la validation en temps réel et les animations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E88B7A] text-white text-xs flex items-center justify-center font-bold">4</span>
                    <span>Le lead est automatiquement envoyé par email avec qualification</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-100 text-sm text-gray-600">
              ⚡ Framer Motion
            </div>
            <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-100 text-sm text-gray-600">
              🎨 Glassmorphism
            </div>
            <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-100 text-sm text-gray-600">
              🚀 Next.js 14
            </div>
            <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-100 text-sm text-gray-600">
              💎 TypeScript
            </div>
            <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-100 text-sm text-gray-600">
              📧 Nodemailer
            </div>
          </div>
        </div>
      </div>

      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#E88B7A]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#FFC9B9]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1E2A47]/5 rounded-full blur-3xl" />
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}

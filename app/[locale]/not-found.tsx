import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl mb-8">Page non trouvée / Page not found</h2>
        <div className="space-x-4">
          <Link 
            href="/fr-FR" 
            className="inline-block px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition"
          >
            Retour à l'accueil (FR)
          </Link>
          <Link 
            href="/en-EN" 
            className="inline-block px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition"
          >
            Back to home (EN)
          </Link>
        </div>
      </div>
    </div>
  );
}

import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ZedCheckout - Conversational Checkout',
    short_name: 'ZedCheckout',
    description: 'Transformez votre checkout en conversation',
    start_url: '/fr-FR',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1E2A47',
    icons: [
      {
        src: '/assets/logos/logo-accent.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Zedtech - Checkout Booster';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const title = locale === 'fr-FR' 
    ? 'Accélérez votre croissance vers Plus'
    : 'Accelerate Your Growth to Plus';
  
  const subtitle = locale === 'fr-FR'
    ? 'Optimisez votre checkout pendant votre phase de croissance'
    : 'Optimize your checkout during your growth phase';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          color: '#fff',
          padding: '80px',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 40,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 36,
            textAlign: 'center',
            opacity: 0.8,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            fontSize: 32,
            fontWeight: 'bold',
          }}
        >
          ZEDTECH
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

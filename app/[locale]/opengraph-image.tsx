import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const title = locale === 'fr-FR'
    ? 'ZedTech · Redonner sa chaleur humaine au e-commerce'
    : 'ZedTech · Bringing human warmth back to e-commerce';
  
  const subtitle = locale === 'fr-FR'
    ? '10,950h R&D · Lab indépendant'
    : '10,950h R&D · Independent lab';
  
  return new ImageResponse(
    (
      <div
        style={{
          background: '#F5EDE4',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#1E2A47',
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 1.2,
            maxWidth: '90%',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#FFC9B9',
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

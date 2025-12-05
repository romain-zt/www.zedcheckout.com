'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function SocialProof() {
  const t = useTranslations('social');

  return (
    <section className="social-proof">
      <div className="container">
        <div className="social-proof-content">
          <h3>{t('title')}</h3>
          <div className="social-proof-images">
            {[1, 2, 3, 4, 5].map((i) => (
              <Image
                unoptimized
                key={i}
                src={`https://placehold.co/120x40/CCCCCC/666666?text=Brand+${i}`}
                alt={`Client ${i}`}
                width={120}
                height={40}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

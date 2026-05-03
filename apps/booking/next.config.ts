import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@zedslot/domain',
    '@zedslot/booking-engine',
    '@zedslot/database',
    '@zedslot/payments',
    '@zedslot/auth',
    '@zedslot/email',
    '@zedslot/shopify',
  ],
};

export default nextConfig;

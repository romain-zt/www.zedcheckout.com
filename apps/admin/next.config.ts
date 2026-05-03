import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@zedslot/domain',
    '@zedslot/database',
  ],
}

export default withPayload(nextConfig)

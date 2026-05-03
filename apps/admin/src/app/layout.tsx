import React from 'react'

export const metadata = {
  title: 'zedslot Admin',
  description: 'Admin panel for zedslot booking management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

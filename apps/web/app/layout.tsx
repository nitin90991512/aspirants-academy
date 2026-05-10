import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Aspirants Academy — Gandhinagar | Classes 6th–12th | Navodaya Focus',
    template: '%s | Aspirants Academy',
  },
  description:
    'Aspirants Academy is Gandhinagar\'s premier coaching institute for Classes 6th–12th with specialized Navodaya Vidyalaya entrance preparation. Contact Nitin Sir: 9265720004',
  keywords: [
    'coaching institute gandhinagar',
    'navodaya vidyalaya coaching',
    'classes 6 to 12 coaching',
    'aspirants academy',
    'best coaching gandhinagar',
    'navodaya entrance preparation',
  ],
  authors: [{ name: 'Aspirants Academy' }],
  creator: 'Aspirants Academy',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Aspirants Academy',
    title: 'Aspirants Academy — Gandhinagar\'s Premier Coaching Institute',
    description: 'Expert coaching for Classes 6th–12th with Navodaya Vidyalaya specialization.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aspirants Academy — Gandhinagar',
    description: 'Expert coaching for Classes 6th–12th | Navodaya Specialists',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  )
}

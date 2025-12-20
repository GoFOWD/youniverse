import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '나의 바다를 찾아서',
  description: '심해에서 시작되는 당신의 이야기. 18가지 질문을 통해 당신의 내면을 탐험하세요.',
  keywords: ['심리테스트', '성격테스트', '심리분석', '자기탐구', 'Deep Ocean'],
  authors: [{ name: 'GoFOWD' }],
  creator: 'GoFOWD',
  publisher: 'GoFOWD',
  openGraph: {
    title: '나의 바다를 찾아서',
    description: '심해에서 시작되는 당신의 이야기. 18가지 질문을 통해 당신의 내면을 탐험하세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: '나의 바다를 찾아서',
  },
  twitter: {
    card: 'summary_large_image',
    title: '나의 바다를 찾아서',
    description: '심해에서 시작되는 당신의 이야기',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2243110505553175" crossOrigin="anonymous"></script>
        <script
          type="application/ld+json"

        />
      </head>
      <body>{children}</body>
    </html>
  );
}


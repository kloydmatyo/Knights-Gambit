import type { Metadata, Viewport } from 'next';
import './globals.css';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import ServiceWorkerRegister from './sw-register';

export const metadata: Metadata = {
  title: "Dicebound - Roguelike Board Game RPG",
  description: 'A 2D pixel art roguelike board-game RPG. Roll dice, collect treasure, and survive!',
  keywords: ['game', 'roguelike', 'rpg', 'board game', 'dice', 'fantasy'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Dicebound',
  },
  applicationName: 'Dicebound',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#d4a855',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dicebound" />
        <meta name="theme-color" content="#d4a855" />
      </head>
      <body>
        <ServiceWorkerRegister />
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}

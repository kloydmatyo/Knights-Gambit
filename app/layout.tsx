import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Knight's Gambit - Roguelike Board Game RPG",
  description: 'A 2D pixel art roguelike board-game RPG. Roll dice, collect treasure, and survive!',
  keywords: ['game', 'roguelike', 'rpg', 'board game', 'dice', 'fantasy'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

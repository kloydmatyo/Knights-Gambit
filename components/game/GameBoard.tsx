'use client';

import { useEffect, useRef, useState } from 'react';
import { BoardTile } from '@/lib/game-engine';
import { motion } from 'framer-motion';

interface GameBoardProps {
  tiles: BoardTile[];
  currentPosition: number;
  onTileClick?: (tileId: number) => void;
}

const tileEmojis: Record<BoardTile['type'], string> = {
  start: '🏁',
  normal: '⬜',
  enemy: '👹',
  shop: '🏪',
  event: '❓',
  boss: '💀',
};

const tileColors: Record<BoardTile['type'], string> = {
  start: 'bg-green-500',
  normal: 'bg-gray-500',
  enemy: 'bg-red-500',
  shop: 'bg-yellow-500',
  event: 'bg-blue-500',
  boss: 'bg-purple-600',
};

export default function GameBoard({ tiles, currentPosition, onTileClick }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Base dimensions for the board
      const baseWidth = 900;
      const baseHeight = 600;
      
      // Calculate scale to fit container while maintaining aspect ratio
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      const padding = mobile ? 10 : 30; // Minimal padding for larger board
      const scaleX = (containerWidth - padding) / baseWidth;
      const scaleY = (containerHeight - padding) / baseHeight;
      const maxScale = mobile ? 1.15 : 1.0; // Larger scaling like before
      const newScale = Math.min(scaleX, scaleY, maxScale);
      
      setScale(newScale);
      setDimensions({
        width: baseWidth * newScale,
        height: baseHeight * newScale,
      });
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connecting lines
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.3)';
    ctx.lineWidth = 2 * scale;
    ctx.setLineDash([8 * scale, 4 * scale]);

    for (let i = 0; i < tiles.length; i++) {
      const current = tiles[i];
      const next = tiles[(i + 1) % tiles.length];

      ctx.beginPath();
      ctx.moveTo(current.x * scale, current.y * scale);
      ctx.lineTo(next.x * scale, next.y * scale);
      ctx.stroke();
    }
  }, [tiles, scale]);

  const baseTileSize = 60; // Consistent size for all devices
  const tileSize = baseTileSize * scale;
  const halfTile = tileSize / 2;

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <div 
        className="relative"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        {/* Canvas for connecting lines */}
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Tiles */}
        {tiles.map((tile, index) => {
          const isCurrentPosition = tile.id === currentPosition;
          const isVisited = tile.visited;

          return (
            <motion.div
              key={tile.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.02 }}
              className="absolute"
              style={{
                left: `${tile.x * scale - halfTile}px`,
                top: `${tile.y * scale - halfTile}px`,
                width: `${tileSize}px`,
                height: `${tileSize}px`,
              }}
            >
              <div
                className={`
                  w-full h-full rounded-full flex items-center justify-center
                  border-4 transition-all cursor-pointer relative
                  ${tileColors[tile.type]}
                  ${isCurrentPosition ? 'border-game-gold scale-110 shadow-2xl z-10' : 'border-gray-700'}
                  ${isVisited ? 'opacity-100' : 'opacity-40'}
                  ${onTileClick ? 'hover:scale-105' : ''}
                `}
                onClick={() => onTileClick?.(tile.id)}
              >
                <span 
                  className="drop-shadow-lg"
                  style={{ fontSize: `${Math.max(24, 32 * scale)}px` }}
                >
                  {tileEmojis[tile.type]}
                </span>
                
                {/* Glow effect for current position */}
                {isCurrentPosition && (
                  <div className="absolute inset-0 rounded-full bg-game-gold opacity-20 animate-pulse" />
                )}
              </div>

              {/* Tile number */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 text-gray-400 font-bold bg-game-bg px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap"
                style={{ 
                  bottom: `-${tileSize * 0.35}px`,
                  fontSize: `${Math.max(9, 11 * scale)}px`,
                }}
              >
                {tile.id + 1}
              </div>

              {/* Current position indicator */}
              {isCurrentPosition && (
                <motion.div
                  animate={{ y: [-6, 6, -6] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute left-1/2 -translate-x-1/2 drop-shadow-lg z-20"
                  style={{ 
                    top: `-${tileSize * 0.5}px`,
                    fontSize: `${Math.max(20, 28 * scale)}px`,
                  }}
                >
                  👤
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

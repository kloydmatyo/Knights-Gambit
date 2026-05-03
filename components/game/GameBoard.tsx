'use client';

import { useEffect, useRef, useState } from 'react';
import { BoardTile } from '@/lib/game-engine/types';
import { motion } from 'framer-motion';

interface GameBoardProps {
  tiles: BoardTile[];
  currentPosition: number;
  choosableTileIds?: number[];
  onTileClick?: (tileId: number) => void;
  playerSpriteUrl?: string;
  highlightedTileId?: number | null;
}

const TILE_COLOR: Record<string, string> = {
  start: 'bg-green-500',
  enemy: 'bg-red-500',
  elite: 'bg-purple-700',
  shop: 'bg-yellow-500',
  event: 'bg-blue-500',
  boss: 'bg-red-800',
  trap: 'bg-orange-600',
};

/**
 * Draw an orthogonal bracket connector: horizontal from source to midpoint X,
 * then vertical to target Y, then horizontal to target — matching the tree diagram style.
 */
function drawBracketLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number
) {
  const midX = (x1 + x2) / 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(midX, y1);
  ctx.lineTo(midX, y2);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function getTileEmoji(tile: BoardTile): string {
  if (tile.type === 'trap') {
    if (tile.trapTriggered) return String.fromCharCode(10003);
    if (tile.trapType === 'fire') return String.fromCodePoint(0x1F525);
    if (tile.trapType === 'spike') return String.fromCodePoint(0x1F5E1) + String.fromCharCode(0xFE0F);
    if (tile.trapType === 'poison_gas') return String.fromCodePoint(0x1F9EA);
    return String.fromCharCode(0x26A0) + String.fromCharCode(0xFE0F);
  }
  const map: Record<string, string> = {
    start: String.fromCodePoint(0x1F3C1),
    enemy: String.fromCodePoint(0x1F479),
    elite: String.fromCodePoint(0x1F480),
    shop: String.fromCodePoint(0x1F3EA),
    event: String.fromCharCode(0x2753),
    boss: String.fromCharCode(0x2620) + String.fromCharCode(0xFE0F),
  };
  return map[tile.type] ?? String.fromCharCode(0x2B1C);
}

export default function GameBoard({
  tiles,
  currentPosition,
  choosableTileIds = [],
  onTileClick,
  playerSpriteUrl,
  highlightedTileId,
}: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;
      const mobile = window.innerWidth < 640;
      const pad = mobile ? 20 : 30;
      const s = Math.min((cw - pad) / 900, (ch - pad) / 600, mobile ? 1.4 : 1.4);
      setScale(s);
      setDimensions({ width: 900 * s, height: 600 * s });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw faint ghost lines for ALL connections (full map visibility)
    for (const tile of tiles) {
      if (!tile.nextIds) continue;
      for (const nextId of tile.nextIds) {
        const next = tiles.find(t => t.id === nextId);
        if (!next) continue;
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1.5 * scale;
        ctx.setLineDash([4 * scale, 6 * scale]);
        ctx.lineCap = 'square';
        drawBracketLine(ctx, tile.x * scale, tile.y * scale, next.x * scale, next.y * scale);
      }
    }
    ctx.setLineDash([]);

    // Draw visited trail first (behind everything)
    const visitedSet = new Set(tiles.filter(t => t.visited).map(t => t.id));
    for (const tile of tiles) {
      if (!visitedSet.has(tile.id) || !tile.nextIds) continue;
      for (const nextId of tile.nextIds) {
        if (!visitedSet.has(nextId)) continue;
        const next = tiles.find(t => t.id === nextId);
        if (!next) continue;
        ctx.strokeStyle = 'rgba(255,215,0,0.3)';
        ctx.lineWidth = 2 * scale;
        ctx.setLineDash([]);
        ctx.lineCap = 'square';
        drawBracketLine(ctx, tile.x * scale, tile.y * scale, next.x * scale, next.y * scale);
      }
    }

    // Draw lines from current tile to immediate next tiles
    const currentTile = tiles.find(t => t.id === currentPosition);
    if (currentTile?.nextIds) {
      for (const nextId of currentTile.nextIds) {
        const next = tiles.find(t => t.id === nextId);
        if (!next) continue;
        const highlighted = choosableTileIds.includes(nextId);
        ctx.strokeStyle = highlighted ? 'rgba(255,215,0,0.95)' : 'rgba(78,205,196,0.5)';
        ctx.lineWidth = highlighted ? 3.5 * scale : 2 * scale;
        ctx.setLineDash(highlighted ? [] : [6 * scale, 4 * scale]);
        ctx.lineCap = 'square';
        drawBracketLine(ctx, currentTile.x * scale, currentTile.y * scale, next.x * scale, next.y * scale);
      }
    }

    ctx.setLineDash([]);
  }, [tiles, scale, choosableTileIds, currentPosition]);

  const tileSize = 60 * scale;
  const half = tileSize / 2;
  const tokenTile = tiles.find(t => t.id === currentPosition);
  const tokenX = tokenTile ? tokenTile.x * scale : 0;
  const tokenY = tokenTile ? tokenTile.y * scale : 0;

  const currentTileRef = tiles.find(t => t.id === currentPosition);
  const immediateNextIds = new Set<number>(currentTileRef?.nextIds ?? []);
  const visitedIds = new Set<number>(tiles.filter(t => t.visited).map(t => t.id));

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0 pointer-events-none"
        />
        {tiles.map((tile, idx) => {
          const isCurrent = tile.id === currentPosition;
          const isChoosable = choosableTileIds.includes(tile.id);
          const choiceIndex = isChoosable ? choosableTileIds.indexOf(tile.id) : -1;
          const isVisited = visitedIds.has(tile.id);
          const isImmediateNext = immediateNextIds.has(tile.id);
          const isVisible = isCurrent || isVisited || isImmediateNext;
          const tileOpacity = isChoosable ? 1 : isCurrent ? 1 : isVisited ? 0.85 : isImmediateNext ? 0.6 : 0.2;
          const isInteractive = isChoosable;
          const isHighlighted = highlightedTileId === tile.id;

          return (
            <motion.div
              key={tile.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isHighlighted ? 1.35 : 1, opacity: tileOpacity }}
              transition={{ delay: idx * 0.01, scale: { type: 'spring', stiffness: 300, damping: 20 } }}
              className="absolute"
              style={{ left: tile.x * scale - half, top: tile.y * scale - half, width: tileSize, height: tileSize, zIndex: isHighlighted ? 30 : undefined }}
            >
              <div
                onClick={() => isInteractive && onTileClick?.(tile.id)}
                className={[
                  'w-full h-full rounded-full flex items-center justify-center border-4 transition-all relative',
                  isVisible ? (TILE_COLOR[tile.type] ?? 'bg-gray-500') : 'bg-gray-800',
                  isCurrent ? 'border-game-gold shadow-2xl z-10' : '',
                  isChoosable ? 'border-yellow-300 shadow-yellow-400/60 shadow-lg z-20 cursor-pointer scale-110' : 'border-gray-700',
                  tile.trapTriggered ? 'grayscale' : '',
                ].filter(Boolean).join(' ')}
              >
                {/* Number badge for choosable tiles */}
                {isChoosable && choiceIndex >= 0 && (
                  <div 
                    className="absolute -top-1 -right-1 rounded-full bg-game-gold text-black font-black flex items-center justify-center shadow-lg border-2 border-yellow-700 z-10"
                    style={{ 
                      width: Math.max(20, 28 * scale), 
                      height: Math.max(20, 28 * scale),
                      fontSize: Math.max(12, 16 * scale)
                    }}
                  >
                    {choiceIndex + 1}
                  </div>
                )}
                {/* Only show actual emoji for visited/current/choosable — undiscovered shows ? */}
                <span style={{ fontSize: Math.max(24, 32 * scale) }}>
                  {isVisible ? getTileEmoji(tile) : '❓'}
                </span>
                {isCurrent && <div className="absolute inset-0 rounded-full bg-game-gold opacity-20 animate-pulse" />}
                {isChoosable && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-yellow-300"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  />
                )}
              </div>
              {/* Only show type label for visible tiles */}
              {isVisible && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 text-gray-400 font-bold bg-game-bg px-1.5 py-0.5 rounded whitespace-nowrap capitalize"
                  style={{ bottom: -(tileSize * 0.35), fontSize: Math.max(9, 11 * scale) }}
                >
                  {tile.type === 'elite' ? '⚠ Elite' : tile.type === 'boss' ? '☠ Boss' : tile.type}
                </div>
              )}
            </motion.div>
          );
        })}
        <motion.div
          animate={{ x: tokenX, y: tokenY }}
          transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
          className="absolute pointer-events-none z-30"
          style={{ marginLeft: -(half * 1.8), marginTop: -(half * 0.5) }}
        >
          <motion.div
            animate={{ x: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="drop-shadow-lg select-none"
          >
            {playerSpriteUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={playerSpriteUrl}
                alt="player"
                style={{
                  width: Math.max(28, 36 * scale),
                  height: Math.max(28, 36 * scale),
                  imageRendering: 'pixelated',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <span style={{ fontSize: Math.max(20, 28 * scale) }}>{String.fromCodePoint(0x1F464)}</span>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

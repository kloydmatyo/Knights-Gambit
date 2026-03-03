'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { GameScene } from '@/game/scenes/GameScene';
import { MenuScene } from '@/game/scenes/MenuScene';
import { CombatScene } from '@/game/scenes/CombatScene';
import { SpriteTestScene } from '@/game/scenes/SpriteTestScene';
import { ClassSelectionScene } from '@/game/scenes/ClassSelectionScene';

export default function GameComponent() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1400,
      height: 900,
      parent: 'game-container',
      backgroundColor: '#1a1a2e',
      scene: [
        MenuScene,
        ClassSelectionScene,
        GameScene,
        CombatScene,
        SpriteTestScene,
      ],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1400,
        height: 900,
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="game-container" ref={containerRef} />;
}

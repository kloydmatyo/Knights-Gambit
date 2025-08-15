import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import { MenuScene } from "./scenes/MenuScene";
import { CombatScene } from "./scenes/CombatScene";
import { SpriteTestScene } from "./scenes/SpriteTestScene";
import { ClassSelectionScene } from "./scenes/ClassSelectionScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1400,
  height: 900,
  parent: "game-container",
  backgroundColor: "#1a1a2e",
  scene: [
    MenuScene,
    ClassSelectionScene,
    GameScene,
    CombatScene,
    SpriteTestScene,
  ],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);

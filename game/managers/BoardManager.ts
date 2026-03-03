import * as Phaser from "phaser";
import { BoardTile, TileType } from "../types/GameTypes";

export class BoardManager {
  private scene: Phaser.Scene;
  private tileSprites: Phaser.GameObjects.Rectangle[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createBoard(tiles: BoardTile[]): void {
    this.clearBoard();

    tiles.forEach((tile, index) => {
      const tileSprite = this.createTileSprite(tile);
      this.tileSprites.push(tileSprite);

      // Add tile number
      this.scene.add
        .text(tile.x, tile.y - 25, index.toString(), {
          fontSize: "12px",
          color: "#ffffff",
          fontFamily: "Courier New, monospace",
        })
        .setOrigin(0.5);
    });

    // Draw connecting lines between tiles
    this.drawConnections(tiles);
  }

  private createTileSprite(tile: BoardTile): Phaser.GameObjects.Rectangle {
    const color = this.getTileColor(tile.type);
    const size = 30;

    // Create a colored rectangle as tile sprite
    const tileSprite = this.scene.add.rectangle(
      tile.x,
      tile.y,
      size,
      size,
      color
    );

    // Add tile type indicator
    const symbol = this.getTileSymbol(tile.type);
    this.scene.add
      .text(tile.x, tile.y, symbol, {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "Courier New, monospace",
      })
      .setOrigin(0.5);

    return tileSprite;
  }

  private getTileColor(type: TileType): number {
    switch (type) {
      case TileType.START:
        return 0x4ecdc4; // Cyan
      case TileType.ENEMY:
        return 0xff4757; // Red
      case TileType.TREASURE:
        return 0xffe66d; // Yellow
      case TileType.SHOP:
        return 0x5f27cd; // Purple
      case TileType.EVENT:
        return 0xa8a8a8; // Gray
      case TileType.BOSS:
        return 0x2f1b69; // Dark Purple
      default:
        return 0x16213e; // Dark Blue
    }
  }

  private getTileSymbol(type: TileType): string {
    switch (type) {
      case TileType.START:
        return "S";
      case TileType.ENEMY:
        return "E";
      case TileType.TREASURE:
        return "T";
      case TileType.SHOP:
        return "$";
      case TileType.EVENT:
        return "?";
      case TileType.BOSS:
        return "B";
      default:
        return "";
    }
  }

  private drawConnections(tiles: BoardTile[]): void {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(2, 0x666666);

    for (let i = 0; i < tiles.length; i++) {
      const currentTile = tiles[i];
      const nextTile = tiles[(i + 1) % tiles.length];

      graphics.moveTo(currentTile.x, currentTile.y);
      graphics.lineTo(nextTile.x, nextTile.y);
    }

    graphics.strokePath();
  }

  private clearBoard(): void {
    this.tileSprites.forEach((sprite) => sprite.destroy());
    this.tileSprites = [];
  }
}

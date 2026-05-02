import { BoardTile, TrapType } from './types';
import { TILE_TYPES, TRAP_TYPES, getFloorInDungeon } from './constants';
import { EnemyEngine } from './EnemyEngine';

// ─── Layout constants ────────────────────────────────────────────────────────
const CENTER_X = 450;
const CENTER_Y = 300;
const CANVAS_W = 900;
const CANVAS_H = 600;

// Vein generation config
const VEIN_DEPTHS = 8;          // number of depth layers (excluding start)
const VEIN_TOTAL_NODES = 18;    // total interior nodes (excluding start + boss)
const JITTER = 20;              // max px of organic position noise (reduced for horizontal tree)

export class BoardEngine {
  static readonly BOSS_FLOOR_INDICES = [5, 10];

  static isBossFloor(floor: number): boolean {
    return this.BOSS_FLOOR_INDICES.includes(getFloorInDungeon(floor));
  }

  // ── Vein node type assignment ────────────────────────────────────────────
  // Assigns types organically: combat clusters early/mid, elites deeper,
  // shops guaranteed once, traps near shortcuts, events scattered.
  private static assignVeinTypes(
    nodes: { depth: number }[],
    isBoss: boolean,
    totalDepths: number
  ): BoardTile['type'][] {
    const types: BoardTile['type'][] = new Array(nodes.length).fill(TILE_TYPES.ENEMY);
    let shopPlaced = false;

    for (let i = 0; i < nodes.length; i++) {
      const d = nodes[i].depth;
      const progress = d / totalDepths; // 0 = shallow, 1 = deep

      if (d === 0) { types[i] = TILE_TYPES.START; continue; }
      if (d === totalDepths) { types[i] = isBoss ? TILE_TYPES.BOSS : TILE_TYPES.SHOP; continue; }

      // Guarantee one shop in the mid-zone
      if (!shopPlaced && progress >= 0.35 && progress <= 0.65 && Math.random() < 0.45) {
        types[i] = TILE_TYPES.SHOP;
        shopPlaced = true;
        continue;
      }

      // Weighted pool shifts with depth — no normal/safe tiles
      const r = Math.random();
      if (progress > 0.6 && r < 0.22) { types[i] = TILE_TYPES.ELITE; continue; }
      if (progress > 0.4 && r < 0.12) { types[i] = TILE_TYPES.TRAP; continue; }
      if (r < 0.22) { types[i] = TILE_TYPES.EVENT; continue; }
      types[i] = TILE_TYPES.ENEMY;
    }

    // Ensure shop was placed somewhere
    if (!shopPlaced) {
      const midIdx = nodes.findIndex(n => {
        const p = n.depth / totalDepths;
        return p >= 0.3 && p <= 0.7;
      });
      if (midIdx !== -1) types[midIdx] = TILE_TYPES.SHOP;
    }

    return types;
  }

  /**
   * Generate a full "vein network" board — pre-structured, organic, non-grid.
   *
   * Algorithm:
   *  1. Distribute VEIN_TOTAL_NODES across VEIN_DEPTHS layers (1–3 per layer, organic)
   *  2. Place nodes with jitter for organic feel
   *  3. Wire connections: each node connects to 1–3 nodes in the next layer
   *     with occasional skip-connections (shortcuts) for vein-like branching
   *  4. Assign types based on depth-weighted pools
   *  5. Guarantee reachability: every node is reachable from start
   */
  static generateBoard(floor: number): BoardTile[] {
    const isBoss = this.isBossFloor(floor);
    const trapTypes = Object.values(TRAP_TYPES) as TrapType[];
    const totalDepths = VEIN_DEPTHS; // interior depths (0 = start, totalDepths = boss)

    // ── Step 1: Decide node counts per depth layer ──────────────────────────
    // Organic widths: start narrow, fan out, converge, fan out again, converge to boss
    const depthWidths: number[] = [1]; // depth 0 = start
    for (let d = 1; d < totalDepths; d++) {
      const prev = depthWidths[d - 1];
      // Organic variation: 1–3 nodes, biased toward 2
      const options = prev === 1 ? [2, 2, 3] : prev === 3 ? [1, 2, 2] : [1, 2, 2, 3];
      depthWidths.push(options[Math.floor(Math.random() * options.length)]);
    }
    depthWidths.push(1); // final depth = boss/shop

    const allDepths = depthWidths.length; // totalDepths + 1 (includes boss layer)

    // ── Step 2: Place nodes with organic jitter ──────────────────────────────
    // Horizontal tree: depth increases left→right (X axis), columns spread top→bottom (Y axis)
    const marginX = 70;
    const marginY = 80;
    const usableW = CANVAS_W - marginX * 2;
    const usableH = CANVAS_H - marginY * 2;
    const depthSpacing = usableW / (allDepths - 1);

    const depthNodes: number[][] = []; // depthNodes[d] = array of tile ids at depth d
    const rawNodes: { id: number; depth: number; x: number; y: number }[] = [];
    let nextId = 0;

    for (let d = 0; d < allDepths; d++) {
      const count = depthWidths[d];
      const baseX = marginX + d * depthSpacing;
      const ids: number[] = [];

      for (let col = 0; col < count; col++) {
        const baseY = count === 1
          ? CENTER_Y
          : marginY + (col / (count - 1)) * usableH;

        // Organic jitter (none on start/boss)
        const jy = (d === 0 || d === allDepths - 1) ? 0 : (Math.random() - 0.5) * JITTER * 2;
        const jx = (d === 0 || d === allDepths - 1) ? 0 : (Math.random() - 0.5) * JITTER;

        rawNodes.push({ id: nextId, depth: d, x: Math.round(baseX + jx), y: Math.round(baseY + jy) });
        ids.push(nextId);
        nextId++;
      }
      depthNodes.push(ids);
    }

    // ── Step 3: Assign types ─────────────────────────────────────────────────
    const typeList = this.assignVeinTypes(
      rawNodes.map(n => ({ depth: n.depth })),
      isBoss,
      allDepths - 1
    );

    // ── Step 4: Build BoardTile objects ──────────────────────────────────────
    const tiles: BoardTile[] = rawNodes.map((n, i) => {
      const type = typeList[i];
      return {
        id: n.id,
        type,
        x: n.x,
        y: n.y,
        depth: n.depth,
        visited: n.depth === 0, // start tile (depth 0) is pre-visited
        nextIds: [],
        prevIds: [],
        ...(type === TILE_TYPES.ENEMY && { enemy: EnemyEngine.generateEnemy(floor) }),
        ...(type === TILE_TYPES.ELITE && { enemy: EnemyEngine.generateEliteEnemy(floor) }),
        ...(type === TILE_TYPES.TRAP && {
          trapType: trapTypes[Math.floor(Math.random() * trapTypes.length)],
          trapTriggered: false,
        }),
      };
    });

    // ── Step 5: Wire vein connections ────────────────────────────────────────
    // Primary: each node connects to 1–2 nodes in the next depth layer
    // Shortcut: ~20% chance a node also connects to a node 2 layers ahead (vein skip)
    for (let d = 0; d < allDepths - 1; d++) {
      const fromIds = depthNodes[d];
      const toIds = depthNodes[d + 1];

      for (let fi = 0; fi < fromIds.length; fi++) {
        const fromTile = tiles[fromIds[fi]];
        const connections = this.veinConnections(fi, fromIds.length, toIds, tiles);

        for (const toId of connections) {
          if (!fromTile.nextIds!.includes(toId)) fromTile.nextIds!.push(toId);
          const toTile = tiles[toId];
          if (!toTile.prevIds!.includes(fromIds[fi])) toTile.prevIds!.push(fromIds[fi]);
        }

        // Shortcut connection: skip one depth layer (~20% chance, not on last 2 depths)
        if (d < allDepths - 3 && Math.random() < 0.20) {
          const skipIds = depthNodes[d + 2];
          const skipTarget = skipIds[Math.floor(Math.random() * skipIds.length)];
          if (!fromTile.nextIds!.includes(skipTarget)) {
            fromTile.nextIds!.push(skipTarget);
            const skipTile = tiles[skipTarget];
            if (!skipTile.prevIds!.includes(fromIds[fi])) skipTile.prevIds!.push(fromIds[fi]);
          }
        }
      }
    }

    // ── Step 6: Guarantee all nodes are reachable ────────────────────────────
    // Any node with no prevIds (except start) gets connected from a random node in prev depth
    for (let d = 1; d < allDepths; d++) {
      for (const id of depthNodes[d]) {
        const tile = tiles[id];
        if (tile.prevIds!.length === 0) {
          const prevDepthIds = depthNodes[d - 1];
          const parent = tiles[prevDepthIds[Math.floor(Math.random() * prevDepthIds.length)]];
          if (!parent.nextIds!.includes(id)) parent.nextIds!.push(id);
          tile.prevIds!.push(parent.id);
        }
      }
    }

    return tiles;
  }

  /**
   * Organic vein connection: each node connects to 1–2 adjacent nodes in the next layer.
   * Avoids crossing by preferring column-aligned targets.
   */
  private static veinConnections(
    fromCol: number,
    fromCount: number,
    toIds: number[],
    tiles: BoardTile[]
  ): number[] {
    const toCount = toIds.length;
    if (toCount === 0) return [];
    if (toCount === 1) return [toIds[0]];

    // Map fromCol to a proportional position in toIds
    const ratio = fromCount === 1 ? 0.5 : fromCol / (fromCount - 1);
    const centerIdx = Math.round(ratio * (toCount - 1));

    // Connect to center + maybe one neighbor (organic branching)
    const result: number[] = [toIds[centerIdx]];
    const addNeighbor = Math.random() < 0.55; // 55% chance of 2 connections
    if (addNeighbor) {
      const neighborIdx = Math.random() < 0.5
        ? Math.max(0, centerIdx - 1)
        : Math.min(toCount - 1, centerIdx + 1);
      if (!result.includes(toIds[neighborIdx])) result.push(toIds[neighborIdx]);
    }

    return result;
  }

  /**
   * Get the directly adjacent tiles (1 step forward) from the current position.
   * This is what the player sees as branch options BEFORE rolling.
   */
  static getAdjacentTiles(board: BoardTile[], fromId: number): number[] {
    const tile = board.find(t => t.id === fromId);
    if (!tile || !tile.nextIds || tile.nextIds.length === 0) return [];
    return [...tile.nextIds];
  }

  /**
   * Given a player's current tile and a dice roll, return the set of reachable
   * tile ids (following nextIds chains for `diceValue` steps).
   * Returns unique leaf tile ids the player can choose from.
   * @deprecated Use getAdjacentTiles() for the new branch-choice system.
   */
  static getReachableTiles(board: BoardTile[], fromId: number, diceValue: number): number[] {
    // BFS/DFS exactly `diceValue` steps forward
    let frontier = new Set<number>([fromId]);

    for (let step = 0; step < diceValue; step++) {
      const next = new Set<number>();
      for (const id of frontier) {
        const tile = board.find(t => t.id === id);
        if (!tile) continue;
        if (tile.nextIds && tile.nextIds.length > 0) {
          for (const nid of tile.nextIds) next.add(nid);
        } else {
          // Dead end (boss/final tile) — stay
          next.add(id);
        }
      }
      frontier = next;
    }

    return Array.from(frontier);
  }

  // ── Standard helpers ─────────────────────────────────────────────────────

  static getTile(board: BoardTile[], position: number): BoardTile | undefined {
    return board.find((tile) => tile.id === position);
  }

  static visitTile(board: BoardTile[], position: number): BoardTile[] {
    return board.map((tile) =>
      tile.id === position ? { ...tile, visited: true } : tile
    );
  }

  static triggerTrap(board: BoardTile[], position: number): BoardTile[] {
    return board.map((tile) =>
      tile.id === position ? { ...tile, trapTriggered: true } : tile
    );
  }

  /**
   * Reshuffle non-fixed tiles (called on floor completion).
   * Regenerates the full vein network for the new floor.
   */
  static reshuffleBoard(board: BoardTile[], floor: number): BoardTile[] {
    // Just regenerate — the vein system is fully procedural per floor
    return this.generateBoard(floor);
  }

  // Legacy helpers kept for compatibility
  static getNextPosition(currentPosition: number, diceRoll: number, boardSize: number): number {
    return (currentPosition + diceRoll) % boardSize;
  }

  static isValidPosition(position: number, boardSize: number): boolean {
    return position >= 0 && position < boardSize;
  }
}

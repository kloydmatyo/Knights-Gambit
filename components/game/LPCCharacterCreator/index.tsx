'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLPCState } from './useLPCState';
import LPCPreview from './LPCPreview';
import { extractWalkPreviewFrame, getVariantThumbnailUrl, FRAME_SIZE } from './LPCRenderer';
import { LPCSelections, BodyType, ItemMeta } from './types';

interface Props {
  onConfirm: (spriteDataUrl: string, fullSheetDataUrl?: string) => void;
  characterClass?: string;
}

const EXCLUDED_ITEMS = new Set([
  'wheelchair',
  'wings_lizard_bat','wings_lizard','wings_bat','wings_feathered','wings_lizard_alt',
  'wings_lunar','wings_dragonfly_transparent','wings_dragonfly','wings_monarch_dots',
  'wings_monarch_edge','wings_monarch','wings_pixie_transparent','wings_pixie','hat_accessory_wings',
  'tail_lizard','tail_cat','tail_lizard_alt','tail_wolf_fluffy','tail_wolf',
]);

const BODY_TYPES: BodyType[] = ['male', 'female'];

const CATEGORIES = [
  { id: 'body',     icon: '🧍', label: 'Body' },
  { id: 'head',     icon: '😶', label: 'Head' },
  { id: 'hair',     icon: '💇', label: 'Hair' },
  { id: 'headwear', icon: '🎩', label: 'Hat' },
  { id: 'torso',    icon: '👕', label: 'Torso' },
  { id: 'arms',     icon: '💪', label: 'Arms' },
  { id: 'legs',     icon: '👖', label: 'Legs' },
  { id: 'feet',     icon: '👟', label: 'Feet' },
  { id: 'weapons',  icon: '⚔️', label: 'Weapon' },
  { id: 'tools',    icon: '🔧', label: 'Tools' },
];

const PREVIEW_ANIMS = ['walk', 'idle', 'slash', 'spellcast', 'run'];

const THUMB_SIZE = 48;
const IDLE_ROW = 22;
const SOUTH_DIR = 2;

// Weapons allowed per class
const CLASS_WEAPONS: Record<string, Set<string>> = {
  knight:    new Set(['weapon_sword_arming','weapon_sword_longsword','weapon_sword_longsword_alt','weapon_sword_glowsword','weapon_blunt_mace','weapon_blunt_waraxe','shield_kite','shield_round','shield_spartan','shield_heater_wood','shield_heater_revised_wood','shield_scutum']),
  archer:    new Set(['weapon_ranged_bow_normal','weapon_ranged_bow_recurve','weapon_ranged_bow_great','weapon_ranged_crossbow','weapon_ranged_boomerang','weapon_ranged_slingshot','weapon_ranged_bow_arrow']),
  mage:      new Set(['weapon_magic_crystal','weapon_magic_diamond','weapon_magic_gnarled','weapon_magic_loop','weapon_magic_s','weapon_magic_simple','weapon_magic_wand']),
  barbarian: new Set(['weapon_blunt_waraxe','weapon_blunt_flail','weapon_blunt_club','weapon_blunt_mace','weapon_polearm_halberd','weapon_polearm_scythe','weapon_polearm_spear','weapon_polearm_trident','weapon_polearm_dragonspear']),
  assassin:  new Set(['weapon_sword_dagger','weapon_sword_rapier','weapon_sword_katana','weapon_sword_scimitar','weapon_sword_saber']),
  cleric:    new Set(['weapon_blunt_mace','weapon_blunt_flail','weapon_blunt_club','weapon_polearm_cane','shield_plus','shield_crusader','shield_kite','shield_round']),
};

// ── Variant thumbnail ──────────────────────────────────────────────────────
function VariantThumb({ sheetUrl, idleSheetUrl, label, selected, onClick }: {
  sheetUrl: string | null; idleSheetUrl?: string | null;
  label: string; selected: boolean; onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!sheetUrl) { setFailed(true); return; }
    setLoaded(false); setFailed(false);

    function tryDraw(url: string, onFail: () => void) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.imageSmoothingEnabled = false;
        const rows = [
          { row: 8 + SOUTH_DIR, frame: 1 },
          { row: IDLE_ROW + SOUTH_DIR, frame: 0 },
          { row: SOUTH_DIR, frame: 0 },
          { row: 12 + SOUTH_DIR, frame: 0 },
        ];
        for (const { row, frame } of rows) {
          ctx.clearRect(0, 0, THUMB_SIZE, THUMB_SIZE);
          ctx.drawImage(img, frame * FRAME_SIZE, row * FRAME_SIZE, FRAME_SIZE, FRAME_SIZE, 0, 0, THUMB_SIZE, THUMB_SIZE);
          const px = ctx.getImageData(0, 0, THUMB_SIZE, THUMB_SIZE).data;
          if (px.some((v, i) => i % 4 === 3 && v > 10)) { setLoaded(true); return; }
        }
        onFail();
      };
      img.onerror = onFail;
      img.src = url;
    }

    tryDraw(sheetUrl, () => {
      if (idleSheetUrl && idleSheetUrl !== sheetUrl) tryDraw(idleSheetUrl, () => setFailed(true));
      else setFailed(true);
    });
  }, [sheetUrl, idleSheetUrl]);

  return (
    <button onClick={onClick} title={label}
      className={`relative flex flex-col items-center gap-0.5 p-1 rounded-lg border-2 transition-all hover:scale-105 ${
        selected ? 'border-game-gold bg-game-primary shadow-[0_0_8px_rgba(255,215,0,0.5)]'
                 : 'border-game-secondary bg-game-bg hover:border-gray-500'
      }`}
      style={{ width: THUMB_SIZE + 8 }}>
      <canvas ref={canvasRef} width={THUMB_SIZE} height={THUMB_SIZE}
        style={{ imageRendering: 'pixelated', display: loaded ? 'block' : 'none' }} />
      {(!loaded || failed) && (
        <div className="flex items-center justify-center bg-game-secondary rounded text-gray-400 text-[9px] text-center"
          style={{ width: THUMB_SIZE, height: THUMB_SIZE }}>
          {failed ? label.slice(0, 5) : '…'}
        </div>
      )}
      <span className={`text-[8px] leading-tight text-center truncate w-full ${selected ? 'text-game-gold font-bold' : 'text-gray-400'}`}>
        {label.replaceAll('_', ' ')}
      </span>
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function LPCCharacterCreator({ onConfirm, characterClass }: Props) {
  const {
    metadataReady, selections, bodyType, setBodyType,
    selectItem, deselectItem, resetSelections, setAllSelections, isRendering, canvasRef,
  } = useLPCState(characterClass);

  const [activeCategory, setActiveCategory] = useState('body');
  const [previewAnim, setPreviewAnim] = useState('walk');
  const [search, setSearch] = useState('');

  const metadata: Record<string, ItemMeta> = useMemo(
    () => (typeof window !== 'undefined' ? (window as any).itemMetadata : null) ?? {},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataReady]
  );

  const totalCategories = CATEGORIES.length;
  const equippedCount = Object.keys(selections).length;

  const panelItems = useMemo(() => {
    const allowedWeapons = characterClass ? CLASS_WEAPONS[characterClass] : null;
    const q = search.trim().toLowerCase();
    return Object.entries(metadata)
      .filter(([id, meta]) => {
        if ((meta.path?.[0] ?? '') !== activeCategory) return false;
        if (EXCLUDED_ITEMS.has(id)) return false;
        if (!meta.required?.includes(bodyType)) return false;
        if (activeCategory === 'weapons' && allowedWeapons && !allowedWeapons.has(id)) return false;
        if (q && !meta.name.toLowerCase().includes(q)) return false;
        return true;
      })
      .map(([id]) => id);
  }, [metadata, activeCategory, bodyType, characterClass, search]);

  function handleConfirm() {
    if (!canvasRef.current) return;
    const dataUrl = extractWalkPreviewFrame(canvasRef.current, 1);
    const fullSheet = canvasRef.current.toDataURL('image/png');
    onConfirm(dataUrl, fullSheet);
  }

  function randomizeAppearance() {
    const allowedWeapons = characterClass ? CLASS_WEAPONS[characterClass] : null;
    const newSelections: LPCSelections = {};

    if (metadata['body']) {
      const meta = metadata['body'];
      const variants = meta.variants ?? ['light'];
      const variant = variants[Math.floor(Math.random() * variants.length)];
      newSelections[meta.type_name] = { itemId: 'body', variant, name: `Body color (${variant})` };
    }

    const headId = bodyType === 'female' ? 'heads_human_female' : 'heads_human_male';
    const headMeta = metadata[headId] ?? metadata['heads_human_male'];
    if (headMeta) {
      const variants = headMeta.variants ?? ['light'];
      const variant = variants[Math.floor(Math.random() * variants.length)];
      const actualId = headId in metadata ? headId : 'heads_human_male';
      newSelections[headMeta.type_name] = { itemId: actualId, variant, name: `${headMeta.name} (${variant})` };
    }

    if (metadata['face_neutral']) {
      const meta = metadata['face_neutral'];
      const variants = meta.variants ?? ['light'];
      const variant = variants[Math.floor(Math.random() * variants.length)];
      newSelections[meta.type_name] = { itemId: 'face_neutral', variant, name: `Neutral (${variant})` };
    }

    for (const cat of CATEGORIES.map(c => c.id)) {
      if (cat === 'body' || cat === 'head') continue;
      const items = Object.entries(metadata).filter(([id, meta]) => {
        if ((meta.path?.[0] ?? '') !== cat) return false;
        if (EXCLUDED_ITEMS.has(id)) return false;
        if (!meta.required?.includes(bodyType)) return false;
        if (cat === 'weapons' && allowedWeapons && !allowedWeapons.has(id)) return false;
        return true;
      });
      if (items.length === 0 || Math.random() > 0.65) continue;
      const [itemId, meta] = items[Math.floor(Math.random() * items.length)];
      const variants = meta.variants ?? [];
      const variant = variants.length > 0 ? variants[Math.floor(Math.random() * variants.length)] : '';
      newSelections[meta.type_name] = { itemId, variant, name: `${meta.name} (${variant})` };
    }

    setAllSelections(newSelections);
  }

  if (!metadataReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-game-mana text-sm animate-pulse">Loading character creator...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-game-primary border border-game-secondary rounded-2xl overflow-hidden w-full"
      style={{ height: '78vh', minHeight: 540, maxWidth: 900 }}>

      {/* Hidden render canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── Main two-column body ── */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT: Category tabs + item grid ── */}
        <div className="flex flex-col border-r border-game-secondary" style={{ width: '42%', minWidth: 0 }}>

          {/* Category tab row */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-game-secondary bg-game-bg/50 shrink-0">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSearch(''); }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-game-accent text-black'
                    : 'bg-game-secondary text-gray-300 hover:bg-game-primary'
                }`}>
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Panel header: search + equipped count */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-game-secondary shrink-0">
            <input type="text" placeholder="Search..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-game-bg border border-game-secondary rounded-lg px-2 py-1 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-game-gold" />
            <span className="text-xs text-gray-400 shrink-0">{equippedCount}/{totalCategories}</span>
          </div>

          {/* Item grid — scrollable */}
          <div className="flex-1 overflow-y-auto p-2">
            {panelItems.length === 0 && (
              <p className="text-gray-500 text-xs text-center py-6">No items</p>
            )}
            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))' }}>
              {/* None tile */}
              {(() => {
                const catMeta = Object.values(metadata).find(m => (m.path?.[0] ?? '') === activeCategory && m.required?.includes(bodyType));
                if (!catMeta) return null;
                const isNoneSelected = !Object.values(selections).some(s => {
                  const m = metadata[s.itemId];
                  return m && (m.path?.[0] ?? '') === activeCategory;
                });
                return (
                  <button onClick={() => deselectItem(catMeta.type_name)}
                    className={`flex flex-col items-center gap-0.5 p-1 rounded-lg border-2 transition-all hover:scale-105 ${
                      isNoneSelected ? 'border-game-gold bg-game-primary' : 'border-game-secondary bg-game-bg hover:border-gray-500'
                    }`} style={{ width: THUMB_SIZE + 8 }}>
                    <div className="flex items-center justify-center bg-game-secondary rounded text-gray-400 text-lg"
                      style={{ width: THUMB_SIZE, height: THUMB_SIZE }}>✕</div>
                    <span className={`text-[8px] text-center ${isNoneSelected ? 'text-game-gold font-bold' : 'text-gray-400'}`}>None</span>
                  </button>
                );
              })()}

              {panelItems.map(itemId => {
                const meta = metadata[itemId];
                if (!meta) return null;
                const sel = selections[meta.type_name];
                const hasVariants = meta.variants && meta.variants.length > 0;

                if (!hasVariants) {
                  const isSelected = sel?.itemId === itemId;
                  return (
                    <button key={itemId}
                      onClick={() => isSelected ? deselectItem(meta.type_name) : selectItem(itemId, '')}
                      className={`flex flex-col items-center gap-0.5 p-1 rounded-lg border-2 transition-all hover:scale-105 ${
                        isSelected ? 'border-game-gold bg-game-primary shadow-[0_0_8px_rgba(255,215,0,0.5)]'
                                   : 'border-game-secondary bg-game-bg hover:border-gray-500'
                      }`} style={{ width: THUMB_SIZE + 8 }}>
                      <div className="flex items-center justify-center bg-game-secondary rounded text-gray-300 text-xs font-bold"
                        style={{ width: THUMB_SIZE, height: THUMB_SIZE }}>{meta.name.slice(0, 4)}</div>
                      <span className={`text-[8px] truncate w-full text-center ${isSelected ? 'text-game-gold font-bold' : 'text-gray-400'}`}>
                        {meta.name}
                      </span>
                    </button>
                  );
                }

                return meta.variants.map(variant => {
                  const isSelected = sel?.itemId === itemId && sel?.variant === variant;
                  return (
                    <VariantThumb key={`${itemId}_${variant}`}
                      sheetUrl={getVariantThumbnailUrl(meta, variant, bodyType, selections)}
                      idleSheetUrl={getVariantThumbnailUrl(meta, variant, bodyType, selections, 'idle')}
                      label={`${meta.name} · ${variant.replaceAll('_', ' ')}`}
                      selected={isSelected}
                      onClick={() => isSelected ? deselectItem(meta.type_name) : selectItem(itemId, variant)}
                    />
                  );
                });
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Character preview ── */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[#0a0e1a]">
          {/* Dungeon background */}
          <div className="absolute inset-0"
            style={{ backgroundImage: 'url(/background/Arena_BG.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
          {/* Shadow under character */}
          <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-24 h-4 bg-black/50 rounded-full blur-md" />
          {/* Preview */}
          <div className="relative z-10">
            <LPCPreview sourceCanvas={canvasRef} animation={previewAnim} scale={6} isRendering={isRendering} />
          </div>
        </div>
      </div>

      {/* ── FOOTER BAR ── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-t border-game-secondary bg-game-bg/80">
        {/* Gender */}
        <div className="flex gap-1 shrink-0">
          {BODY_TYPES.map(bt => (
            <button key={bt} onClick={() => setBodyType(bt)}
              className={`px-3 py-1.5 text-xs rounded-lg capitalize font-bold transition-colors ${
                bodyType === bt ? 'bg-game-gold text-black' : 'bg-game-secondary text-gray-300 hover:bg-game-primary'
              }`}>{bt}</button>
          ))}
        </div>

        <div className="w-px h-5 bg-white/20 shrink-0" />

        {/* Animation pill toggle */}
        <div className="flex gap-0.5 bg-game-secondary rounded-lg p-0.5 shrink-0">
          {PREVIEW_ANIMS.map(anim => (
            <button key={anim} onClick={() => setPreviewAnim(anim)}
              className={`px-2.5 py-1 text-[10px] rounded-md capitalize font-bold transition-colors ${
                previewAnim === anim ? 'bg-game-accent text-black' : 'text-gray-400 hover:text-white'
              }`}>{anim}</button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Randomize + Reset */}
        <button onClick={randomizeAppearance}
          className="text-purple-400 hover:text-purple-300 text-xs font-bold transition-colors shrink-0">
          🎲 Random
        </button>
        <button onClick={resetSelections}
          className="text-red-400 hover:text-red-300 text-xs underline transition-colors shrink-0">
          Reset
        </button>

        {/* Confirm — dominant CTA */}
        <button onClick={handleConfirm}
          disabled={isRendering || Object.keys(selections).length === 0}
          className="shrink-0 px-8 py-2.5 rounded-xl font-black text-sm bg-game-gold text-black hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg border-b-4 border-yellow-700 active:scale-95">
          {isRendering ? 'Rendering...' : '✓ Confirm Appearance'}
        </button>
      </div>
    </div>
  );
}

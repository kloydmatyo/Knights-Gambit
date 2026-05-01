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

// Weapons allowed per class — item IDs from the weapons category
const CLASS_WEAPONS: Record<string, Set<string>> = {
  knight:    new Set(['weapon_sword_arming','weapon_sword_longsword','weapon_sword_longsword_alt','weapon_sword_glowsword','weapon_blunt_mace','weapon_blunt_waraxe','shield_kite','shield_round','shield_spartan','shield_heater_wood','shield_heater_revised_wood','shield_scutum']),
  archer:    new Set(['weapon_ranged_bow_normal','weapon_ranged_bow_recurve','weapon_ranged_bow_great','weapon_ranged_crossbow','weapon_ranged_boomerang','weapon_ranged_slingshot','weapon_ranged_bow_arrow']),
  mage:      new Set(['weapon_magic_crystal','weapon_magic_diamond','weapon_magic_gnarled','weapon_magic_loop','weapon_magic_s','weapon_magic_simple','weapon_magic_wand']),
  barbarian: new Set(['weapon_blunt_waraxe','weapon_blunt_flail','weapon_blunt_club','weapon_blunt_mace','weapon_polearm_halberd','weapon_polearm_scythe','weapon_polearm_spear','weapon_polearm_trident','weapon_polearm_dragonspear']),
  assassin:  new Set(['weapon_sword_dagger','weapon_sword_rapier','weapon_sword_katana','weapon_sword_scimitar','weapon_sword_saber']),
  cleric:    new Set(['weapon_blunt_mace','weapon_blunt_flail','weapon_blunt_club','weapon_polearm_cane','shield_plus','shield_crusader','shield_kite','shield_round']),
};

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

const IDLE_ROW = 22;
const SOUTH_DIR = 2;
const THUMB_SIZE = 56;

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
        selected
          ? 'border-cyan-400 bg-black/60 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
          : 'border-white/15 bg-black/40 hover:border-white/40'
      }`}
      style={{ width: THUMB_SIZE + 8 }}>
      <canvas ref={canvasRef} width={THUMB_SIZE} height={THUMB_SIZE}
        style={{ imageRendering: 'pixelated', display: loaded ? 'block' : 'none' }} />
      {(!loaded || failed) && (
        <div className="flex items-center justify-center bg-white/5 rounded text-gray-500 text-[9px] text-center"
          style={{ width: THUMB_SIZE, height: THUMB_SIZE }}>
          {failed ? label.slice(0, 5) : '…'}
        </div>
      )}
      <span className={`text-[8px] leading-tight text-center truncate w-full ${selected ? 'text-cyan-300 font-bold' : 'text-gray-400'}`}>
        {label.replaceAll('_', ' ')}
      </span>
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function LPCCharacterCreator({ onConfirm, characterClass }: Props) {
  const {
    metadataReady, selections, bodyType, setBodyType,
    selectItem, deselectItem, resetSelections, isRendering, canvasRef,
  } = useLPCState();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [previewAnim, setPreviewAnim] = useState('walk');

  const metadata: Record<string, ItemMeta> = useMemo(
    () => (typeof window !== 'undefined' ? (window as any).itemMetadata : null) ?? {},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataReady]
  );

  const panelItems = useMemo(() => {
    if (!activeCategory) return [];
    const allowedWeapons = characterClass ? CLASS_WEAPONS[characterClass] : null;
    return Object.entries(metadata)
      .filter(([id, meta]) => {
        if ((meta.path?.[0] ?? '') !== activeCategory) return false;
        if (EXCLUDED_ITEMS.has(id)) return false;
        if (!meta.required?.includes(bodyType)) return false;
        // Filter weapons by class
        if (activeCategory === 'weapons' && allowedWeapons && !allowedWeapons.has(id)) return false;
        return true;
      })
      .map(([id]) => id);
  }, [metadata, activeCategory, bodyType, characterClass]);

  function handleConfirm() {
    if (!canvasRef.current) return;
    const dataUrl = extractWalkPreviewFrame(canvasRef.current, 1);
    const fullSheet = canvasRef.current.toDataURL('image/png');
    onConfirm(dataUrl, fullSheet);
  }

  if (!metadataReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-game-mana text-sm animate-pulse">Loading character creator...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ height: '82vh', minHeight: 520 }}>

      {/* ── Background ── */}
      <div className="absolute inset-0"
        style={{ backgroundImage: 'url(/background/Arena_BG.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="absolute inset-0 bg-black/55" />

      {/* Hidden render canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── Left: category icon strip ── */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex flex-col items-center py-4 gap-1"
        style={{ width: 56, background: 'rgba(0,0,0,0.75)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button key={cat.id}
              onClick={() => setActiveCategory(isActive ? null : cat.id)}
              title={cat.label}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110 ${
                isActive
                  ? 'bg-cyan-500/30 border-2 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                  : 'bg-white/5 border border-white/10 hover:bg-white/15'
              }`}>
              {cat.icon}
            </button>
          );
        })}
      </div>

      {/* ── Sliding item panel ── */}
      <AnimatePresence>
        {activeCategory && (
          <motion.div
            key={activeCategory}
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 bottom-0 z-10 flex flex-col"
            style={{ left: 56, width: 220, background: 'rgba(0,0,0,0.82)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 shrink-0">
              <span className="text-white font-bold text-sm capitalize">
                {CATEGORIES.find(c => c.id === activeCategory)?.label}
              </span>
              <button onClick={() => setActiveCategory(null)} className="text-gray-400 hover:text-white text-lg leading-none">×</button>
            </div>

            {/* Scrollable grid */}
            <div className="flex-1 overflow-y-auto p-2">
              {panelItems.length === 0 && (
                <p className="text-gray-500 text-xs text-center py-6">No items</p>
              )}
              <div className="grid grid-cols-2 gap-2">
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
                          isSelected ? 'border-cyan-400 bg-black/60' : 'border-white/15 bg-black/40 hover:border-white/40'
                        }`}>
                        <div className="flex items-center justify-center bg-white/5 rounded text-gray-300 text-xs font-bold"
                          style={{ width: THUMB_SIZE, height: THUMB_SIZE }}>
                          {meta.name.slice(0, 4)}
                        </div>
                        <span className={`text-[8px] truncate w-full text-center ${isSelected ? 'text-cyan-300 font-bold' : 'text-gray-400'}`}>
                          {meta.name}
                        </span>
                      </button>
                    );
                  }

                  return meta.variants.map(variant => {
                    const isSelected = sel?.itemId === itemId && sel?.variant === variant;
                    return (
                      <VariantThumb
                        key={`${itemId}_${variant}`}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Center: character preview ── */}
      <div className="absolute inset-0 flex items-center justify-center z-0" style={{ paddingLeft: 56 }}>
        <LPCPreview sourceCanvas={canvasRef} animation={previewAnim} scale={6} isRendering={isRendering} />
      </div>

      {/* ── Bottom toolbar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(0,0,0,0.75)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>

        {/* Left: body type + animation */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {BODY_TYPES.map(bt => (
              <button key={bt} onClick={() => setBodyType(bt)}
                className={`px-3 py-1 text-xs rounded-lg capitalize font-bold transition-colors ${
                  bodyType === bt ? 'bg-game-gold text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}>
                {bt}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-white/20" />
          <div className="flex gap-1">
            {['walk', 'idle', 'slash', 'spellcast', 'run'].map(anim => (
              <button key={anim} onClick={() => setPreviewAnim(anim)}
                className={`px-2 py-1 text-[10px] rounded capitalize transition-colors ${
                  previewAnim === anim ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}>
                {anim}
              </button>
            ))}
          </div>
        </div>

        {/* Center: equipped count + reset */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{Object.keys(selections).length} equipped</span>
          <button onClick={resetSelections} className="text-red-400 hover:text-red-300 underline">Reset</button>
        </div>

        {/* Right: confirm */}
        <button
          onClick={handleConfirm}
          disabled={isRendering || Object.keys(selections).length === 0}
          className="px-6 py-2 rounded-xl font-bold text-sm bg-game-gold text-black hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          {isRendering ? 'Rendering...' : '✓ Confirm Appearance'}
        </button>
      </div>
    </div>
  );
}

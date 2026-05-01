'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LPCSelections, BodyType, ItemMeta } from './types';
import { renderCharacterToCanvas } from './LPCRenderer';

// Default outfit per class: [itemId, variant]
const CLASS_DEFAULTS: Record<string, Array<[string, string]>> = {
  knight:    [['torso_armour_plate',   'steel'],   ['legs_armour_plate',  'steel']],
  archer:    [['torso_armour_leather', 'forest'],  ['legs_armour_leather','forest']],
  mage:      [['torso_robe',           'blue'],    ['legs_robe',          'blue']],
  barbarian: [['torso_bandages',       'bandages'],['legs_pants',         'brown']],
  assassin:  [['torso_armour_leather', 'black'],   ['legs_armour_leather','black']],
  cleric:    [['torso_robe',           'white'],   ['legs_robe',          'white']],
};

// Fallback outfit if class-specific items don't exist in metadata
const FALLBACK_OUTFIT: Array<[string, string]> = [
  ['torso_armour_leather', 'leather'],
];

export function useLPCState(characterClass?: string) {
  const [metadataReady, setMetadataReady] = useState(false);
  const [selections, setSelections] = useState<LPCSelections>({});
  const [bodyType, setBodyType] = useState<BodyType>('male');
  const [isRendering, setIsRendering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if ((window as any).itemMetadata) {
      setMetadataReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = '/item-metadata.js';
    script.onload = () => setMetadataReady(true);
    script.onerror = () => console.error('Failed to load item-metadata.js');
    document.head.appendChild(script);
  }, []);

  // Set defaults once metadata is ready
  useEffect(() => {
    if (!metadataReady) return;
    const metadata: Record<string, ItemMeta> = (window as any).itemMetadata;
    const defaults: LPCSelections = {};

    // Body, head, face
    if (metadata['body']) {
      const meta = metadata['body'];
      defaults[meta.type_name] = { itemId: 'body', variant: 'light', name: 'Body color (light)' };
    }
    if (metadata['heads_human_male']) {
      const meta = metadata['heads_human_male'];
      defaults[meta.type_name] = { itemId: 'heads_human_male', variant: 'light', name: 'Human male (light)' };
    }
    if (metadata['face_neutral']) {
      const meta = metadata['face_neutral'];
      defaults[meta.type_name] = { itemId: 'face_neutral', variant: 'light', name: 'Neutral (light)' };
    }

    // Class-appropriate clothing
    const outfitItems = (characterClass && CLASS_DEFAULTS[characterClass])
      ? CLASS_DEFAULTS[characterClass]
      : FALLBACK_OUTFIT;

    for (const [itemId, variant] of outfitItems) {
      const meta = metadata[itemId];
      if (!meta) continue;
      // Use first available variant if the specified one doesn't exist
      const actualVariant = meta.variants?.includes(variant) ? variant : (meta.variants?.[0] ?? variant);
      defaults[meta.type_name] = { itemId, variant: actualVariant, name: `${meta.name} (${actualVariant})` };
    }

    setSelections(defaults);
  }, [metadataReady, characterClass]);

  // Re-render whenever selections or bodyType change
  useEffect(() => {
    if (!metadataReady || !canvasRef.current) return;
    setIsRendering(true);
    renderCharacterToCanvas(canvasRef.current, selections, bodyType)
      .finally(() => setIsRendering(false));
  }, [selections, bodyType, metadataReady]);

  const selectItem = useCallback((itemId: string, variant: string) => {
    const metadata: Record<string, ItemMeta> = (window as any).itemMetadata;
    const meta = metadata?.[itemId];
    if (!meta) return;

    const group = meta.type_name;
    setSelections(prev => {
      const next = { ...prev, [group]: { itemId, variant, name: `${meta.name} (${variant})` } };

      // Auto-match body color
      if (meta.matchBodyColor || (meta as any).match_body_color) {
        for (const [g, sel] of Object.entries(next)) {
          const m2 = metadata[sel.itemId];
          if (!m2) continue;
          if ((m2.matchBodyColor || (m2 as any).match_body_color) && m2.variants?.includes(variant)) {
            next[g] = { ...sel, variant, name: `${m2.name} (${variant})` };
          }
        }
      }
      return next;
    });
  }, []);

  const deselectItem = useCallback((group: string) => {
    setSelections(prev => {
      const next = { ...prev };
      delete next[group];
      return next;
    });
  }, []);

  const resetSelections = useCallback(() => {
    setSelections({});
  }, []);

  const setAllSelections = useCallback((newSelections: LPCSelections) => {
    setSelections(newSelections);
  }, []);

  return {
    metadataReady,
    selections,
    bodyType,
    setBodyType,
    selectItem,
    deselectItem,
    resetSelections,
    setAllSelections,
    isRendering,
    canvasRef,
  };
}

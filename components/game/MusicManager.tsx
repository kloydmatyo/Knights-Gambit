'use client';

import { useEffect, useRef } from 'react';

type MusicTrack = 'home' | 'character_creation' | 'map' | 'combat' | 'shop' | null;

interface MusicManagerProps {
  track: MusicTrack;
  volume?: number;
}

const TRACKS = {
  home: '/ost/home_ost.mp3',
  character_creation: '/ost/Character_Creation_BG.mp3',
  map: '/ost/map_ost.mp3',
  combat: '/ost/Enemy_ost.mp3',
  shop: '/ost/Shop_ost.mp3',
};

export default function MusicManager({ track, volume = 0.3 }: MusicManagerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<MusicTrack>(null);

  useEffect(() => {
    // Initialize audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    // Handle track changes
    if (track !== currentTrackRef.current) {
      currentTrackRef.current = track;

      if (track && TRACKS[track]) {
        // Fade out current track
        const fadeOut = setInterval(() => {
          if (audio.volume > 0.05) {
            audio.volume = Math.max(0, audio.volume - 0.05);
          } else {
            clearInterval(fadeOut);
            audio.pause();
            
            // Load and play new track
            audio.src = TRACKS[track];
            audio.volume = 0;
            audio.play().catch(err => console.log('Audio play failed:', err));
            
            // Fade in new track
            const fadeIn = setInterval(() => {
              if (audio.volume < volume - 0.05) {
                audio.volume = Math.min(volume, audio.volume + 0.05);
              } else {
                audio.volume = volume;
                clearInterval(fadeIn);
              }
            }, 50);
          }
        }, 50);
      } else {
        // Fade out and stop
        const fadeOut = setInterval(() => {
          if (audio.volume > 0.05) {
            audio.volume = Math.max(0, audio.volume - 0.05);
          } else {
            clearInterval(fadeOut);
            audio.pause();
            audio.src = '';
          }
        }, 50);
      }
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [track, volume]);

  return null; // This component doesn't render anything
}

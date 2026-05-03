'use client';

import { useEffect, useRef, useState } from 'react';

type MusicTrack = 'home' | 'character_creation' | 'map' | 'combat' | 'elite_combat' | 'boss_combat' | 'shop' | null;

interface MusicManagerProps {
  track: MusicTrack;
  volume?: number;
  muted?: boolean;
}

const TRACKS = {
  home: '/ost/home_ost.mp3',
  character_creation: '/ost/Character_Creation_BG.mp3',
  map: '/ost/map_ost.mp3',
  combat: '/ost/Enemy_ost.mp3',
  elite_combat: '/ost/elite_enemy_ost.mp3',
  boss_combat: '/ost/boss_enemy_ost.mp3',
  shop: '/ost/Shop_ost.mp3',
};

export default function MusicManager({ track, volume = 0.3, muted = false }: MusicManagerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
      
      // Add event listeners for debugging
      audioRef.current.addEventListener('canplay', () => {
        console.log('Audio can play');
        setIsReady(true);
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
      });
    }

    const audio = audioRef.current;

    // Stop if muted
    if (muted) {
      audio.pause();
      return;
    }

    // Load and play track
    if (track && TRACKS[track]) {
      const trackUrl = TRACKS[track];
      console.log('Loading track:', track, trackUrl);
      
      // Only change source if it's different
      if (audio.src !== window.location.origin + trackUrl) {
        audio.src = trackUrl;
        audio.load();
        
        // Try to play
        audio.play()
          .then(() => console.log('Playing:', track))
          .catch(err => {
            console.error('Play failed:', err);
            // Retry on next user interaction
            const retry = () => {
              audio.play()
                .then(() => console.log('Retry successful'))
                .catch(e => console.error('Retry failed:', e));
              document.removeEventListener('click', retry);
            };
            document.addEventListener('click', retry, { once: true });
          });
      } else if (audio.paused) {
        // Same track, just resume
        audio.play().catch(err => console.error('Resume failed:', err));
      }
    } else {
      // No track, stop audio
      audio.pause();
      audio.src = '';
    }

    // Cleanup
    return () => {
      // Don't cleanup audio element, just pause it
      if (audioRef.current && !muted) {
        audioRef.current.pause();
      }
    };
  }, [track, volume, muted]);

  return null;
}

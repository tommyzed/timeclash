import { useCallback } from 'react';
import correctSound from '@/assets/sounds/correct.mp3';
import incorrectSound from '@/assets/sounds/incorrect.mp3';
import winSound from '@/assets/sounds/win.mp3';
import loseSound from '@/assets/sounds/lose.mp3';


const sounds = {
  correct: correctSound,
  incorrect: incorrectSound,
  win: winSound,
  lose: loseSound
};

export type SoundName = keyof typeof sounds;

export function useSounds() {
  const playSound = useCallback((soundName: SoundName) => {
    if (typeof window !== 'undefined') {
      const soundsEnabled = localStorage.getItem('soundsEnabled') === 'true';
      if (soundsEnabled) {
        const audio = new Audio(sounds[soundName]);
        audio.play().catch(error => {
          console.error(`Error playing sound: ${soundName}`, error);
        });
      }
    }
  }, []);

  return { playSound };
}

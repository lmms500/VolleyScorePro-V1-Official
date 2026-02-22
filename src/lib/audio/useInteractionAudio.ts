import { useRef, useMemo, useEffect } from 'react';
import { audioService } from '@lib/audio/AudioService';

export interface InteractionAudio {
  playTap: () => void;
  playConfirm: () => void;
  playError: () => void;
  playSuccess: () => void;
  playModalOpen: () => void;
  playNotification: () => void;
  playVoiceBeep: (type: 'success' | 'error' | 'confirm') => void;
}

export const useInteractionAudio = (enableSound: boolean): InteractionAudio => {
  audioService.init();

  const enabledRef = useRef(enableSound);
  useEffect(() => { enabledRef.current = enableSound; }, [enableSound]);

  return useMemo(() => ({
    playTap: () => { if (enabledRef.current) audioService.playTap(); },
    playConfirm: () => { if (enabledRef.current) audioService.playConfirm(); },
    playError: () => { if (enabledRef.current) audioService.playError(); },
    playSuccess: () => { if (enabledRef.current) audioService.playSuccess(); },
    playModalOpen: () => { if (enabledRef.current) audioService.playModalOpen(); },
    playNotification: () => { if (enabledRef.current) audioService.playNotification(); },
    playVoiceBeep: (type: 'success' | 'error' | 'confirm') => { if (enabledRef.current) audioService.playVoiceBeep(type); }
  }), []);
};

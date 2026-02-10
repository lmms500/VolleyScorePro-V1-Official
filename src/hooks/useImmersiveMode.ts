import { useEffect } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';

// Interface matching the Native Plugin in MainActivity.java
interface SystemUiPlugin {
    setImmersiveMode(options: { enabled: boolean }): Promise<void>;
}

// Register the local plugin
const SystemUi = registerPlugin<SystemUiPlugin>('SystemUi');

/**
 * Hook to control Android Immersive Mode (Hide System Bars).
 * Uses the custom "SystemUi" plugin defined in MainActivity.java.
 * 
 * @param enable - Whether immersive mode should be active
 */
export const useImmersiveMode = (enable: boolean) => {
    useEffect(() => {
        // Only run on Android Native
        if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;

        const applyMode = async () => {
            try {
                // Call our custom native plugin
                await SystemUi.setImmersiveMode({ enabled: enable });
                // Using console.warn because console.log is stripped in production
                console.warn(`[ImmersiveMode] Set to: ${enable}`);
            } catch (err) {
                console.warn('[ImmersiveMode] Error calling SystemUi plugin:', err);
            }
        };

        // Small delay to ensure UI thread is ready (e.g. after modal animations)
        // and to allow keyboard to dismiss if necessary
        const timeoutId = setTimeout(applyMode, 50);

        return () => clearTimeout(timeoutId);
    }, [enable]);
};


import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ScreenOrientation } from '@capacitor/screen-orientation';

export const useNativeIntegration = (
    isMatchActive: boolean,
    isFullscreen: boolean,
    onBackAction: () => void,
    modalsOpen: boolean
) => {
    const isNative = Capacitor.isNativePlatform();

    // 1. Initial Native Setup (Status Bar & Splash)
    useEffect(() => {
        if (isNative) {
            const initNative = async () => {
                try {
                    // Transparent Status Bar for "Edge-to-Edge" look
                    await StatusBar.setStyle({ style: Style.Dark });
                    if (Capacitor.getPlatform() === 'android') {
                        await StatusBar.setOverlaysWebView({ overlay: true });
                        await StatusBar.setBackgroundColor({ color: '#00000000' });
                    }
                    
                    // Hide Splash smoothly
                    setTimeout(async () => {
                        await SplashScreen.hide();
                    }, 300);
                } catch (e) {
                    console.warn("Native init warning:", e);
                }
            };
            initNative();
        }
    }, [isNative]);

    // 2. Reactive Orientation Locking
    useEffect(() => {
        const lockOrientation = async () => {
            const targetOrientation = isFullscreen ? 'landscape' : 'portrait';
            
            if (isNative) {
                try {
                    await ScreenOrientation.lock({ orientation: targetOrientation });
                } catch (e) {
                    // Fallback or ignore if device doesn't support lock
                }
            } 
        };
        lockOrientation();
        
        // Cleanup: Reset to portrait on unmount if needed, or leave as is
        return () => {
            if (isNative && isFullscreen) {
               ScreenOrientation.lock({ orientation: 'portrait' }).catch(() => {});
            }
        }
    }, [isFullscreen, isNative]);

    // 3. Hardware Back Button Handling (Android)
    useEffect(() => {
        if (!isNative) return;

        let lastBackPress = 0;

        const handleBackButton = async () => {
            const now = Date.now();
            
            if (modalsOpen) {
                // If a modal is open (Settings, Roster, etc), close it via the provided callback
                onBackAction();
                return;
            }

            if (isMatchActive) {
                // Prevent accidental exit during a game
                // Could show a toast here: "Press back again to exit"
                if (now - lastBackPress < 2000) {
                    CapApp.minimizeApp(); // Minimize instead of Exit is standard Android behavior
                } else {
                    lastBackPress = now;
                    // Optional: Show native toast "Press again to exit"
                }
            } else {
                // On Home/Idle screen
                if (now - lastBackPress < 2000) {
                    CapApp.minimizeApp();
                } else {
                    lastBackPress = now;
                }
            }
        };

        const listener = CapApp.addListener('backButton', () => {
            handleBackButton();
        });

        return () => {
            listener.then(l => l.remove());
        };
    }, [isMatchActive, modalsOpen, onBackAction, isNative]);
};

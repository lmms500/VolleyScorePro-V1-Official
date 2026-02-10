
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';

// [LOTE 8.2] StatusBar and SystemUi imports removed - immersive mode now handled by useImmersiveMode hook

export const useNativeIntegration = (
    isMatchActive: boolean,
    isFullscreen: boolean,
    onBackAction: () => void,
    modalsOpen: boolean
) => {
    const isNative = Capacitor.isNativePlatform();
    const isAndroid = Capacitor.getPlatform() === 'android';

    // Inicialização única no mount
    // [LOTE 8.2] StatusBar initialization removed - conflicts with SystemUi plugin
    useEffect(() => {
        if (isNative) {
            const initNative = async () => {
                try {
                    // iOS: Teclado não redimensiona a UI
                    if (Capacitor.getPlatform() === 'ios') {
                        await Keyboard.setResizeMode({ mode: KeyboardResize.None });
                    }

                    // Esconder Splash Screen após a app carregar
                    setTimeout(async () => {
                        await SplashScreen.hide();
                    }, 500);
                } catch (e) {
                    console.warn("[NativeIntegration] Erro ao inicializar plugins nativos:", e);
                }
            };
            initNative();
        }
    }, [isNative]);

    // [LOTE 8.2] Controle de Modo Imersivo movido para useImmersiveMode hook

    // Bloqueio de Orientação Dinâmico (Híbrido: Nativo + PWA)
    useEffect(() => {
        const lockOrientation = async () => {
            try {
                if (isNative) {
                    // Capacitor: Lock nativo para APK/IPA
                    if (isFullscreen) {
                        // Landscape permite rotação automática (landscape-primary + landscape-secondary)
                        await ScreenOrientation.lock({ orientation: 'landscape' });
                    } else {
                        // Portrait fixo em modo normal
                        await ScreenOrientation.lock({ orientation: 'portrait' });
                    }
                } else {
                    // PWA: Screen Orientation API (requer fullscreen ativo primeiro)
                    if ('orientation' in screen && screen.orientation && 'lock' in screen.orientation) {
                        // Aguardar fullscreen estar ativo para lock funcionar
                        if (document.fullscreenElement) {
                            if (isFullscreen) {
                                // Landscape permite rotação esquerda/direita automaticamente
                                await (screen.orientation as any).lock('landscape');
                            } else {
                                // Portrait-primary (retrato travado)
                                await (screen.orientation as any).lock('portrait-primary');
                            }
                        }
                    }
                }
            } catch (e) {
                console.debug("[NativeIntegration] ScreenOrientation lock falhou:", e);
            }
        };

        // Delay para garantir que fullscreen foi ativado primeiro (PWA)
        const timer = setTimeout(lockOrientation, 100);
        return () => clearTimeout(timer);
    }, [isFullscreen, isNative]);

    // Controle de Fullscreen para PWA (Navegador)
    useEffect(() => {
        if (!isNative) {
            const manageFullscreen = async () => {
                try {
                    if (isFullscreen) {
                        // Entrar em fullscreen (necessário para orientation.lock funcionar)
                        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
                            await document.documentElement.requestFullscreen({ navigationUI: 'hide' } as any);
                        }
                    } else {
                        // Sair do fullscreen
                        if (document.exitFullscreen && document.fullscreenElement) {
                            await document.exitFullscreen();
                        }
                    }
                } catch (e) {
                    console.debug("[NativeIntegration] Fullscreen API não suportada ou bloqueada:", e);
                }
            };
            manageFullscreen();
        }
    }, [isFullscreen, isNative]);

    // Auto-ativar fullscreen ao carregar PWA instalado
    useEffect(() => {
        if (!isNative && typeof window !== 'undefined') {
            // Detectar se foi lançado como PWA instalado
            const isPWAInstalled = window.matchMedia('(display-mode: fullscreen)').matches ||
                window.matchMedia('(display-mode: standalone)').matches;

            // Se PWA instalado ou URL param fullscreen=true, ativar fullscreen
            const urlParams = new URLSearchParams(window.location.search);
            const shouldAutoFullscreen = isPWAInstalled || urlParams.get('fullscreen') === 'true';

            if (shouldAutoFullscreen && !document.fullscreenElement) {
                // Aguardar gesto do usuário (primeiro clique/toque)
                const activateFullscreen = async () => {
                    try {
                        await document.documentElement.requestFullscreen({ navigationUI: 'hide' } as any);
                        console.log('[PWA] Fullscreen ativado automaticamente');
                    } catch (e) {
                        console.debug('[PWA] Fullscreen requer gesto do usuário');
                    }
                };

                // Tentar imediatamente (se permitido) ou no primeiro toque
                activateFullscreen();
                document.addEventListener('click', activateFullscreen, { once: true });
                document.addEventListener('touchstart', activateFullscreen, { once: true });

                return () => {
                    document.removeEventListener('click', activateFullscreen);
                    document.removeEventListener('touchstart', activateFullscreen);
                };
            }
        }
    }, [isNative]);

    // Manipulação do Botão de Voltar (Android)
    useEffect(() => {
        if (!isNative) return;

        const listener = CapApp.addListener('backButton', ({ canGoBack }) => {
            if (modalsOpen) {
                onBackAction();
                return;
            }

            if (isMatchActive) {
                // Em jogo ativo, apenas minimizamos para evitar fechar por erro
                CapApp.minimizeApp();
            } else if (!canGoBack) {
                CapApp.exitApp();
            }
        });

        return () => {
            listener.then(l => l.remove());
        };
    }, [isNative, isMatchActive, modalsOpen, onBackAction]);
};

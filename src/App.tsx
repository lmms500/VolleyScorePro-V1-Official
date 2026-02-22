/**
 * App.tsx - Root component with providers and routing
 *
 * Routes:
 * - / (root) -> Landing Page
 * - /#app -> Game Screen
 * - /#landing -> Landing Page
 */

import React, { useState, useEffect } from 'react';
import { ResponsiveProvider } from './contexts/ResponsiveContext';
import { GameProvider } from './contexts/GameContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PerformanceProvider } from './contexts/PerformanceContext';
import { ErrorBoundary } from '@ui/ErrorBoundary';
import { TimerProvider } from './contexts/TimerContext';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { TimeoutProvider } from './contexts/TimeoutContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { GameScreen } from '@features/game/screens';
import { LandingPage } from '@pages/LandingPage';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

function App() {
    const [showApp, setShowApp] = useState(false);

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            SplashScreen.hide().catch(e => console.warn('Splash screen hide failed', e));
        }

        const html = document.documentElement;
        const body = document.body;

        const applyLandingMode = () => {
            // Clear shorthand and width before setting longhands to avoid cascade conflicts
            html.style.overflow = '';
            html.style.width = '';
            html.style.overflowY = 'auto';
            html.style.overflowX = 'hidden';
            html.style.position = 'static';
            html.style.height = 'auto';
            html.style.touchAction = 'pan-y';

            body.style.overflow = '';
            body.style.width = '';
            body.style.overflowY = 'auto';
            body.style.overflowX = 'hidden';
            body.style.position = 'static';
            body.style.height = 'auto';
            body.style.touchAction = 'pan-y';
        };

        const applyAppMode = () => {
            html.style.overflow = 'hidden';
            html.style.position = 'fixed';
            html.style.height = '100%';
            html.style.width = '100%';
            html.style.touchAction = 'none';

            body.style.overflow = 'hidden';
            body.style.position = 'fixed';
            body.style.height = '100%';
            body.style.width = '100%';
            body.style.touchAction = 'none';
        };

        const checkRoute = () => {
            if (Capacitor.isNativePlatform()) {
                setShowApp(true);
                applyAppMode();
                return;
            }

            const hash = window.location.hash;
            if (hash === '#app') {
                setShowApp(true);
                applyAppMode();
            } else {
                setShowApp(false);
                applyLandingMode();
            }
        };

        checkRoute();
        window.addEventListener('hashchange', checkRoute);
        return () => window.removeEventListener('hashchange', checkRoute);
    }, []);

    const handleEnterApp = () => {
        window.location.hash = '#app';
    };

    if (!showApp) {
        return (
            <LanguageProvider>
                <ThemeProvider>
                    <ErrorBoundary>
                        <LandingPage onEnterApp={handleEnterApp} />
                    </ErrorBoundary>
                </ThemeProvider>
            </LanguageProvider>
        );
    }

    return (
        <PerformanceProvider>
            <LayoutProvider>
                <ThemeProvider>
                    <ResponsiveProvider>
                        <ErrorBoundary>
                            <AuthProvider>
                                <TimerProvider>
                                    <GameProvider>
                                        <ModalProvider>
                                            <NotificationProvider>
                                                <TimeoutProvider>
                                                    <GameScreen />
                                                </TimeoutProvider>
                                            </NotificationProvider>
                                        </ModalProvider>
                                    </GameProvider>
                                </TimerProvider>
                            </AuthProvider>
                        </ErrorBoundary>
                    </ResponsiveProvider>
                </ThemeProvider>
            </LayoutProvider>
        </PerformanceProvider>
    );
}

export default App;

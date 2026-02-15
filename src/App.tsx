/**
 * App.tsx - Root component with providers only
 *
 * All game logic has been extracted to:
 * - src/screens/GameScreen.tsx (main game UI)
 * - src/hooks/useTimeoutManager.ts
 * - src/hooks/useSyncManager.ts
 *
 * This file now only handles provider composition.
 */

import React from 'react';
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
import { GameScreen } from '@features/game/screens';

function App() {
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

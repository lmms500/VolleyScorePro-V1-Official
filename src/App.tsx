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
import { GameProvider } from './contexts/GameContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { TimerProvider } from './contexts/TimerContext';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GameScreen } from './screens';

function App() {
    return (
        <LayoutProvider>
            <ThemeProvider>
                <ErrorBoundary>
                    <AuthProvider>
                        <TimerProvider>
                            <GameProvider>
                                <ModalProvider>
                                    <NotificationProvider>
                                        <GameScreen />
                                    </NotificationProvider>
                                </ModalProvider>
                            </GameProvider>
                        </TimerProvider>
                    </AuthProvider>
                </ErrorBoundary>
            </ThemeProvider>
        </LayoutProvider>
    );
}

export default App;

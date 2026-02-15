/**
 * src/contexts/TimeoutContext.tsx
 *
 * Context para encapsular estado de timeout e permitir consumo
 * por outros hooks (ex: useSyncManager) sem dependência direta.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useTimeoutManager, TimeoutManagerReturn } from '@features/game/hooks/useTimeoutManager';

// Context type = retorno completo do useTimeoutManager
type TimeoutContextType = TimeoutManagerReturn;

const TimeoutContext = createContext<TimeoutContextType | undefined>(undefined);

interface TimeoutProviderProps {
    children: ReactNode;
}

/**
 * TimeoutProvider - Encapsula useTimeoutManager (agora autossuficiente)
 * e expõe seu estado via context para outros hooks consumirem.
 */
export const TimeoutProvider: React.FC<TimeoutProviderProps> = ({ children }) => {
    // useTimeoutManager agora consome contexts internamente (ver seção 5.1)
    const timeoutManager = useTimeoutManager();

    return (
        <TimeoutContext.Provider value={timeoutManager}>
            {children}
        </TimeoutContext.Provider>
    );
};

/**
 * Hook para consumir estado de timeout em qualquer componente/hook.
 *
 * @returns {TimeoutContextType} - Objeto com todo o estado e controles de timeout
 * @throws {Error} - Se usado fora do TimeoutProvider
 */
export function useTimeoutContext(): TimeoutContextType {
    const context = useContext(TimeoutContext);
    if (context === undefined) {
        throw new Error('useTimeoutContext must be used within a TimeoutProvider');
    }
    return context;
}

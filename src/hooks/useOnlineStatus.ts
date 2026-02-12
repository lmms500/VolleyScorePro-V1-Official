/**
 * src/hooks/useOnlineStatus.ts
 *
 * Hook para detectar status de conectividade online/offline.
 * Side-effect puro sem retorno complexo.
 */

import { useState, useEffect } from 'react';

export interface OnlineStatus {
    isOnline: boolean;
}

/**
 * Detecta o status de conectividade via Navigator API.
 * Atualiza estado quando os eventos 'online' e 'offline' disparam.
 *
 * @returns {OnlineStatus} - Objeto contendo apenas `isOnline`
 */
export function useOnlineStatus(): OnlineStatus {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return { isOnline };
}

import React from 'react';
import { GameState } from '@types';
import { BroadcastOverlay } from '@features/broadcast/components/BroadcastOverlay';
import { ObsScoreDisplay } from '@features/broadcast/components/ObsScoreDisplay';

interface BroadcastScreenProps {
    state: GameState;
}

/**
 * BroadcastScreen - Tela dedicada para modo transmissão (OBS/Spectator)
 *
 * Detecta automaticamente o layout via query param `obsLayout`:
 * - ?obsLayout=horizontal → ObsScoreDisplay horizontal
 * - ?obsLayout=vertical → ObsScoreDisplay vertical
 * - Sem param → BroadcastOverlay padrão
 */
export const BroadcastScreen: React.FC<BroadcastScreenProps> = ({ state }) => {
    // Parse obsLayout from URL
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const obsLayout = params.get('obsLayout') as 'horizontal' | 'vertical' | null;

    if (obsLayout) {
        // OBS-optimized display (spectator-only, high performance)
        return (
            <div className="w-full h-screen bg-slate-950 overflow-hidden">
                <ObsScoreDisplay state={state} layout={obsLayout} />
            </div>
        );
    }

    // Standard broadcast overlay
    return (
        <div className="w-full h-screen bg-transparent overflow-hidden">
            <BroadcastOverlay state={state} />
        </div>
    );
};

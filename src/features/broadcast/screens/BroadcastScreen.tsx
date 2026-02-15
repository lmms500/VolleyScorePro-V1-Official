import React from 'react';
import { GameState } from '@types';
import { BroadcastBar } from '@features/broadcast/components/BroadcastBar';


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


    // Standard broadcast overlay
    return (
        <div className="w-full h-screen bg-transparent overflow-hidden">
            <BroadcastBar state={state} />
        </div>
    );
};

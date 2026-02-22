import { useEffect, useRef } from 'react';
import { useTimerValue, useTimerControls } from '@contexts/TimerContext';
import { useRoster } from '@contexts/GameContext';
import { useActions } from '@contexts/GameContext';

export function useTimerToReducerSync() {
  const timerValue = useTimerValue();
  const timerControls = useTimerControls();
  const { syncRole } = useRoster();
  const { setState } = useActions();
  const lastSyncRef = useRef(0);

  useEffect(() => {
    if (syncRole !== 'host') return;

    const now = Date.now();
    if (now - lastSyncRef.current < 1000) return;
    lastSyncRef.current = now;

    setState({
      type: 'SET_MATCH_DURATION',
      duration: timerValue.seconds
    });
  }, [timerValue.seconds, syncRole, setState]);

  useEffect(() => {
    if (syncRole !== 'spectator') return;
  }, [syncRole]);
}

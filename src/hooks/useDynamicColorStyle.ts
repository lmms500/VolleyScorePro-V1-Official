import { useMemo } from 'react';
import { TeamColor } from '../types';
import { getHexFromColor, HEX_MAP } from '../utils/colors';

/**
 * Hook para converter cores dinâmicas em CSS variables.
 * Retorna classes Tailwind + style object com CSS variables para cores que não estão no safelist.
 * 
 * Permite que cores customizadas funcionem mesmo quando geradas em runtime.
 */
export function useDynamicColorStyle(color: TeamColor | undefined) {
  return useMemo(() => {
    if (!color) {
      return {
        className: '',
        style: {} as React.CSSProperties,
      };
    }

    // Se é uma cor preset (indigo, rose, etc), usa as classes Tailwind
    if (HEX_MAP[color]) {
      return {
        className: '', // Classes já estão no safelist
        style: {} as React.CSSProperties,
      };
    }

    // Se é custom ou hex, usa CSS variables
    const hex = getHexFromColor(color);
    const [r, g, b] = hexToRgb(hex);

    return {
      className: '',
      style: {
        '--dynamic-color': hex,
        '--dynamic-color-rgb': `${r}, ${g}, ${b}`,
      } as any,
    };
  }, [color]);
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [99, 102, 241]; // indigo-500 fallback
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

import { TeamColor } from '@types';
import { HEX_MAP, getHexFromColor } from './colors';

/**
 * Versão de resolveTheme que usa CSS variables para cores dinâmicas
 * Isso permite que cores customizadas funcionem sem depender de classes Tailwind geradas em runtime.
 */
export const resolveThemeDynamic = (color: TeamColor | undefined) => {
  if (!color) {
    return {
      // Use default indigo classes
      text: 'text-indigo-800',
      textDark: 'dark:text-indigo-300',
      bg: 'bg-indigo-500/20',
      bgDark: 'dark:bg-indigo-500/20',
      border: 'border-indigo-500/40',
      halo: 'bg-indigo-500',
      crown: 'text-indigo-500',
      ring: 'ring-indigo-500',
      gradient: 'from-indigo-500/15 to-transparent',
      solid: 'bg-indigo-500',
      // CSS variables
      useVariables: false,
      cssVar: '',
    };
  }

  // Se é cor predefinida, usa classes Tailwind diretamente
  if (HEX_MAP[color]) {
    const colorName = color;
    const intensity = colorName === 'indigo' ? 500 : colorName === 'rose' ? 500 : 500;
    return {
      text: `text-${colorName}-800`,
      textDark: `dark:text-${colorName}-300`,
      bg: `bg-${colorName}-${intensity}/20`,
      bgDark: `dark:bg-${colorName}-${intensity}/20`,
      border: `border-${colorName}-${intensity}/40`,
      halo: `bg-${colorName}-${intensity}`,
      crown: `text-${colorName}-${intensity}`,
      ring: `ring-${colorName}-${intensity}`,
      gradient: `from-${colorName}-${intensity}/15 to-transparent`,
      solid: `bg-${colorName}-${intensity}`,
      useVariables: false,
      cssVar: '',
    };
  }

  // Para cores customizadas, usa CSS variables
  const hex = getHexFromColor(color);
  const [r, g, b] = hexToRgb(hex);

  return {
    // Classes de fallback
    text: 'text-slate-900 dark:text-slate-100',
    textDark: 'dark:text-slate-100',
    bg: 'bg-slate-100/20',
    bgDark: 'dark:bg-slate-500/20',
    border: 'border-slate-500/40',
    halo: 'bg-slate-500',
    crown: 'text-slate-500',
    ring: 'ring-slate-500',
    gradient: 'from-slate-500/15 to-transparent',
    solid: 'bg-slate-500',
    // Sinalizadores para uso de CSS variables
    useVariables: true,
    cssVar: `
      --dynamic-color: ${hex};
      --dynamic-color-rgb: ${r}, ${g}, ${b};
      --dynamic-color-opacity-20: rgba(${r}, ${g}, ${b}, 0.2);
      --dynamic-color-opacity-40: rgba(${r}, ${g}, ${b}, 0.4);
      --dynamic-color-opacity-15: rgba(${r}, ${g}, ${b}, 0.15);
    `,
  };
};

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [99, 102, 241];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

/**
 * Retorna inline styles para aplicar cores dinâmicas ao elemento
 */
export const getDynamicColorStyle = (color: TeamColor | undefined): React.CSSProperties => {
  if (!color || HEX_MAP[color]) return {};

  const hex = getHexFromColor(color);
  const [r, g, b] = hexToRgb(hex);

  return {
    '--dynamic-color': hex,
    '--dynamic-color-rgb': `${r}, ${g}, ${b}`,
  } as any;
};

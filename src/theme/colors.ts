/**
 * VolleyScore Pro v2 - Design System Colors
 * Neo-Glass Premium Palette
 */

export const colors = {
  // === BACKGROUNDS (Neo-Glass) ===
  background: {
    primary: '#020617',    // slate-950 (OLED-friendly, nunca #000)
    secondary: '#0f172a',  // slate-900 (cards, modals)
    tertiary: '#1e293b',   // slate-800 (elevações secundárias)
  },

  // === ACCENT COLORS (Team Colors) ===
  accent: {
    teamA: {
      default: '#6366f1',   // indigo-500
      light: '#818cf8',     // indigo-400
      dark: '#4f46e5',      // indigo-600
    },
    teamB: {
      default: '#f43f5e',   // rose-500
      light: '#fb7185',     // rose-400
      dark: '#e11d48',      // rose-600
    },
  },

  // === TEXT ===
  text: {
    primary: '#f8fafc',     // slate-50 (high contrast)
    secondary: '#cbd5e1',   // slate-300 (labels)
    tertiary: '#94a3b8',    // slate-400 (subtle hints)
    disabled: '#64748b',    // slate-500
  },

  // === BORDERS ===
  border: {
    subtle: 'rgba(255, 255, 255, 0.05)',   // Glassmorphism
    medium: 'rgba(255, 255, 255, 0.10)',
    strong: 'rgba(255, 255, 255, 0.20)',
  },

  // === STATES (Semantic) ===
  states: {
    success: '#10b981',     // emerald-500 (vitórias, confirmações)
    warning: '#f59e0b',     // amber-500 (avisos, MVP)
    error: '#ef4444',       // red-500 (erros, deletar)
    info: '#3b82f6',        // blue-500 (notificações neutras)
  },

  // === GRADIENTS (Backgrounds dinâmicos) ===
  gradients: {
    teamA: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    teamB: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    neutral: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
  },

  // === SHADOWS (Elevações) ===
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(99, 102, 241, 0.3)', // Indigo glow
  },
} as const;

export type ColorTheme = keyof typeof colors;

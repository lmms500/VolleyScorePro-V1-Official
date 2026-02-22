/** @type {import('tailwindcss').Config} */

// Split color groups to keep regex complexity under SonarQube S5843 threshold (max 20)
const WARM = 'red|rose|pink|fuchsia|orange|amber|yellow|lime';
const COOL = 'purple|violet|indigo|blue|sky|cyan|teal|emerald|green';

/** Build a safelist pattern for both warm and cool color groups */
function colorPatterns(prefix, shades, opts = {}) {
  const { variants, suffix = '' } = opts;
  const build = (colors) => new RegExp(String.raw`^${prefix}-(${colors})-(${shades})${suffix}$`);
  const entry = (pattern) => variants ? { pattern, variants } : { pattern };
  return [entry(build(WARM)), entry(build(COOL))];
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      spacing: {
        // Unidades Responsivas (r-*)
        'r-0.5': 'var(--space-0.5)',
        'r-1': 'var(--space-1)',
        'r-1.5': 'var(--space-1.5)',
        'r-2': 'var(--space-2)',
        'r-2.5': 'var(--space-2.5)',
        'r-3': 'var(--space-3)',
        'r-4': 'var(--space-4)',
        'r-5': 'var(--space-5)',
        'r-6': 'var(--space-6)',
        'r-8': 'var(--space-8)',
        'r-10': 'var(--space-10)',
        'r-12': 'var(--space-12)',
        'r-16': 'var(--space-16)',
        'r-20': 'var(--space-20)',
        'r-24': 'var(--space-24)',
      },
      fontSize: {
        'r-xs': 'var(--text-xs)',
        'r-sm': 'var(--text-sm)',
        'r-base': 'var(--text-base)',
        'r-lg': 'var(--text-lg)',
        'r-xl': 'var(--text-xl)',
        'r-2xl': 'var(--text-2xl)',
        'r-3xl': 'var(--text-3xl)',
        'r-4xl': 'var(--text-4xl)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  safelist: [
    // Grid layout classes for court configurations
    'grid-rows-1',
    'grid-rows-2',
    'grid-rows-3',
    'grid-cols-2',
    'grid-cols-3',

    // Color text variants (with dark variant)
    ...colorPatterns('text', '200|300|400|500|600|700|800', { variants: ['dark'] }),

    // Color background variants with opacity (with dark variant)
    ...colorPatterns('bg', '100|200|400|500|600', { variants: ['dark'], suffix: String.raw`\/\d+` }),

    // Color background variants solid (with dark variant)
    ...colorPatterns('bg', '300|400|500|600', { variants: ['dark'] }),

    // Color border variants with opacity (with dark variant)
    ...colorPatterns('border', '100|200|400|500|600', { variants: ['dark'], suffix: String.raw`\/\d+` }),

    // Color ring variants
    ...colorPatterns('ring', '200|300|400|500|600|700|800'),

    // Gradient variants
    ...colorPatterns('from', '100|200|300|400|500|600', { suffix: String.raw`(\/\d+)?` }),
    ...colorPatterns('to', '100|200|300|400|500|600', { suffix: String.raw`(\/\d+)?` }),
    { pattern: /^to-gray-900\/\d+$/ },
    { pattern: /^to-slate-900\/\d+$/ },
    { pattern: /^to-black\/\d+$/ },
  ],
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
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

    // All color text variants
    { pattern: /^text-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(200|300|400|500|600|700|800)$/ },
    { pattern: /^dark:text-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(200|300|400|500|600|700|800)$/ },

    // All color background variants with opacity
    { pattern: /^bg-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(100|200|400|500|600)\/\d+$/ },
    { pattern: /^dark:bg-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(100|200|400|500|600)\/\d+$/ },

    // All color background variants (solid)
    { pattern: /^bg-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(300|400|500|600)$/ },
    { pattern: /^dark:bg-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(300|400|500|600)$/ },

    // All color border variants with opacity
    { pattern: /^border-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(100|200|400|500|600)\/\d+$/ },
    { pattern: /^dark:border-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(100|200|400|500|600)\/\d+$/ },

    // All color ring variants
    { pattern: /^ring-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(200|300|400|500|600|700|800)$/ },

    // All gradient variants
    { pattern: /^from-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(100|200|300|400|500|600)(\/\d+)?$/ },
    { pattern: /^to-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(100|200|300|400|500|600)(\/\d+)?$/ },
    { pattern: /^to-gray-900\/\d+$/ },
    { pattern: /^to-slate-900\/\d+$/ },
    { pattern: /^to-black\/\d+$/ },

    // Arbitrary values (for custom hex colors)
    { pattern: /^text-\[#[0-9a-fA-F]{6}\]$/ },
    { pattern: /^dark:text-\[#[0-9a-fA-F]{6}\]$/ },
    { pattern: /^bg-\[#[0-9a-fA-F]{6}\]$/ },
    { pattern: /^dark:bg-\[#[0-9a-fA-F]{6}\]$/ },
    { pattern: /^border-\[#[0-9a-fA-F]{6}\]$/ },
    { pattern: /^ring-\[#[0-9a-fA-F]{6}\]$/ },
    { pattern: /^from-\[#[0-9a-fA-F]{6}\]$/ },
    { pattern: /^to-\[#[0-9a-fA-F]{6}\]$/ },

    // Opacity variants for arbitrary values
    { pattern: /^bg-\[#[0-9a-fA-F]{6}\]\/\d+$/ },
    { pattern: /^dark:bg-\[#[0-9a-fA-F]{6}\]\/\d+$/ },
    { pattern: /^border-\[#[0-9a-fA-F]{6}\]\/\d+$/ },
  ],
  plugins: [],
}


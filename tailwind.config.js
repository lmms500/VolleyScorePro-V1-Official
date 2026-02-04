/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  safelist: [
    // All color text variants
    { pattern: /^text-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(200|300|400|500|600|700|800)$/ },
    { pattern: /^dark:text-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(200|300|400|500|600|700|800)$/ },
    
    // All color background variants with opacity
    { pattern: /^bg-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(100|200|400|500|600)\/\d+$/ },
    { pattern: /^dark:bg-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(100|200|400|500|600)\/\d+$/ },
    
    // All color border variants with opacity
    { pattern: /^border-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(100|200|400|500|600)\/\d+$/ },
    { pattern: /^dark:border-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(100|200|400|500|600)\/\d+$/ },
    
    // All color ring variants
    { pattern: /^ring-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(200|300|400|500|600|700|800)$/ },
    
    // All gradient variants
    { pattern: /^from-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(100|200|400|500|600)\/\d+$/ },
    { pattern: /^to-(red|rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange)-(100|200|400|500|600)\/\d+$/ },
    
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


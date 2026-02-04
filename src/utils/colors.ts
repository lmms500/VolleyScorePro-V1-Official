
import { TeamColor } from '../types';

interface ColorTheme {
    text: string;           // Base text color
    textDark: string;       // Dark mode text color
    bg: string;             // Light background (pills, badges)
    bgDark: string;         // Dark mode background
    border: string;         // Border color
    halo: string;           // The blurred circle behind numbers
    glow: string;           // Text/Box shadow glow
    crown: string;          // Icon color (Winner crown)
    ring: string;           // Focus rings
    gradient: string;       // Subtle gradient for cards
    solid: string;          // Solid color for pickers/dots
}

// Helper to generate theme objects consistent with Tailwind classes
const createTheme = (color: string, baseIntensity: number = 500, textIntensity: number = 800, darkTextIntensity: number = 300): ColorTheme => ({
    text: `text-${color}-${textIntensity}`,
    textDark: `dark:text-${color}-${darkTextIntensity}`,
    bg: `bg-${color}-${baseIntensity}/20`,
    bgDark: `dark:bg-${color}-${baseIntensity}/20`,
    border: `border-${color}-${baseIntensity}/40`,
    halo: `bg-${color}-${baseIntensity}`,
    glow: `drop-shadow-[0_0_15px_rgba(var(--tw-color-${color}-${baseIntensity}),0.6)]`,
    crown: `text-${color}-${baseIntensity}`,
    ring: `ring-${color}-${baseIntensity}`,
    gradient: `from-${color}-${baseIntensity}/15 to-transparent`,
    solid: `bg-${color}-${baseIntensity}`
});

export const TEAM_COLORS: Record<string, ColorTheme> = {
    // REDS & PINKS
    red: createTheme('red', 600, 800, 200),
    rose: createTheme('rose', 500, 800, 300),
    pink: createTheme('pink', 500, 800, 300),
    fuchsia: createTheme('fuchsia', 500, 800, 300),
    
    // PURPLES & VIOLETS
    purple: createTheme('purple', 600, 800, 300),
    violet: createTheme('violet', 500, 800, 300),
    indigo: createTheme('indigo', 500, 800, 300),
    
    // BLUES
    blue: createTheme('blue', 600, 800, 300),
    sky: createTheme('sky', 500, 800, 300),
    cyan: createTheme('cyan', 500, 800, 300),
    
    // TEALS & GREENS
    teal: createTheme('teal', 500, 800, 300),
    emerald: createTheme('emerald', 500, 800, 300),
    green: createTheme('green', 600, 800, 300),
    lime: createTheme('lime', 500, 800, 300),
    
    // YELLOWS & ORANGES
    yellow: createTheme('yellow', 400, 800, 200), 
    amber: createTheme('amber', 500, 800, 300),
    orange: createTheme('orange', 500, 800, 300),
};

const HEX_MAP: Record<string, string> = {
    red: '#dc2626',
    rose: '#f43f5e',
    pink: '#ec4899',
    fuchsia: '#d946ef',
    purple: '#9333ea',
    violet: '#8b5cf6',
    indigo: '#6366f1',
    blue: '#2563eb',
    sky: '#0ea5e9',
    cyan: '#06b6d4',
    teal: '#14b8a6',
    emerald: '#10b981',
    green: '#16a34a',
    lime: '#84cc16',
    yellow: '#facc15',
    amber: '#f59e0b',
    orange: '#f97316',
};

export { HEX_MAP };

export const COLOR_KEYS = Object.keys(TEAM_COLORS);

/**
 * Resolves a color string (preset key or hex code) into a full theme object.
 * Supports "custom:HEX1:HEX2" for dynamic gradients.
 */
export const resolveTheme = (color: TeamColor | undefined): ColorTheme => {
    if (!color) return TEAM_COLORS['indigo'];
    
    // 1. Check if it is a preset
    if (TEAM_COLORS[color]) {
        return TEAM_COLORS[color];
    }

    // 2. Check for Custom Gradient Format "custom:primaryHex:secondaryHex"
    if (color.startsWith('custom:')) {
        const parts = color.split(':');
        const primary = parts[1] || '#6366f1';
        const secondary = parts[2] || primary; // Fallback to solid if only 1 provided

        return {
            text: `text-[${primary}]`,
            textDark: `dark:text-[${primary}]`,
            bg: `bg-[${primary}]/20`,
            bgDark: `dark:bg-[${primary}]/20`,
            border: `border-[${primary}]/40`,
            halo: `bg-[${primary}]`,
            glow: `shadow-[0_0_15px_${primary}80]`,
            crown: `text-[${secondary}]`,
            ring: `ring-[${primary}]`,
            // The magic happens here: Custom gradient
            gradient: `from-[${primary}]/20 to-[${secondary}]/20`, 
            solid: `bg-[${primary}]`
        };
    }

    // 3. Assume it is a Hex Code (Legacy fallback)
    const safeColor = color.trim();
    return {
        text: `text-[${safeColor}]`,
        textDark: `dark:text-[${safeColor}]`,
        bg: `bg-[${safeColor}]/20`,
        bgDark: `dark:bg-[${safeColor}]/20`,
        border: `border-[${safeColor}]/40`,
        halo: `bg-[${safeColor}]`,
        glow: `shadow-[0_0_15px_${safeColor}80]`,
        crown: `text-[${safeColor}]`,
        ring: `ring-[${safeColor}]`,
        gradient: `from-[${safeColor}]/15 to-transparent`,
        solid: `bg-[${safeColor}]`
    };
};

/**
 * Returns a valid HEX code for Canvas/SVG usage.
 */
export const getHexFromColor = (color: TeamColor | undefined): string => {
    if (!color) return HEX_MAP['indigo'];
    if (HEX_MAP[color]) return HEX_MAP[color];
    
    if (color.startsWith('custom:')) {
        const parts = color.split(':');
        return parts[1] || '#6366f1';
    }

    if (color.startsWith('#')) return color;
    return HEX_MAP['indigo'];
};

/**
 * Smart Color Matching Algorithm
 * Finds the nearest predefined TeamColor for a given Hex.
 */
export const findNearestTeamColor = (targetHex: string): TeamColor => {
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const target = hexToRgb(targetHex);
    if (!target) return 'indigo';

    let minDistance = Infinity;
    let nearestColor: TeamColor = 'indigo';

    for (const [key, mapHex] of Object.entries(HEX_MAP)) {
        const current = hexToRgb(mapHex);
        if (!current) continue;

        // Euclidean distance in RGB space
        const distance = Math.sqrt(
            Math.pow(target.r - current.r, 2) +
            Math.pow(target.g - current.g, 2) +
            Math.pow(target.b - current.b, 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearestColor = key;
        }
    }

    return nearestColor;
};

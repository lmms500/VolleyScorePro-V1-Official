// Basic verification script to test the logic of color resolution in HaloBackground
// Since we cannot run the full React component in this environment easily, we will simulate the logic.

const hexColorMap = {
    indigo: '#6366f1',
    violet: '#8b5cf6',
    purple: '#a855f7',
    rose: '#f43f5e',
    pink: '#ec4899',
    red: '#ef4444',
    orange: '#f97316',
    amber: '#f59e0b',
    yellow: '#eab308',
    lime: '#84cc16',
    green: '#22c55e',
    emerald: '#10b981',
    teal: '#14b8a6',
    cyan: '#06b6d4',
    sky: '#0ea5e9',
    blue: '#3b82f6',
    slate: '#64748b',
};

function resolveGlowHex(mode, colorTheme) {
    if (mode === 'critical') return hexColorMap['amber'];

    // 1. Check mapped themes
    if (hexColorMap[colorTheme]) return hexColorMap[colorTheme];

    // 2. Check for "custom:HEX" format
    if (colorTheme && colorTheme.startsWith('custom:')) {
        const parts = colorTheme.split(':');
        return parts[1] || hexColorMap['indigo'];
    }

    // 3. Check for valid CSS color
    if (colorTheme && (colorTheme.startsWith('#') || colorTheme.includes('rgb') || colorTheme.includes('hsl'))) {
        return colorTheme;
    }

    // 4. Default fallback
    return hexColorMap['indigo'];
}

function assert(actual, expected, message) {
    if (actual !== expected) {
        console.error(`FAIL: ${message} - Expected ${expected}, got ${actual}`);
    } else {
        console.log(`PASS: ${message}`);
    }
}

// Test Cases
assert(resolveGlowHex('idle', 'indigo'), '#6366f1', 'Standard theme "indigo"');
assert(resolveGlowHex('idle', 'emerald'), '#10b981', 'Standard theme "emerald"');
assert(resolveGlowHex('idle', '#FF0000'), '#FF0000', 'Direct HEX color "#FF0000"');
assert(resolveGlowHex('idle', 'rgb(255, 0, 0)'), 'rgb(255, 0, 0)', 'RGB color');
assert(resolveGlowHex('idle', 'custom:#123456:#654321'), '#123456', 'Custom format "custom:..."');
assert(resolveGlowHex('critical', '#000000'), '#f59e0b', 'Critical mode override (amber)');
assert(resolveGlowHex('idle', 'invalid-color'), '#6366f1', 'Invalid color fallback to indigo');

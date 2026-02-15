/**
 * deviceDetection.ts - Device Performance Detection
 *
 * Detects device capabilities and recommends a performance mode.
 * Uses hardware heuristics + optional GPU micro-benchmark.
 */

export type PerformanceMode = 'NORMAL' | 'ECONOMICO' | 'REDUZIR_MOVIMENTO';

const STORAGE_KEY = 'volleyscore-perf-mode';

/**
 * Detect the optimal performance mode for the current device.
 * Priority: 1) User preference (localStorage), 2) prefers-reduced-motion, 3) hardware heuristics
 */
export function detectPerformanceMode(): PerformanceMode {
    // 1. Check for stored user preference
    try {
        const stored = localStorage.getItem(STORAGE_KEY) as PerformanceMode | null;
        if (stored && ['NORMAL', 'ECONOMICO', 'REDUZIR_MOVIMENTO'].includes(stored)) {
            return stored;
        }
    } catch { /* localStorage not available */ }

    // 2. Respect system accessibility preference (highest priority for auto-detection)
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        return 'REDUZIR_MOVIMENTO';
    }

    // 3. Hardware heuristics
    const cores = navigator.hardwareConcurrency || 2;
    const memory = (navigator as any).deviceMemory || 2; // Chrome-only, defaults to 2
    const isLowEnd = cores <= 4 && memory <= 2;
    const isMidRange = cores <= 4 || memory <= 4;

    // 4. Quick GPU benchmark (synchronous, ~5-15ms)
    const gpuScore = quickGPUBenchmark();

    if (isLowEnd || gpuScore < 30) return 'REDUZIR_MOVIMENTO';
    if (isMidRange || gpuScore < 50) return 'ECONOMICO';
    return 'NORMAL';
}

/**
 * Persist user's manual performance mode selection.
 */
export function persistPerformanceMode(mode: PerformanceMode): void {
    try {
        localStorage.setItem(STORAGE_KEY, mode);
    } catch { /* localStorage not available */ }
}

/**
 * Clear persisted preference (returns to auto-detection).
 */
export function clearPerformancePreference(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
}

/**
 * Quick GPU micro-benchmark using Canvas 2D.
 * Renders 50 blurred rects and measures time.
 * Returns a score: 100 = high-end, 50 = mid-range, 20 = low-end.
 */
function quickGPUBenchmark(): number {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (!ctx) return 30; // No canvas = assume low

        const start = performance.now();
        for (let i = 0; i < 50; i++) {
            ctx.filter = 'blur(4px)';
            ctx.fillStyle = `hsl(${i * 7}, 80%, 50%)`;
            ctx.fillRect(Math.random() * 200, Math.random() * 200, 40, 40);
        }
        const elapsed = performance.now() - start;

        // Cleanup
        canvas.width = 0;
        canvas.height = 0;

        // Score thresholds (calibrated for mobile devices)
        if (elapsed < 5) return 100;  // High-end (<5ms)
        if (elapsed < 15) return 50;  // Mid-range (5-15ms)
        return 20;                     // Low-end (>15ms)
    } catch {
        return 30; // Error = assume low-mid
    }
}

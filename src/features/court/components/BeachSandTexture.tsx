import React, { memo } from 'react';

interface BeachSandTextureProps {
    className?: string;
}

const BeachSandTexture: React.FC<BeachSandTextureProps> = memo(({ className = '' }) => {
    return (
        <div className={`absolute inset-0 overflow-hidden bg-[#dcb98a] ${className}`}>
            {/* Base sand color gradient with subtle warmth */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#e6cdab] via-[#d7b280] to-[#c0965c]" />

            {/* Soft Dunes / Raked Sand Effect (Low Frequency Directional Noise) */}
            <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-multiply" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <filter id="sand-dunes">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.015 0.06"
                        numOctaves="3"
                        result="duneNoise"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="1 0 0 0 0  0 0.9 0 0 0  0 0.8 0 0 0  0 0 0 0.4 0"
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#sand-dunes)" />
            </svg>

            {/* Fine grains of sand */}
            <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <filter id="sand-grained">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.9"
                        numOctaves="4"
                        stitchTiles="stitch"
                        result="noise"
                    />
                    {/* Grayscale conversion for crisp overlay grains */}
                    <feColorMatrix
                        type="matrix"
                        values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0.8 0"
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#sand-grained)" />
            </svg>

            {/* Micro-sparkles (scattered bright grains reflecting sun) */}
            <svg className="absolute inset-0 w-full h-full opacity-25 mix-blend-color-dodge" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <filter id="sand-sparkles">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="1.5"
                        numOctaves="2"
                        result="sparkles"
                    />
                    {/* High contrast threshold to only show peaks as sparkles */}
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 1   0 0 0 0 0.95   0 0 0 0 0.8   0 0 0 15 -10"
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#sand-sparkles)" />
            </svg>

            {/* Lighting: Sunlight hitting the center */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.2)_0%,transparent_65%)] pointer-events-none" />

            {/* Vignette: Darker edges to give depth to the court */}
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(139,115,85,0.4)] pointer-events-none" />

            {/* Subtle App Design Overlay - A very faint modern glossy touch */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 mix-blend-overlay pointer-events-none" />
        </div>
    );
});

BeachSandTexture.displayName = 'BeachSandTexture';

export default BeachSandTexture;

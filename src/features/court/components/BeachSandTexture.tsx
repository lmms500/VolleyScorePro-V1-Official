import React, { memo } from 'react';

interface BeachSandTextureProps {
    className?: string;
}

const BeachSandTexture: React.FC<BeachSandTextureProps> = memo(({ className = '' }) => {
    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#d4b07a] via-[#c9a66b] to-[#b8956a]" />
            
            <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <filter id="sand-noise-fine">
                    <feTurbulence 
                        type="fractalNoise" 
                        baseFrequency="0.9" 
                        numOctaves="4" 
                        stitchTiles="stitch"
                        result="noise"
                    />
                    <feColorMatrix 
                        type="matrix"
                        values="0 0 0 0 0.66  0 0 0 0 0.53  0 0 0 0 0.33  0 0 0 0.4 0"
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#sand-noise-fine)" />
            </svg>
            
            <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <filter id="sand-noise-medium">
                    <feTurbulence 
                        type="fractalNoise" 
                        baseFrequency="0.4" 
                        numOctaves="3" 
                        stitchTiles="stitch"
                        result="noise"
                    />
                    <feColorMatrix 
                        type="matrix"
                        values="0 0 0 0 0.72  0 0 0 0 0.56  0 0 0 0 0.35  0 0 0 0.35 0"
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#sand-noise-medium)" />
            </svg>
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#a88455]/20 via-transparent to-[#d4b07a]/10" />
            
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#8b7355]/15" />
            
            <svg className="absolute inset-0 w-full h-full opacity-15 mix-blend-overlay" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <filter id="sand-texture-coarse">
                    <feTurbulence 
                        type="turbulence" 
                        baseFrequency="0.15" 
                        numOctaves="2" 
                        seed="5"
                        result="noise"
                    />
                    <feColorMatrix 
                        type="matrix"
                        values="0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 0 0.25  0 0 0 0.3 0"
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#sand-texture-coarse)" />
            </svg>
        </div>
    );
});

BeachSandTexture.displayName = 'BeachSandTexture';

export default BeachSandTexture;

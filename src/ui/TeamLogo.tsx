
import React, { useState, useEffect } from 'react';
import { imageService } from '@lib/image/ImageService';
import { ImageIcon } from 'lucide-react';

interface TeamLogoProps {
    src?: string;
    alt: string;
    className?: string;
    fallbackIconSize?: number;
    fallbackClassName?: string;
}

export const TeamLogo: React.FC<TeamLogoProps> = React.memo(({ 
    src, 
    alt, 
    className, 
    fallbackIconSize = 20, 
    fallbackClassName = "text-slate-300 dark:text-slate-600" 
}) => {
    const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let active = true;
        
        if (!src) {
            setResolvedSrc(null);
            return;
        }

        const resolve = async () => {
            const url = await imageService.resolveImage(src);
            if (active) {
                setResolvedSrc(url);
                setError(false);
            }
        };

        resolve();

        return () => {
            active = false;
        };
    }, [src]);

    if (!resolvedSrc || error) {
        return (
            <div className={`flex items-center justify-center bg-slate-100 dark:bg-white/5 overflow-hidden ${className}`}>
                <ImageIcon size={fallbackIconSize} className={fallbackClassName} strokeWidth={1.5} />
            </div>
        );
    }

    return (
        <img 
            src={resolvedSrc} 
            alt={alt} 
            className={className} 
            onError={() => setError(true)} 
        />
    );
});

import { Capacitor } from '@capacitor/core';

// Design Base (iPhone 11 Pro logic)
const BASE_WIDTH = 375;
// const BASE_HEIGHT = 812; // Não usado diretamente no scale factor padrão

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export const detectDeviceType = (): DeviceType => {
    const width = window.innerWidth;
    if (width >= 1024) return 'desktop';
    if (width >= 768) return 'tablet';
    return 'mobile';
};

/**
 * Calcula o fator de escala baseado na largura da tela (ou altura em landscape)
 */
export const getScaleFactor = (): number => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = width > height;

    // Em landscape mobile, usamos a altura como referência de "largura lógica" 
    // para manter o tamanho visual dos elementos similar ao portrait
    const dimensionParams = isLandscape && width < 1024 ? height : width;

    // Scale puro
    const scale = dimensionParams / BASE_WIDTH;

    // Cap para Tablets/Desktop (evita UI gigante)
    // Máximo 1.2x do tamanho original de design
    return Math.min(scale, 1.2);
};

/**
 * Normaliza um tamanho em pixels para a escala do dispositivo atual
 * @param size Tamanho em pixels no design draft (375px width)
 * @param limitScale Se true, força o cap de 1.2 mesmo em mobile (opcional)
 */
export const normalize = (size: number, limitScale = true): number => {
    const scale = getScaleFactor();
    const newSize = size * scale;

    // Math.round é crucial para evitar bordas borradas (sub-pixel rendering)
    if (Capacitor.getPlatform() === 'ios') {
        return Math.round(newSize);
    } else {
        return Math.round(newSize);
    }
};

/** Width Percentage: % da largura da tela */
export const wp = (percentage: number): number => {
    return Math.round((window.innerWidth * percentage) / 100);
};

/** Height Percentage: % da altura da tela */
export const hp = (percentage: number): number => {
    return Math.round((window.innerHeight * percentage) / 100);
};

/**
 * Spacing Utility
 * Retorna valor escalado baseado em múltiplos de 4px
 * spacing(1) = 4px (escalado)
 * spacing(4) = 16px (escalado)
 */
export const spacing = (multiplier: number): number => {
    return normalize(multiplier * 4);
};

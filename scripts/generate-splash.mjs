import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const splashConfigs = [
  { name: 'ldpi', width: 240, height: 320, folder: 'drawable-port-ldpi' },
  { name: 'mdpi', width: 320, height: 480, folder: 'drawable-port-mdpi' },
  { name: 'hdpi', width: 480, height: 800, folder: 'drawable-port-hdpi' },
  { name: 'xhdpi', width: 720, height: 1280, folder: 'drawable-port-xhdpi' },
  { name: 'xxhdpi', width: 1080, height: 1920, folder: 'drawable-port-xxhdpi' },
  { name: 'xxxhdpi', width: 1440, height: 2560, folder: 'drawable-port-xxxhdpi' },
];

function createSplashSVG(width, height, isDark = true) {
  const bgColor = isDark ? '#020617' : '#f8fafc';
  const textColor = isDark ? '#f1f5f9' : '#1e293b';
  const subTextColor = isDark ? '#64748b' : '#94a3b8';
  const gradientStart = isDark ? '#818cf8' : '#6366f1';
  const gradientMid = isDark ? '#a855f7' : '#8b5cf6';
  const orb1 = isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)';
  const orb2 = isDark ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.06)';
  
  const logoSize = Math.min(width, height) * 0.25;
  const logoX = width / 2;
  const logoY = height / 2 - height * 0.05;
  const textY = logoY + logoSize / 2 + height * 0.08;
  const subTextY = textY + height * 0.04;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradientStart}"/>
      <stop offset="50%" stop-color="${gradientMid}"/>
      <stop offset="100%" stop-color="${gradientStart}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <radialGradient id="orb1Grad" cx="30%" cy="30%">
      <stop offset="0%" stop-color="${orb1}"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="orb2Grad" cx="70%" cy="70%">
      <stop offset="0%" stop-color="${orb2}"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  
  <rect width="100%" height="100%" fill="${bgColor}"/>
  
  <ellipse cx="${width * 0.25}" cy="${height * 0.3}" rx="${width * 0.4}" ry="${height * 0.3}" fill="url(#orb1Grad)"/>
  <ellipse cx="${width * 0.75}" cy="${height * 0.7}" rx="${width * 0.35}" ry="${height * 0.25}" fill="url(#orb2Grad)"/>
  
  <g transform="translate(${logoX - logoSize/2}, ${logoY - logoSize/2})">
    <circle cx="${logoSize/2}" cy="${logoSize/2}" r="${logoSize * 0.45}" 
            fill="none" stroke="url(#logoGradient)" stroke-width="${logoSize * 0.025}" filter="url(#glow)"/>
    <circle cx="${logoSize/2}" cy="${logoSize/2}" r="${logoSize * 0.38}" 
            fill="none" stroke="url(#logoGradient)" stroke-width="${logoSize * 0.015}" opacity="0.4"/>
    <path d="M${logoSize/2} ${logoSize * 0.08} Q${logoSize * 0.85} ${logoSize * 0.35} ${logoSize/2} ${logoSize/2} Q${logoSize * 0.15} ${logoSize * 0.65} ${logoSize/2} ${logoSize * 0.92}"
          fill="none" stroke="url(#logoGradient)" stroke-width="${logoSize * 0.025}" stroke-linecap="round"/>
    <path d="M${logoSize * 0.08} ${logoSize/2} Q${logoSize * 0.35} ${logoSize * 0.15} ${logoSize/2} ${logoSize/2} Q${logoSize * 0.65} ${logoSize * 0.85} ${logoSize * 0.92} ${logoSize/2}"
          fill="none" stroke="url(#logoGradient)" stroke-width="${logoSize * 0.025}" stroke-linecap="round"/>
    <path d="M${logoSize * 0.2} ${logoSize * 0.18} Q${logoSize/2} ${logoSize * 0.4} ${logoSize * 0.8} ${logoSize * 0.18}"
          fill="none" stroke="url(#logoGradient)" stroke-width="${logoSize * 0.018}" stroke-linecap="round" opacity="0.5"/>
    <path d="M${logoSize * 0.2} ${logoSize * 0.82} Q${logoSize/2} ${logoSize * 0.6} ${logoSize * 0.8} ${logoSize * 0.82}"
          fill="none" stroke="url(#logoGradient)" stroke-width="${logoSize * 0.018}" stroke-linecap="round" opacity="0.5"/>
    <circle cx="${logoSize/2}" cy="${logoSize/2}" r="${logoSize * 0.05}" fill="url(#logoGradient)"/>
    <circle cx="${logoSize/2}" cy="${logoSize/2}" r="${logoSize * 0.025}" fill="white" opacity="0.8"/>
  </g>
  
  <text x="${width/2}" y="${textY}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="${height * 0.045}">
    <tspan fill="url(#logoGradient)">VolleyScore</tspan>
    <tspan fill="${textColor}"> Pro</tspan>
  </text>
  
  <text x="${width/2}" y="${subTextY}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="${height * 0.018}" fill="${subTextColor}" letter-spacing="0.15em">
    PLACAR PROFISSIONAL
  </text>
</svg>`;
}

function generateSplashScreens() {
  const androidResPath = join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
  const publicPath = join(__dirname, '..', 'public');

  console.log('🎨 Generating splash screens...\n');

  splashConfigs.forEach(config => {
    const svg = createSplashSVG(config.width, config.height, true);
    const folderPath = join(androidResPath, config.folder);
    
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }
    
    writeFileSync(join(folderPath, 'splash.svg'), svg);
    console.log(`✅ ${config.folder}/splash.svg (${config.width}x${config.height})`);
  });

  const mainSvg = createSplashSVG(1080, 1920, true);
  writeFileSync(join(publicPath, 'splash.svg'), mainSvg);
  console.log(`\n✅ public/splash.svg (1080x1920)`);

  console.log('\n📝 Note: SVG files saved. To convert to PNG:');
  console.log('   Option 1: Open scripts/splash-generator.html in browser and save images');
  console.log('   Option 2: Use a tool like sharp, imagemagick, or online converter');
  console.log('   Option 3: Android Studio will handle SVG automatically in newer versions');
}

generateSplashScreens();

import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync } from 'fs';
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

function createBackgroundSVG(width, height) {
  const orb1 = 'rgba(99,102,241,0.15)';
  const orb2 = 'rgba(168,85,247,0.12)';
  
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="orb1Grad" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${orb1}"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="orb2Grad" cx="70%" cy="70%" r="70%">
      <stop offset="0%" stop-color="${orb2}"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  
  <rect width="100%" height="100%" fill="#020617"/>
  <ellipse cx="${width * 0.25}" cy="${height * 0.3}" rx="${width * 0.4}" ry="${height * 0.3}" fill="url(#orb1Grad)"/>
  <ellipse cx="${width * 0.75}" cy="${height * 0.7}" rx="${width * 0.35}" ry="${height * 0.25}" fill="url(#orb2Grad)"/>
</svg>`;
}

function createTextSVG(width, height, logoSize) {
  const textColor = '#f1f5f9';
  const subTextColor = '#64748b';
  const logoY = height / 2 - height * 0.05;
  const textY = logoY + logoSize / 2 + height * 0.08;
  const subTextY = textY + height * 0.04;
  const fontSize = Math.round(height * 0.04);
  const subFontSize = Math.round(height * 0.016);

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8"/>
      <stop offset="50%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
  </defs>
  
  <text x="${width/2}" y="${textY}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${fontSize}">
    <tspan fill="url(#logoGradient)">VolleyScore</tspan>
    <tspan fill="${textColor}"> Pro</tspan>
  </text>
  
  <text x="${width/2}" y="${subTextY}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="${subFontSize}" fill="${subTextColor}" letter-spacing="0.2em">
    PLACAR PROFISSIONAL
  </text>
</svg>`;
}

async function generatePNG(width, height, outputPath, iconPath) {
  const logoSize = Math.min(width, height) * 0.28;
  const logoX = (width - logoSize) / 2;
  const logoY = height / 2 - height * 0.05 - logoSize / 2;

  const backgroundSVG = createBackgroundSVG(width, height);
  const textSVG = createTextSVG(width, height, logoSize);

  const backgroundBuffer = Buffer.from(backgroundSVG);
  const textBuffer = Buffer.from(textSVG);

  await sharp(backgroundBuffer)
    .composite([
      {
        input: await sharp(iconPath)
          .resize(Math.round(logoSize), Math.round(logoSize))
          .toBuffer(),
        left: Math.round(logoX),
        top: Math.round(logoY),
      },
      {
        input: textBuffer,
        top: 0,
        left: 0,
      },
    ])
    .toFile(outputPath);
}

async function main() {
  const androidResPath = join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
  const publicPath = join(__dirname, '..', 'public');
  const assetsPath = join(__dirname, '..', 'assets');
  const iconPath = join(assetsPath, 'icon.png');

  if (!existsSync(iconPath)) {
    console.error('❌ Icon not found:', iconPath);
    process.exit(1);
  }

  console.log('🎨 Generating splash screen PNGs with app icon...\n');

  for (const config of splashConfigs) {
    const outputPath = join(androidResPath, config.folder, 'splash.png');
    await generatePNG(config.width, config.height, outputPath, iconPath);
    console.log(`✅ ${config.folder}/splash.png (${config.width}x${config.height})`);
  }

  await generatePNG(1080, 1920, join(publicPath, 'splash.png'), iconPath);
  console.log(`\n✅ public/splash.png (1080x1920)`);

  await generatePNG(1080, 1920, join(assetsPath, 'splash.png'), iconPath);
  console.log(`✅ assets/splash.png (1080x1920)`);

  console.log('\n🎉 All splash screens generated successfully!');
}

main().catch(console.error);

# SPEC - Migração Estrutural: Fase 1 (Infraestrutura e Baixo Risco)

> **Status:** ESPECIFICAÇÃO TÉCNICA
> **Data:** 2026-02-14
> **Escopo:** Fases 0-4 (Path Aliases, Types, UI, Lib, Layouts)
> **Risco:** BAIXO
> **Tempo Estimado:** 2-3 horas (com testes)

---

## 1. Visão Geral

Esta especificação detalha a implementação técnica das primeiras 5 fases da reorganização estrutural do projeto VolleyScore Pro, conforme definido no [PRD_FOLDER_STRUCTURE.md](PRD_FOLDER_STRUCTURE.md).

### Objetivos
1. **Fase 0:** Configurar path aliases sem mover arquivos
2. **Fase 1:** Migrar `src/types/*` → `src/@types/*` + `constants.ts` → `config/`
3. **Fase 2:** Migrar Design System (`components/ui/*` → `ui/`)
4. **Fase 3:** Migrar serviços compartilhados (`services/`, `utils/`, `hooks/` → `lib/`)
5. **Fase 4:** Migrar layouts (`components/layouts/*` → `layouts/`)

### Pré-requisitos
- ✅ Node.js 20+
- ✅ Git working tree limpo (sem uncommitted changes)
- ✅ Backup do projeto (recomendado)

---

## 2. Fase 0: Configuração de Path Aliases

### 2.1 Atualizar `tsconfig.json`

**Arquivo:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "types": ["node"],
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,

    // ========== PATH ALIASES (NOVO) ==========
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@types": ["./src/@types"],
      "@types/*": ["./src/@types/*"],
      "@ui": ["./src/ui"],
      "@ui/*": ["./src/ui/*"],
      "@lib/*": ["./src/lib/*"],
      "@features/*": ["./src/features/*"],
      "@contexts/*": ["./src/contexts/*"],
      "@layouts/*": ["./src/layouts/*"],
      "@config/*": ["./src/config/*"],
      "@hooks/*": ["./src/hooks/*"]
    },
    // ========================================

    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

**Mudanças:**
- Adicionado `"baseUrl": "."` (necessário para `paths`)
- Expandido `paths` de `@/*` para incluir todos os aliases planejados

---

### 2.2 Atualizar `vite.config.ts`

**Arquivo:** `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Reconstruct __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    // ========== PATH ALIASES (NOVO) ==========
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@types': path.resolve(__dirname, './src/@types'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@features': path.resolve(__dirname, './src/features'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@config': path.resolve(__dirname, './src/config'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
    // ========================================

    dedupe: ['react', 'react-dom'],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      external: [],
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigationPreload: false,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      manifest: {
        name: 'VolleyScore Pro 2',
        short_name: 'VolleyScore',
        description: 'VolleyScore Pro 2 is the definitive volleyball companion. It combines a high-performance gesture-based scoreboard with deep team management. Features: Smart Rotation tracking (Standard & Balanced), customizable rules (Indoor/Beach, Sudden Death), career player statistics with "Scout Mode", real-time voice commands, and rich match history with momentum graphs.',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'fullscreen',
        display_override: ['fullscreen', 'standalone'],
        scope: '/',
        start_url: '/?fullscreen=true',
        orientation: 'any',
        categories: ['sports', 'utilities', 'productivity'],
        id: 'volleyscore-pro-v2',
        icons: [
          {
            src: 'icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
});
```

**Mudanças:**
- Adicionado bloco `resolve.alias` com todos os path aliases mapeados para `path.resolve(__dirname, ...)`

---

### 2.3 Verificação (Fase 0)

**Comandos:**
```bash
# 1. Verificar que o TypeScript reconhece os aliases
npx tsc --noEmit

# 2. Verificar que o Vite compila
npm run build

# 3. Verificar que o dev server inicia
npm run dev
```

**Resultado Esperado:**
- ✅ Zero erros de compilação TypeScript
- ✅ Build Vite finaliza sem warnings
- ✅ Dev server inicia normalmente

> **Nota:** Nesta fase, os aliases estão configurados mas nenhum código os usa ainda. Isso é esperado.

---

## 3. Script de Migração Automatizado

### 3.1 Criar o Script

**Arquivo:** `scripts/migrate-phase-1.js`

```javascript
#!/usr/bin/env node

/**
 * SPEC_MIGRATION_PHASE_1 - Script de Migração Automatizado
 *
 * Executa as Fases 1-4 da reorganização estrutural:
 * - Fase 1: Types e Config
 * - Fase 2: Design System (UI)
 * - Fase 3: Lib (serviços compartilhados)
 * - Fase 4: Layouts
 *
 * IMPORTANTE: Execute com Git working tree limpo!
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

// ==================== UTILITÁRIOS ====================

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function mkdirSafe(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log('📁', `Criado: ${path.relative(ROOT, dir)}`);
  }
}

function moveFile(oldPath, newPath) {
  mkdirSafe(path.dirname(newPath));
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    log('📦', `Movido: ${path.relative(SRC, oldPath)} → ${path.relative(SRC, newPath)}`);
  } else {
    log('⚠️', `Arquivo não encontrado (pulando): ${oldPath}`);
  }
}

function replaceInFile(filePath, searchRegex, replacement) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  const updated = content.replace(searchRegex, replacement);
  if (content !== updated) {
    fs.writeFileSync(filePath, updated, 'utf-8');
    return true;
  }
  return false;
}

function replaceInAllFiles(pattern, searchRegex, replacement) {
  const files = execSync(`git ls-files '${pattern}'`, { cwd: ROOT, encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);

  let count = 0;
  files.forEach(file => {
    const fullPath = path.join(ROOT, file);
    if (replaceInFile(fullPath, searchRegex, replacement)) {
      count++;
    }
  });

  if (count > 0) {
    log('🔄', `Atualizados ${count} arquivos`);
  }
}

// ==================== FASE 1: TYPES + CONFIG ====================

function phase1_types_and_config() {
  log('🚀', 'FASE 1: Migração de Types e Config');

  // 1.1 Criar diretório @types
  mkdirSafe(path.join(SRC, '@types'));

  // 1.2 Mover arquivos de types/
  const typesFiles = ['domain.ts', 'services.ts', 'ui.ts'];
  typesFiles.forEach(file => {
    moveFile(
      path.join(SRC, 'types', file),
      path.join(SRC, '@types', file)
    );
  });

  // 1.3 Criar novo barrel index.ts em @types
  const typesIndexContent = `// Auto-generated barrel export for @types
export * from './domain';
export * from './services';
export * from './ui';
`;
  fs.writeFileSync(path.join(SRC, '@types', 'index.ts'), typesIndexContent, 'utf-8');
  log('📝', 'Criado: src/@types/index.ts (barrel export)');

  // 1.4 Criar re-export temporário em src/types.ts
  const legacyTypesContent = `// DEPRECATED: Use '@types' instead
// This file exists for backward compatibility during migration
// TODO: Remove after all imports are migrated to @types
export * from './@types';
`;
  fs.writeFileSync(path.join(SRC, 'types.ts'), legacyTypesContent, 'utf-8');
  log('📝', 'Atualizado: src/types.ts (re-export temporário)');

  // 1.5 Remover diretório types/ vazio
  const typesDir = path.join(SRC, 'types');
  if (fs.existsSync(typesDir) && fs.readdirSync(typesDir).length === 0) {
    fs.rmdirSync(typesDir);
    log('🗑️', 'Removido: src/types/ (vazio)');
  }

  // 1.6 Mover constants.ts para config/
  moveFile(
    path.join(SRC, 'constants.ts'),
    path.join(SRC, 'config', 'constants.ts')
  );

  // 1.7 Atualizar imports de constants
  replaceInAllFiles(
    'src/**/*.{ts,tsx}',
    /from ['"]\.\.?\/constants['"]/g,
    "from '@config/constants'"
  );

  log('✅', 'FASE 1 CONCLUÍDA\n');
}

// ==================== FASE 2: DESIGN SYSTEM (UI) ====================

function phase2_ui() {
  log('🚀', 'FASE 2: Migração do Design System (UI)');

  // 2.1 Criar diretório ui/
  mkdirSafe(path.join(SRC, 'ui'));

  // 2.2 Mover todos os arquivos de components/ui/
  const uiFiles = [
    'Badge.tsx',
    'Button.tsx',
    'BackgroundGlow.tsx',
    'Confetti.tsx',
    'CriticalPointAnimation.tsx',
    'ErrorBoundary.tsx',
    'FloatingTimeout.tsx',
    'GestureHint.tsx',
    'GlassSurface.tsx',
    'GlobalLoader.tsx',
    'HaloBackground.tsx',
    'HaloPortal.tsx',
    'IconButton.tsx',
    'InstallReminder.tsx',
    'Modal.tsx',
    'ModalHeader.tsx',
    'NotificationToast.tsx',
    'PageIndicator.tsx',
    'ReloadPrompt.tsx',
    'ScoreTicker.tsx',
    'SkillSlider.tsx',
    'TeamLogo.tsx',
    'ToggleGroup.tsx',
    'TrackingGlow.tsx',
    'VoiceToast.tsx',
    'index.ts'
  ];

  uiFiles.forEach(file => {
    moveFile(
      path.join(SRC, 'components', 'ui', file),
      path.join(SRC, 'ui', file)
    );
  });

  // 2.3 Remover components/ui/ vazio
  const componentsUiDir = path.join(SRC, 'components', 'ui');
  if (fs.existsSync(componentsUiDir) && fs.readdirSync(componentsUiDir).length === 0) {
    fs.rmdirSync(componentsUiDir);
    log('🗑️', 'Removido: src/components/ui/ (vazio)');
  }

  // 2.4 Atualizar imports de ../components/ui/X para @ui/X
  replaceInAllFiles(
    'src/**/*.{ts,tsx}',
    /from ['"](\.\.\/)+components\/ui\/([^'"]+)['"]/g,
    "from '@ui/$2'"
  );

  // 2.5 Atualizar imports de ./ui/X para @ui/X (dentro de components/)
  replaceInAllFiles(
    'src/**/*.{ts,tsx}',
    /from ['"]\.\/ui\/([^'"]+)['"]/g,
    "from '@ui/$1'"
  );

  log('✅', 'FASE 2 CONCLUÍDA\n');
}

// ==================== FASE 3: LIB (SERVIÇOS COMPARTILHADOS) ====================

function phase3_lib() {
  log('🚀', 'FASE 3: Migração de Lib (Serviços Compartilhados)');

  // 3.1 Criar estrutura de diretórios em lib/
  const libDirs = [
    'lib',
    'lib/audio',
    'lib/haptics',
    'lib/platform',
    'lib/storage',
    'lib/ads',
    'lib/pwa',
    'lib/image',
    'lib/utils'
  ];

  libDirs.forEach(dir => mkdirSafe(path.join(SRC, dir)));

  // 3.2 Mover services/firebase.ts para lib/
  moveFile(
    path.join(SRC, 'services', 'firebase.ts'),
    path.join(SRC, 'lib', 'firebase.ts')
  );

  // 3.3 Mover lib/audio/
  moveFile(
    path.join(SRC, 'services', 'AudioService.ts'),
    path.join(SRC, 'lib', 'audio', 'AudioService.ts')
  );

  // 3.4 Mover lib/haptics/
  moveFile(
    path.join(SRC, 'hooks', 'useHaptics.ts'),
    path.join(SRC, 'lib', 'haptics', 'useHaptics.ts')
  );

  // 3.5 Mover lib/platform/
  const platformFiles = {
    'services/PlatformService.ts': 'lib/platform/PlatformService.ts',
    'hooks/usePlatform.ts': 'lib/platform/usePlatform.ts',
    'hooks/useKeepAwake.ts': 'lib/platform/useKeepAwake.ts',
    'hooks/useImmersiveMode.ts': 'lib/platform/useImmersiveMode.ts',
    'hooks/useNativeIntegration.ts': 'lib/platform/useNativeIntegration.ts',
    'hooks/useSafeAreaInsets.ts': 'lib/platform/useSafeAreaInsets.ts',
    'utils/deviceDetection.ts': 'lib/platform/deviceDetection.ts'
  };

  Object.entries(platformFiles).forEach(([from, to]) => {
    moveFile(path.join(SRC, from), path.join(SRC, to));
  });

  // 3.6 Mover lib/storage/
  moveFile(
    path.join(SRC, 'services', 'SecureStorage.ts'),
    path.join(SRC, 'lib', 'storage', 'SecureStorage.ts')
  );
  moveFile(
    path.join(SRC, 'services', 'BackupService.ts'),
    path.join(SRC, 'lib', 'storage', 'BackupService.ts')
  );

  // 3.7 Mover lib/ads/
  const adsFiles = {
    'services/AdService.ts': 'lib/ads/AdService.ts',
    'hooks/useAdFlow.ts': 'lib/ads/useAdFlow.ts',
    'hooks/useAdLifecycle.ts': 'lib/ads/useAdLifecycle.ts'
  };

  Object.entries(adsFiles).forEach(([from, to]) => {
    moveFile(path.join(SRC, from), path.join(SRC, to));
  });

  // 3.8 Mover lib/pwa/
  const pwaFiles = {
    'hooks/useServiceWorker.ts': 'lib/pwa/useServiceWorker.ts',
    'hooks/usePWAInstallPrompt.ts': 'lib/pwa/usePWAInstallPrompt.ts',
    'hooks/useOnlineStatus.ts': 'lib/pwa/useOnlineStatus.ts'
  };

  Object.entries(pwaFiles).forEach(([from, to]) => {
    moveFile(path.join(SRC, from), path.join(SRC, to));
  });

  // 3.9 Mover lib/image/
  moveFile(
    path.join(SRC, 'services', 'ImageService.ts'),
    path.join(SRC, 'lib', 'image', 'ImageService.ts')
  );

  // 3.10 Mover lib/utils/
  const utilsFiles = [
    'animations.ts',
    'colors.ts',
    'colorsDynamic.ts',
    'logger.ts',
    'responsive.ts',
    'security.ts',
    'stringUtils.ts',
    'validation.ts'
  ];

  utilsFiles.forEach(file => {
    moveFile(
      path.join(SRC, 'utils', file),
      path.join(SRC, 'lib', 'utils', file)
    );
  });

  // 3.11 Atualizar imports de services/
  const servicesMappings = [
    { from: /from ['"]\.\.?\/services\/firebase['"]/g, to: "from '@lib/firebase'" },
    { from: /from ['"]\.\.?\/services\/AudioService['"]/g, to: "from '@lib/audio/AudioService'" },
    { from: /from ['"]\.\.?\/services\/PlatformService['"]/g, to: "from '@lib/platform/PlatformService'" },
    { from: /from ['"]\.\.?\/services\/SecureStorage['"]/g, to: "from '@lib/storage/SecureStorage'" },
    { from: /from ['"]\.\.?\/services\/BackupService['"]/g, to: "from '@lib/storage/BackupService'" },
    { from: /from ['"]\.\.?\/services\/AdService['"]/g, to: "from '@lib/ads/AdService'" },
    { from: /from ['"]\.\.?\/services\/ImageService['"]/g, to: "from '@lib/image/ImageService'" }
  ];

  servicesMappings.forEach(({ from, to }) => {
    replaceInAllFiles('src/**/*.{ts,tsx}', from, to);
  });

  // 3.12 Atualizar imports de hooks/
  const hooksMappings = [
    { from: /from ['"]\.\.?\/hooks\/useHaptics['"]/g, to: "from '@lib/haptics/useHaptics'" },
    { from: /from ['"]\.\.?\/hooks\/usePlatform['"]/g, to: "from '@lib/platform/usePlatform'" },
    { from: /from ['"]\.\.?\/hooks\/useKeepAwake['"]/g, to: "from '@lib/platform/useKeepAwake'" },
    { from: /from ['"]\.\.?\/hooks\/useImmersiveMode['"]/g, to: "from '@lib/platform/useImmersiveMode'" },
    { from: /from ['"]\.\.?\/hooks\/useNativeIntegration['"]/g, to: "from '@lib/platform/useNativeIntegration'" },
    { from: /from ['"]\.\.?\/hooks\/useSafeAreaInsets['"]/g, to: "from '@lib/platform/useSafeAreaInsets'" },
    { from: /from ['"]\.\.?\/hooks\/useAdFlow['"]/g, to: "from '@lib/ads/useAdFlow'" },
    { from: /from ['"]\.\.?\/hooks\/useAdLifecycle['"]/g, to: "from '@lib/ads/useAdLifecycle'" },
    { from: /from ['"]\.\.?\/hooks\/useServiceWorker['"]/g, to: "from '@lib/pwa/useServiceWorker'" },
    { from: /from ['"]\.\.?\/hooks\/usePWAInstallPrompt['"]/g, to: "from '@lib/pwa/usePWAInstallPrompt'" },
    { from: /from ['"]\.\.?\/hooks\/useOnlineStatus['"]/g, to: "from '@lib/pwa/useOnlineStatus'" }
  ];

  hooksMappings.forEach(({ from, to }) => {
    replaceInAllFiles('src/**/*.{ts,tsx}', from, to);
  });

  // 3.13 Atualizar imports de utils/
  const utilsMappings = [
    { from: /from ['"]\.\.?\/utils\/animations['"]/g, to: "from '@lib/utils/animations'" },
    { from: /from ['"]\.\.?\/utils\/colors['"]/g, to: "from '@lib/utils/colors'" },
    { from: /from ['"]\.\.?\/utils\/colorsDynamic['"]/g, to: "from '@lib/utils/colorsDynamic'" },
    { from: /from ['"]\.\.?\/utils\/deviceDetection['"]/g, to: "from '@lib/platform/deviceDetection'" },
    { from: /from ['"]\.\.?\/utils\/logger['"]/g, to: "from '@lib/utils/logger'" },
    { from: /from ['"]\.\.?\/utils\/responsive['"]/g, to: "from '@lib/utils/responsive'" },
    { from: /from ['"]\.\.?\/utils\/security['"]/g, to: "from '@lib/utils/security'" },
    { from: /from ['"]\.\.?\/utils\/stringUtils['"]/g, to: "from '@lib/utils/stringUtils'" },
    { from: /from ['"]\.\.?\/utils\/validation['"]/g, to: "from '@lib/utils/validation'" }
  ];

  utilsMappings.forEach(({ from, to }) => {
    replaceInAllFiles('src/**/*.{ts,tsx}', from, to);
  });

  log('✅', 'FASE 3 CONCLUÍDA\n');
}

// ==================== FASE 4: LAYOUTS ====================

function phase4_layouts() {
  log('🚀', 'FASE 4: Migração de Layouts');

  // 4.1 Criar diretório layouts/
  mkdirSafe(path.join(SRC, 'layouts'));

  // 4.2 Mover arquivos de components/layouts/
  const layoutFiles = [
    'FullscreenLayout.tsx',
    'NormalLayout.tsx',
    'CourtPage.tsx',
    'GameOverlays.tsx',
    'HorizontalPagesContainer.tsx'
  ];

  layoutFiles.forEach(file => {
    moveFile(
      path.join(SRC, 'components', 'layouts', file),
      path.join(SRC, 'layouts', file)
    );
  });

  // 4.3 Remover components/layouts/ vazio
  const layoutsDir = path.join(SRC, 'components', 'layouts');
  if (fs.existsSync(layoutsDir) && fs.readdirSync(layoutsDir).length === 0) {
    fs.rmdirSync(layoutsDir);
    log('🗑️', 'Removido: src/components/layouts/ (vazio)');
  }

  // 4.4 Atualizar imports de ../components/layouts/X para @layouts/X
  replaceInAllFiles(
    'src/**/*.{ts,tsx}',
    /from ['"](\.\.\/)+components\/layouts\/([^'"]+)['"]/g,
    "from '@layouts/$2'"
  );

  // 4.5 Atualizar imports de ./layouts/X para @layouts/X
  replaceInAllFiles(
    'src/**/*.{ts,tsx}',
    /from ['"]\.\/layouts\/([^'"]+)['"]/g,
    "from '@layouts/$1'"
  );

  log('✅', 'FASE 4 CONCLUÍDA\n');
}

// ==================== MAIN ====================

function main() {
  console.log('\n🎯 SPEC_MIGRATION_PHASE_1 - Iniciando migração estrutural\n');

  // Verificação de segurança
  try {
    const gitStatus = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf-8' });
    if (gitStatus.trim()) {
      log('⚠️', 'AVISO: Git working tree não está limpo!');
      log('⚠️', 'Recomenda-se fazer commit antes de continuar.');
      log('⚠️', 'Pressione Ctrl+C para cancelar ou aguarde 5s para continuar...\n');
      execSync('sleep 5', { stdio: 'inherit' });
    }
  } catch (err) {
    log('⚠️', 'Não foi possível verificar status do Git (continuando...)');
  }

  // Executar fases
  phase1_types_and_config();
  phase2_ui();
  phase3_lib();
  phase4_layouts();

  // Sumário final
  console.log('\n✨ MIGRAÇÃO CONCLUÍDA COM SUCESSO!\n');
  console.log('📋 Próximos passos:');
  console.log('   1. npm run build        # Verificar compilação');
  console.log('   2. npm run dev          # Testar dev server');
  console.log('   3. git status           # Revisar mudanças');
  console.log('   4. git add -A           # Stagear arquivos');
  console.log('   5. git commit -m "refactor: Phase 1 migration (types, ui, lib, layouts)"');
  console.log('\n');
}

main();
```

---

### 3.2 Tornar o Script Executável

**Comandos:**
```bash
# 1. Criar diretório scripts/
mkdir -p scripts

# 2. Copiar o script acima para scripts/migrate-phase-1.js

# 3. Tornar executável (Linux/Mac)
chmod +x scripts/migrate-phase-1.js
```

---

### 3.3 Adicionar Script ao package.json

**Arquivo:** `package.json` (adicionar ao bloco `scripts`)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "deploy": "npm run build && firebase deploy",
    "deploy:hosting": "npm run build && firebase deploy --only hosting",
    "cap:sync": "npm run build && npx cap sync",
    "cap:open:android": "npx cap open android",
    "cap:open:ios": "npx cap open ios",

    "migrate:phase1": "node scripts/migrate-phase-1.js"
  }
}
```

---

## 4. Ordem de Execução

### 4.1 Pré-Execução (OBRIGATÓRIO)

```bash
# 1. Garantir working tree limpo
git status

# 2. Criar branch para migração
git checkout -b refactor/folder-structure-phase-1

# 3. Fazer backup (opcional, mas recomendado)
git branch backup/pre-migration-phase1
```

---

### 4.2 Execução Principal

```bash
# 1. Atualizar tsconfig.json manualmente (copiar seção 2.1)

# 2. Atualizar vite.config.ts manualmente (copiar seção 2.2)

# 3. Verificar que aliases funcionam SEM mover arquivos
npm run build

# 4. Se OK, executar o script de migração
npm run migrate:phase1
```

**Saída Esperada:**
```
🎯 SPEC_MIGRATION_PHASE_1 - Iniciando migração estrutural

🚀 FASE 1: Migração de Types e Config
📁 Criado: src/@types
📦 Movido: types/domain.ts → @types/domain.ts
📦 Movido: types/services.ts → @types/services.ts
📦 Movido: types/ui.ts → @types/ui.ts
📝 Criado: src/@types/index.ts (barrel export)
📝 Atualizado: src/types.ts (re-export temporário)
🗑️ Removido: src/types/ (vazio)
📦 Movido: constants.ts → config/constants.ts
🔄 Atualizados 15 arquivos
✅ FASE 1 CONCLUÍDA

🚀 FASE 2: Migração do Design System (UI)
📁 Criado: src/ui
📦 Movido: components/ui/Badge.tsx → ui/Badge.tsx
[... 24 mais arquivos ...]
🗑️ Removido: src/components/ui/ (vazio)
🔄 Atualizados 87 arquivos
✅ FASE 2 CONCLUÍDA

🚀 FASE 3: Migração de Lib (Serviços Compartilhados)
[... logs detalhados ...]
✅ FASE 3 CONCLUÍDA

🚀 FASE 4: Migração de Layouts
[... logs detalhados ...]
✅ FASE 4 CONCLUÍDA

✨ MIGRAÇÃO CONCLUÍDA COM SUCESSO!

📋 Próximos passos:
   1. npm run build        # Verificar compilação
   2. npm run dev          # Testar dev server
   3. git status           # Revisar mudanças
   4. git add -A           # Stagear arquivos
   5. git commit -m "refactor: Phase 1 migration (types, ui, lib, layouts)"
```

---

### 4.3 Verificação Pós-Migração

```bash
# 1. Verificar compilação TypeScript
npx tsc --noEmit

# 2. Verificar build Vite
npm run build

# 3. Iniciar dev server e testar UI
npm run dev
# Abrir http://localhost:5173 e navegar pela aplicação

# 4. Verificar imports (deve retornar 0 ocorrências)
git grep -n "from ['\"]\.\.\/\.\.\/\.\.\/components\/ui" src/
git grep -n "from ['\"]\.\.\/\.\.\/services\/" src/
git grep -n "from ['\"]\.\.\/\.\.\/utils\/" src/

# 5. Verificar novos imports (deve retornar muitas ocorrências)
git grep -n "from '@ui/" src/ | wc -l
git grep -n "from '@lib/" src/ | wc -l
git grep -n "from '@layouts/" src/ | wc -l
```

**Resultado Esperado:**
- ✅ Zero erros de compilação TypeScript
- ✅ Build Vite finaliza sem warnings
- ✅ Dev server inicia e aplicação funciona normalmente
- ✅ Nenhum import relativo profundo (`../../../`) para arquivos movidos
- ✅ Todos os imports usam aliases (`@ui/`, `@lib/`, `@layouts/`)

---

## 5. Estrutura Final (Pós-Fase 4)

```
src/
├── @types/                              # ✅ NOVO
│   ├── index.ts                         # Barrel export
│   ├── domain.ts
│   ├── services.ts
│   └── ui.ts
│
├── ui/                                  # ✅ NOVO (Design System)
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── ... (25 componentes)
│
├── lib/                                 # ✅ NOVO (Serviços compartilhados)
│   ├── firebase.ts
│   ├── audio/
│   │   └── AudioService.ts
│   ├── haptics/
│   │   └── useHaptics.ts
│   ├── platform/
│   │   ├── PlatformService.ts
│   │   ├── usePlatform.ts
│   │   └── deviceDetection.ts
│   ├── storage/
│   │   ├── SecureStorage.ts
│   │   └── BackupService.ts
│   ├── ads/
│   │   ├── AdService.ts
│   │   ├── useAdFlow.ts
│   │   └── useAdLifecycle.ts
│   ├── pwa/
│   │   ├── useServiceWorker.ts
│   │   └── usePWAInstallPrompt.ts
│   ├── image/
│   │   └── ImageService.ts
│   └── utils/
│       ├── animations.ts
│       ├── colors.ts
│       └── ... (8 utilitários)
│
├── layouts/                             # ✅ NOVO
│   ├── FullscreenLayout.tsx
│   ├── NormalLayout.tsx
│   ├── CourtPage.tsx
│   ├── GameOverlays.tsx
│   └── HorizontalPagesContainer.tsx
│
├── config/                              # ✅ ATUALIZADO
│   ├── constants.ts                     # ← Movido de src/constants.ts
│   ├── featureFlags.ts
│   ├── gameModes.ts
│   └── performanceModes.ts
│
├── components/                          # ⚠️ PARCIALMENTE LIMPO
│   ├── Controls.tsx
│   ├── HistoryBar.tsx
│   ├── PlayerCard.tsx
│   ├── ... (resto ainda aqui - aguardando fases futuras)
│
├── contexts/                            # ✅ MANTÉM (contextos globais)
│   ├── AuthContext.tsx
│   ├── GameContext.tsx
│   └── ...
│
├── hooks/                               # ⚠️ PARCIALMENTE LIMPO
│   ├── useVolleyGame.ts
│   └── ... (hooks de features - aguardando fases futuras)
│
├── types.ts                             # ⚠️ DEPRECATED (re-export temporário)
│
├── services/                            # ⚠️ PARCIALMENTE LIMPO
│   └── ... (serviços de features - aguardando fases futuras)
│
├── utils/                               # ⚠️ PARCIALMENTE LIMPO
│   └── ... (utils de features - aguardando fases futuras)
│
└── ... (outros diretórios inalterados)
```

---

## 6. Rollback Plan

Em caso de problemas críticos:

```bash
# Opção 1: Reverter via Git (se ainda não commitou)
git checkout .
git clean -fd

# Opção 2: Reverter commit (se já commitou)
git reset --hard HEAD~1

# Opção 3: Voltar para branch backup
git checkout backup/pre-migration-phase1
git branch -D refactor/folder-structure-phase-1
```

---

## 7. Checklist de Validação

Antes de considerar a migração concluída, verificar:

- [ ] `npm run build` finaliza sem erros
- [ ] `npm run dev` inicia normalmente
- [ ] Aplicação carrega no navegador sem console errors
- [ ] Navegação entre telas funciona
- [ ] Modais abrem/fecham corretamente
- [ ] Animações e transições funcionam
- [ ] Imports relativos profundos (`../../../`) foram eliminados para arquivos movidos
- [ ] Zero warnings de TypeScript relacionados a imports
- [ ] Git diff mostra apenas:
  - Arquivos movidos (renomeados)
  - Imports atualizados
  - tsconfig.json e vite.config.ts modificados

---

## 8. Métricas Esperadas

| Métrica | Antes | Depois |
|---------|-------|--------|
| Arquivos em `src/components/ui/` | 25 | 0 |
| Arquivos em `src/components/layouts/` | 5 | 0 |
| Arquivos em `src/types/` | 3 | 0 |
| Arquivos em `src/ui/` | 0 | 25 |
| Arquivos em `src/layouts/` | 0 | 5 |
| Arquivos em `src/@types/` | 0 | 4 |
| Arquivos em `src/lib/` | 0 | ~30 |
| Imports usando `@ui/` | 0 | ~87 |
| Imports usando `@lib/` | 0 | ~120 |
| Imports usando `@layouts/` | 0 | ~15 |
| Imports relativos profundos (`../../../`) | ~200 | ~100 (reduzido) |

---

## 9. Próximos Passos (Fases Futuras)

Esta spec cobre apenas as **Fases 0-4** (infraestrutura e baixo risco). As próximas fases incluem:

- **Fase 5:** `src/features/tutorial/` (SPEC_MIGRATION_PHASE_2.md)
- **Fase 6:** `src/features/voice/`
- **Fase 7:** `src/features/social/`
- **Fase 8:** `src/features/settings/`
- **Fase 9:** `src/features/history/`
- **Fase 10:** `src/features/teams/` + `src/features/court/`
- **Fase 11:** `src/features/broadcast/`
- **Fase 12:** `src/features/game/` (CRÍTICO - maior risco)
- **Fase 13:** Cleanup final (remover re-exports temporários)

Cada fase subsequente terá sua própria SPEC detalhada.

---

> **STATUS:** ESPECIFICAÇÃO PRONTA PARA EXECUÇÃO
> **PRÓXIMO PASSO:** Aprovação do usuário para iniciar implementação


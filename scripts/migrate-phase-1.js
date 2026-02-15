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

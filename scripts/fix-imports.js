#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

function log(emoji, message) {
    console.log(`${emoji} ${message}`);
}

function moveFile(oldPath, newPath) {
    if (fs.existsSync(oldPath)) {
        const targetDir = path.dirname(newPath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.renameSync(oldPath, newPath);
        log('📦', `Movido: ${path.relative(SRC, oldPath)} → ${path.relative(SRC, newPath)}`);
    }
}

const mappings = {
    // Config
    'constants': '@config/constants',

    // Types
    'types': '@types',
    'types/domain': '@types/domain',
    'types/services': '@types/services',
    'types/ui': '@types/ui',

    // Utils
    'utils/animations': '@lib/utils/animations',
    'utils/colors': '@lib/utils/colors',
    'utils/colorsDynamic': '@lib/utils/colorsDynamic',
    'utils/logger': '@lib/utils/logger',
    'utils/responsive': '@lib/utils/responsive',
    'utils/security': '@lib/utils/security',
    'utils/stringUtils': '@lib/utils/stringUtils',
    'utils/validation': '@lib/utils/validation',
    'utils/deviceDetection': '@lib/platform/deviceDetection',

    // Services (paths and filenames)
    'services/firebase': '@lib/firebase',
    'services/AudioService': '@lib/audio/AudioService',
    'services/PlatformService': '@lib/platform/PlatformService',
    'services/SecureStorage': '@lib/storage/SecureStorage',
    'services/BackupService': '@lib/storage/BackupService',
    'services/AdService': '@lib/ads/AdService',
    'services/ImageService': '@lib/image/ImageService',
    'services/io': '@lib/storage/io',
    // Filename only keys to catch relative imports from siblings/children
    'firebase': '@lib/firebase',
    'AudioService': '@lib/audio/AudioService',
    'PlatformService': '@lib/platform/PlatformService',
    'SecureStorage': '@lib/storage/SecureStorage',
    'BackupService': '@lib/storage/BackupService',
    'AdService': '@lib/ads/AdService',
    'ImageService': '@lib/image/ImageService',
    'io': '@lib/storage/io',

    // Hooks
    'hooks/useHaptics': '@lib/haptics/useHaptics',
    'hooks/usePlatform': '@lib/platform/usePlatform',
    'hooks/useKeepAwake': '@lib/platform/useKeepAwake',
    'hooks/useImmersiveMode': '@lib/platform/useImmersiveMode',
    'hooks/useNativeIntegration': '@lib/platform/useNativeIntegration',
    'hooks/useSafeAreaInsets': '@lib/platform/useSafeAreaInsets',
    'hooks/useAdFlow': '@lib/ads/useAdFlow',
    'hooks/useAdLifecycle': '@lib/ads/useAdLifecycle',
    'hooks/useServiceWorker': '@lib/pwa/useServiceWorker',
    'hooks/usePWAInstallPrompt': '@lib/pwa/usePWAInstallPrompt',
    'hooks/useOnlineStatus': '@lib/pwa/useOnlineStatus',
};

function main() {
    log('🔧', 'Fixing imports and residual file moves...');

    // 1. Move io.ts if it exists
    moveFile(
        path.join(SRC, 'services', 'io.ts'),
        path.join(SRC, 'lib', 'storage', 'io.ts')
    );

    // 2. Fix imports
    // Use recursive walk instead of git ls-files because files were moved without git mv
    function getAllFiles(dirPath, arrayOfFiles) {
        const files = fs.readdirSync(dirPath);
        arrayOfFiles = arrayOfFiles || [];

        files.forEach(function (file) {
            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            } else {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        });

        return arrayOfFiles;
    }

    const files = getAllFiles(SRC, []);
    // Filter for ts/tsx only
    const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

    let updatedCount = 0;

    tsFiles.forEach(fullPath => {
        const relPath = path.relative(ROOT, fullPath);
        let content = fs.readFileSync(fullPath, 'utf-8');
        let originalContent = content;

        // Apply mappings
        for (const [key, value] of Object.entries(mappings)) {
            // Regex matches: from '.../key' or from 'key'
            const regex = new RegExp(`from ['"](.*[\\/])?${key}['"]`, 'g');
            content = content.replace(regex, `from '${value}'`);
        }

        // Generic replacements for unmoved folders
        content = content.replace(/from ['"](\.\.\/)+contexts\/([^'"]+)['"]/g, "from '@contexts/$2'");
        content = content.replace(/from ['"](\.\.\/)+features\/([^'"]+)['"]/g, "from '@features/$2'");
        content = content.replace(/from ['"](.*[\\/])?components\/ui\/([^'"]+)['"]/g, "from '@ui/$2'");
        content = content.replace(/from ['"](\.\.\/)+hooks\/([^'"]+)['"]/g, "from '@hooks/$2'");
        content = content.replace(/from ['"](\.\.\/)+utils\/([^'"]+)['"]/g, "from '@/utils/$2'");
        content = content.replace(/from ['"](\.\.\/)+services\/([^'"]+)['"]/g, "from '@/services/$2'");

        // Fix components (Court, History, etc.)
        const componentFolders = ['Court', 'History', 'Fullscreen', 'Ads', 'Broadcast', 'Settings', 'Share', 'Social', 'TeamManager', 'containers', 'modals', 'tutorial'];
        componentFolders.forEach(folder => {
            const regex = new RegExp(`from ['"](\\.\\.\\/)+${folder}\\/([^'"]+)['"]`, 'g');
            content = content.replace(regex, `from '@/components/${folder}/$2'`);
        });

        // Root components that are often imported relatively
        const rootComps = ['MeasuredFullscreenHUD', 'HistoryBar', 'Controls', 'PlayerCard', 'ScoreCardFullscreen', 'ScoreCardNormal'];
        rootComps.forEach(comp => {
            const regex = new RegExp(`from ['"](\\.\\.\\/)+${comp}['"]`, 'g');
            content = content.replace(regex, `from '@/components/${comp}'`);
        });

        // Fix constants.ts import loop/incorrect path
        if (relPath.includes('config/constants.ts') || relPath.endsWith('constants.ts')) {
            content = content.replace(/from ['"]\.\/config\/gameModes['"]/g, "from './gameModes'");
            content = content.replace(/from ['"]\.\/types['"]/g, "from '@types'");
        }

        // Fix @types issues in general
        content = content.replace(/from ['"]\.\.\/types['"]/g, "from '@types'");
        content = content.replace(/from ['"]\.\/types['"]/g, "from '@types'");

        if (content !== originalContent) {
            fs.writeFileSync(fullPath, content, 'utf-8');
            updatedCount++;
        }
    });

    log('✅', `Updated imports in ${updatedCount} files.`);
}

main();

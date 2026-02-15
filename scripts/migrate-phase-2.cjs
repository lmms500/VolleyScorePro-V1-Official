#!/usr/bin/env node
/**
 * Migration Script - Phase 2: Peripheral Features
 *
 * Migrates Tutorial, Voice, Social, Settings, History, Ads features
 * to the new src/features/ structure.
 *
 * Usage:
 *   node scripts/migrate-phase-2.js [--dry-run]
 *
 * Options:
 *   --dry-run    Simulate migration without making changes
 *   --verbose    Show detailed logging
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// ============================================================================
// CONFIGURATION
// ============================================================================

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

const MIGRATION_MAP = {
  // Tutorial (22 files)
  tutorial: {
    components: [
      'components/tutorial/InteractiveGestureDemo.tsx',
      'components/tutorial/MotionScenes.tsx',
      'components/tutorial/TutorialVisuals.tsx',
    ],
    scenes: [
      'components/tutorial/scenes/BatchInputScene.tsx',
      'components/tutorial/scenes/DragDropScene.tsx',
      'components/tutorial/scenes/ExportScene.tsx',
      'components/tutorial/scenes/MomentumScene.tsx',
      'components/tutorial/scenes/PlayerStatsScene.tsx',
      'components/tutorial/scenes/RotationScene.tsx',
      'components/tutorial/scenes/ScoutModeScene.tsx',
      'components/tutorial/scenes/SettingsScene.tsx',
      'components/tutorial/scenes/SkillBalanceScene.tsx',
      'components/tutorial/scenes/SubstitutionScene.tsx',
      'components/tutorial/scenes/TeamCompositionScene.tsx',
      'components/tutorial/scenes/VoiceControlScene.tsx',
      'components/tutorial/scenes/index.ts',
      'components/tutorial/scenes/types.ts',
    ],
    visuals: [
      'components/tutorial/visuals/AppScenes.tsx',
      'components/tutorial/visuals/HistoryScenes.tsx',
      'components/tutorial/visuals/SystemScenes.tsx',
      'components/tutorial/visuals/TeamScenes.tsx',
      'components/tutorial/visuals/index.ts',
      'components/tutorial/visuals/types.ts',
    ],
    modals: [
      'components/modals/RichTutorialModal.tsx',
      'components/modals/TutorialModal.tsx',
    ],
    hooks: ['hooks/useTutorial.ts'],
    data: ['data/tutorialContent.ts'],
  },

  // Voice (7 files)
  voice: {
    hooks: ['hooks/useVoiceControl.ts'],
    modals: ['components/modals/VoiceCommandsModal.tsx'],
    services: [
      'services/VoiceRecognitionService.ts',
      'services/VoiceCommandParser.ts',
      'services/GeminiCommandService.ts',
      'services/TTSService.ts',
      'services/ai/schemas.ts',
    ],
  },

  // Social (4 files)
  social: {
    components: [
      'components/Social/GlobalLeaderboard.tsx',
      'components/Share/ResultCard.tsx',
    ],
    hooks: ['hooks/useSocialShare.ts'],
    services: ['services/SocialService.ts'],
  },

  // Settings (5 files)
  settings: {
    components: [
      'components/Settings/AppTab.tsx',
      'components/Settings/MatchTab.tsx',
      'components/Settings/SystemTab.tsx',
      'components/Settings/SettingsUI.tsx',
    ],
    modals: ['components/modals/SettingsModal.tsx'],
  },

  // History (10 files)
  history: {
    components: [
      'components/History/HistoryList.tsx',
      'components/History/MatchDetail.tsx',
      'components/History/MatchTimeline.tsx',
      'components/History/MomentumGraph.tsx',
      'components/History/ProAnalysis.tsx',
    ],
    modals: ['components/modals/HistoryModal.tsx'],
    store: ['stores/historyStore.ts'],
    services: ['services/AnalysisEngine.ts'],
    utils: ['utils/statsEngine.ts', 'utils/timelineGenerator.ts'],
  },

  // Ads (1 file)
  ads: {
    components: ['components/Ads/SmartBanner.tsx'],
  },
};

// Path alias mappings for import updates
const PATH_ALIASES = {
  '@types': './src/@types',
  '@ui': './src/ui',
  '@lib': './src/lib',
  '@features': './src/features',
  '@contexts': './src/contexts',
  '@layouts': './src/layouts',
  '@config': './src/config',
  '@hooks': './src/hooks',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Logs formatted message
 */
function log(message, type = 'info') {
  const prefix = {
    info: chalk.blue('ℹ'),
    success: chalk.green('✓'),
    warning: chalk.yellow('⚠'),
    error: chalk.red('✖'),
  }[type];
  console.log(`${prefix} ${message}`);
}

/**
 * Creates directory structure if it doesn't exist
 */
async function ensureDir(dirPath) {
  await fs.ensureDir(dirPath);
}

/**
 * Moves file from source to destination
 */
async function moveFile(sourcePath, destPath, dryRun = false) {
  const absSource = path.join(SRC_DIR, sourcePath);
  const absDest = path.join(SRC_DIR, destPath);

  if (!fs.existsSync(absSource)) {
    log(`Source file not found: ${sourcePath}`, 'warning');
    return false;
  }

  if (dryRun) {
    log(`[DRY RUN] Would move: ${sourcePath} → ${destPath}`, 'info');
    return true;
  }

  await ensureDir(path.dirname(absDest));
  await fs.move(absSource, absDest, { overwrite: false });
  log(`Moved: ${sourcePath} → ${destPath}`, 'success');
  return true;
}

/**
 * Updates import statements in a file
 */
async function updateImportsInFile(filePath, movedFiles, dryRun = false) {
  const absPath = path.join(SRC_DIR, filePath);

  if (!fs.existsSync(absPath)) {
    return;
  }

  let content = await fs.readFile(absPath, 'utf-8');
  let modified = false;

  // Update imports from moved files
  for (const [oldPath, newPath] of Object.entries(movedFiles)) {
    const oldImportRegex = new RegExp(
      `from ['"](\\.\\./)*${oldPath.replace(/\\/g, '/')}['"]`,
      'g'
    );

    if (oldImportRegex.test(content)) {
      // Calculate relative path from current file to new location
      const currentDir = path.dirname(filePath);
      const relativePath = calculateRelativePath(currentDir, newPath);

      content = content.replace(
        oldImportRegex,
        `from '${relativePath}'`
      );
      modified = true;
    }
  }

  if (modified) {
    if (dryRun) {
      log(`[DRY RUN] Would update imports in: ${filePath}`, 'info');
    } else {
      await fs.writeFile(absPath, content, 'utf-8');
      log(`Updated imports in: ${filePath}`, 'success');
    }
  }
}

/**
 * Calculates relative path between two files
 */
function calculateRelativePath(fromDir, toFile) {
  const relativePath = path.relative(fromDir, toFile);
  const normalized = relativePath.replace(/\\/g, '/');
  return normalized.startsWith('.') ? normalized : `./${normalized}`;
}

/**
 * Updates imports in moved files to use path aliases
 */
async function updateMovedFileImports(filePath, dryRun = false) {
  const absPath = path.join(SRC_DIR, filePath);

  if (!fs.existsSync(absPath)) {
    return;
  }

  let content = await fs.readFile(absPath, 'utf-8');
  let modified = false;

  // Replace deep relative imports with aliases
  const replacements = [
    // Types
    { from: /from ['"](\.\.\/)+(types|@types)(['"])/g, to: "from '@types$3" },
    // UI
    { from: /from ['"](\.\.\/)+(ui|components\/ui)\/(.+?)(['"])/g, to: "from '@ui/$3$4" },
    // Lib
    { from: /from ['"](\.\.\/)+(lib)\/(.+?)(['"])/g, to: "from '@lib/$3$4" },
    // Contexts
    { from: /from ['"](\.\.\/)+(contexts)\/(.+?)(['"])/g, to: "from '@contexts/$3$4" },
    // Layouts
    { from: /from ['"](\.\.\/)+(layouts)\/(.+?)(['"])/g, to: "from '@layouts/$3$4" },
    // Config
    { from: /from ['"](\.\.\/)+(config)\/(.+?)(['"])/g, to: "from '@config/$3$4" },
    // Global hooks
    { from: /from ['"](\.\.\/)+(hooks)\/usePerformanceMonitor(['"])/g, to: "from '@hooks/usePerformanceMonitor$3" },
  ];

  for (const { from, to } of replacements) {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  }

  if (modified) {
    if (dryRun) {
      log(`[DRY RUN] Would update path aliases in: ${filePath}`, 'info');
    } else {
      await fs.writeFile(absPath, content, 'utf-8');
      log(`Updated path aliases in: ${filePath}`, 'success');
    }
  }
}

/**
 * Finds all files that import from a given path
 */
function findFilesThatImport(targetPath) {
  const allFiles = glob.sync('**/*.{ts,tsx}', {
    cwd: SRC_DIR,
    ignore: ['node_modules/**', 'dist/**', 'build/**'],
  });

  const importers = [];
  const normalizedTarget = targetPath.replace(/\\/g, '/').replace(/\.(ts|tsx)$/, '');

  for (const file of allFiles) {
    const content = fs.readFileSync(path.join(SRC_DIR, file), 'utf-8');
    const importRegex = new RegExp(`from ['"].*${normalizedTarget}['"]`);

    if (importRegex.test(content)) {
      importers.push(file);
    }
  }

  return importers;
}

// ============================================================================
// MAIN MIGRATION LOGIC
// ============================================================================

async function migrateFeature(featureName, featureConfig, dryRun = false) {
  log(`\n📦 Migrating feature: ${featureName}`, 'info');

  const movedFiles = {};
  let totalFiles = 0;

  for (const [subdir, files] of Object.entries(featureConfig)) {
    for (const file of files) {
      const sourcePath = file;
      const fileName = path.basename(file);
      const destPath = `features/${featureName}/${subdir}/${fileName}`;

      const success = await moveFile(sourcePath, destPath, dryRun);
      if (success) {
        movedFiles[sourcePath] = destPath;
        totalFiles++;
      }
    }
  }

  log(`Moved ${totalFiles} files for ${featureName}`, 'success');

  // Update imports in moved files
  log(`\n🔗 Updating imports in moved files...`, 'info');
  for (const destPath of Object.values(movedFiles)) {
    await updateMovedFileImports(destPath, dryRun);
  }

  // Update imports in files that consume this feature
  log(`\n🔗 Updating imports in consumer files...`, 'info');
  const consumersToUpdate = new Set();

  for (const sourcePath of Object.keys(movedFiles)) {
    const importers = findFilesThatImport(sourcePath);
    importers.forEach(imp => consumersToUpdate.add(imp));
  }

  for (const consumer of consumersToUpdate) {
    await updateImportsInFile(consumer, movedFiles, dryRun);
  }

  log(`✓ Feature ${featureName} migration complete`, 'success');
}

async function cleanupEmptyDirectories(dryRun = false) {
  log(`\n🧹 Cleaning up empty directories...`, 'info');

  const dirsToCheck = [
    'components/tutorial',
    'components/modals',
    'components/Social',
    'components/Share',
    'components/Settings',
    'components/History',
    'components/Ads',
    'services/ai',
    'data',
  ];

  for (const dir of dirsToCheck) {
    const absDir = path.join(SRC_DIR, dir);

    if (fs.existsSync(absDir)) {
      const contents = fs.readdirSync(absDir);

      if (contents.length === 0) {
        if (dryRun) {
          log(`[DRY RUN] Would remove empty directory: ${dir}`, 'info');
        } else {
          fs.removeSync(absDir);
          log(`Removed empty directory: ${dir}`, 'success');
        }
      }
    }
  }
}

async function validateMigration() {
  log(`\n🔍 Validating migration...`, 'info');

  // Check if any source files still exist
  let orphanedFiles = 0;

  for (const [featureName, featureConfig] of Object.entries(MIGRATION_MAP)) {
    for (const files of Object.values(featureConfig)) {
      for (const file of files) {
        const absPath = path.join(SRC_DIR, file);
        if (fs.existsSync(absPath)) {
          log(`Orphaned file found: ${file}`, 'warning');
          orphanedFiles++;
        }
      }
    }
  }

  if (orphanedFiles === 0) {
    log(`✓ All files successfully migrated`, 'success');
  } else {
    log(`⚠ Found ${orphanedFiles} orphaned files`, 'warning');
  }

  // Check TypeScript compilation
  log(`\n📝 Running TypeScript check...`, 'info');
  const { execSync } = require('child_process');

  try {
    execSync('npx tsc --noEmit', { cwd: ROOT_DIR, stdio: 'inherit' });
    log(`✓ TypeScript check passed`, 'success');
  } catch (error) {
    log(`✖ TypeScript check failed`, 'error');
    process.exit(1);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  console.log(chalk.bold.cyan('\n🚀 VolleyScore Pro - Migration Phase 2'));
  console.log(chalk.gray('=========================================\n'));

  if (dryRun) {
    log('Running in DRY RUN mode - no files will be modified', 'warning');
  }

  // Migrate each feature
  for (const [featureName, featureConfig] of Object.entries(MIGRATION_MAP)) {
    await migrateFeature(featureName, featureConfig, dryRun);
  }

  // Cleanup empty directories
  await cleanupEmptyDirectories(dryRun);

  if (!dryRun) {
    // Validate migration
    await validateMigration();

    console.log(chalk.bold.green('\n✨ Migration Phase 2 Complete!\n'));
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.gray('  1. Run tests: npm test'));
    console.log(chalk.gray('  2. Start dev server: npm run dev'));
    console.log(chalk.gray('  3. Verify app functionality'));
    console.log(chalk.gray('  4. Commit changes: git add . && git commit -m "feat: migrate phase 2 features to new structure"\n'));
  } else {
    console.log(chalk.bold.yellow('\n✓ Dry run complete - no changes made\n'));
    console.log(chalk.gray('To execute migration, run: node scripts/migrate-phase-2.js\n'));
  }
}

// Run migration
main().catch(error => {
  console.error(chalk.red('\n✖ Migration failed:'), error);
  process.exit(1);
});

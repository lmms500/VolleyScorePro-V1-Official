#!/usr/bin/env node
/**
 * Migration Script - Phase 3: Core Features (Final)
 *
 * Migrates Teams, Court, Broadcast, Game features + PDFService
 * to the new src/features/ structure.
 *
 * Usage:
 *   node scripts/migrate-phase-3.cjs [--dry-run] [--verbose]
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

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose');

/**
 * Migration map: featureName -> { subdir: [relative paths from src/] }
 * Order matters: teams/court/broadcast first, game last.
 */
const MIGRATION_MAP = {
  // PDFService residual → history (1 file)
  history: {
    services: ['services/PDFService.ts'],
  },

  // Teams (19 files)
  teams: {
    components: [
      'components/PlayerCard.tsx',
      'components/TeamManager/AddPlayerForm.tsx',
      'components/TeamManager/BenchArea.tsx',
      'components/TeamManager/PlayerContextMenu.tsx',
      'components/TeamManager/PlayerListItem.tsx',
      'components/TeamManager/ProfileCard.tsx',
      'components/TeamManager/RosterBoard.tsx',
      'components/TeamManager/RosterColumn.tsx',
      'components/TeamManager/TeamColumn.tsx',
      'components/TeamManager/TeamManagerUI.tsx',
    ],
    modals: [
      'components/modals/TeamManagerModal.tsx',
      'components/modals/ProfileCreationModal.tsx',
      'components/modals/ProfileDetailsModal.tsx',
      'components/modals/SubstitutionModal.tsx',
      'components/modals/TeamStatsModal.tsx',
    ],
    hooks: [
      'hooks/useTeamGenerator.ts',
      'hooks/usePlayerProfiles.ts',
    ],
    store: ['stores/rosterStore.ts'],
    utils: ['utils/rosterLogic.ts'],
  },

  // Court (5 files)
  court: {
    components: [
      'components/Court/CourtLayout.tsx',
      'components/Court/VolleyballCourt.tsx',
      'components/Court/CourtHeader.tsx',
      'components/Court/CourtFooter.tsx',
    ],
    modals: ['components/modals/CourtModal.tsx'],
  },

  // Broadcast (13 files)
  broadcast: {
    screens: ['screens/BroadcastScreen.tsx'],
    components: [
      'components/Broadcast/BroadcastOverlay.tsx',
      'components/Broadcast/ObsScoreDisplay.tsx',
    ],
    modals: ['components/modals/LiveSyncModal.tsx'],
    hooks: [
      'hooks/useSpectatorSync.ts',
      'hooks/useSpectatorCount.ts',
      'hooks/useRemoteTimeoutSync.ts',
      'hooks/useTimeoutSync.ts',
      'hooks/useTimerSync.ts',
      'hooks/useSyncManager.ts',
    ],
    services: [
      'services/SyncEngine.ts',
      'services/SyncService.ts',
      'services/TimeoutSyncService.ts',
    ],
  },

  // Game - CORE (47 files) — LAST
  game: {
    screens: [
      'screens/GameScreen.tsx',
      'screens/index.ts',
    ],
    components: [
      'components/ScoreCardFullscreen.tsx',
      'components/ScoreCardNormal.tsx',
      'components/containers/ScoreCardContainer.tsx',
      'components/Controls.tsx',
      'components/HistoryBar.tsx',
      'components/MeasuredFullscreenHUD.tsx',
      'components/Fullscreen/FloatingControlBar.tsx',
      'components/Fullscreen/FloatingTopBar.tsx',
      'components/Fullscreen/FullscreenMenuDrawer.tsx',
      'components/Fullscreen/TimeoutOverlay.tsx',
    ],
    modals: [
      'components/modals/MatchOverModal.tsx',
      'components/modals/ScoutModal.tsx',
      'components/modals/ConfirmationModal.tsx',
      'components/modals/ModalManager.tsx',
    ],
    context: [
      'contexts/GameContext.tsx',
      'contexts/TimerContext.tsx',
      'contexts/TimeoutContext.tsx',
    ],
    hooks: [
      'hooks/useVolleyGame.ts',
      'hooks/useGameState.ts',
      'hooks/useGameActions.ts',
      'hooks/useGameHandlers.ts',
      'hooks/useGamePersistence.ts',
      'hooks/useGameAudio.ts',
      'hooks/useScoreCardLogic.ts',
      'hooks/useScoreGestures.ts',
      'hooks/useScoreAnnouncer.ts',
      'hooks/useSensoryFX.ts',
      'hooks/useMatchLifecycle.ts',
      'hooks/useMatchSaver.ts',
      'hooks/useHorizontalPages.ts',
      'hooks/useHudMeasure.ts',
      'hooks/useCollider.ts',
      'hooks/useActiveTimeout.ts',
      'hooks/useTimeoutManager.ts',
      'hooks/useDynamicColorStyle.ts',
      'hooks/useAdaptiveAnimation.ts',
      'hooks/useElementSize.ts',
      'hooks/useCombinedGameState.ts',
    ],
    reducers: [
      'reducers/gameReducer.ts',
      'reducers/meta.ts',
      'reducers/roster.ts',
      'reducers/scoring.ts',
    ],
    'reducers/__tests__': [
      'reducers/__tests__/ghost_teams_repro.test.ts',
    ],
    utils: [
      'utils/gameLogic.ts',
      'utils/balanceUtils.ts',
    ],
  },
};

/**
 * Re-export stubs to create at old paths for backward compatibility.
 * These prevent breakage from imports not caught by the regex updater.
 * Key = old path (relative to src/), Value = content of re-export file.
 */
const RE_EXPORTS = {
  'contexts/GameContext.tsx': `// Re-export temporário — remover após validação completa
export { GameProvider, useGame, useActions, useScore, useRoster } from '@features/game/context/GameContext';
`,
  'contexts/TimerContext.tsx': `// Re-export temporário — remover após validação completa
export { TimerProvider, useTimer } from '@features/game/context/TimerContext';
`,
  'contexts/TimeoutContext.tsx': `// Re-export temporário — remover após validação completa
export { TimeoutProvider, useTimeoutContext } from '@features/game/context/TimeoutContext';
`,
};

/**
 * Master import replacement map.
 * Applied globally to ALL .ts/.tsx files after physical moves.
 * Key = regex-safe old import path segment, Value = new alias path.
 *
 * Order matters: more specific patterns first.
 */
const IMPORT_REPLACEMENTS = [
  // ── Game Contexts (CRITICAL — highest import count) ──
  { pattern: /from ['"](\.\.\/)*(contexts\/GameContext|\.\/GameContext)['"](?!.*re-export)/g, replacement: "from '@features/game/context/GameContext'" },
  { pattern: /from ['"](\.\.\/)*(contexts\/TimerContext|\.\/TimerContext)['"](?!.*re-export)/g, replacement: "from '@features/game/context/TimerContext'" },
  { pattern: /from ['"](\.\.\/)*(contexts\/TimeoutContext|\.\/TimeoutContext)['"](?!.*re-export)/g, replacement: "from '@features/game/context/TimeoutContext'" },

  // ── Game Reducers ──
  { pattern: /from ['"](\.\.\/)*reducers\/gameReducer['"]/g, replacement: "from '@features/game/reducers/gameReducer'" },
  { pattern: /from ['"](\.\.\/)*reducers\/meta['"]/g, replacement: "from '@features/game/reducers/meta'" },
  { pattern: /from ['"](\.\.\/)*reducers\/roster['"]/g, replacement: "from '@features/game/reducers/roster'" },
  { pattern: /from ['"](\.\.\/)*reducers\/scoring['"]/g, replacement: "from '@features/game/reducers/scoring'" },

  // ── Game Screens ──
  { pattern: /from ['"](\.\.\/)*screens\/GameScreen['"]/g, replacement: "from '@features/game/screens/GameScreen'" },
  { pattern: /from ['"](\.\.\/)*screens\/index['"]/g, replacement: "from '@features/game/screens/index'" },
  { pattern: /from ['"](\.\.\/)*screens['"](?!\/)/g, replacement: "from '@features/game/screens'" },

  // ── Game Hooks ──
  { pattern: /from ['"](\.\.\/)*hooks\/useVolleyGame['"]/g, replacement: "from '@features/game/hooks/useVolleyGame'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useGameState['"]/g, replacement: "from '@features/game/hooks/useGameState'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useGameActions['"]/g, replacement: "from '@features/game/hooks/useGameActions'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useGameHandlers['"]/g, replacement: "from '@features/game/hooks/useGameHandlers'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useGamePersistence['"]/g, replacement: "from '@features/game/hooks/useGamePersistence'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useGameAudio['"]/g, replacement: "from '@features/game/hooks/useGameAudio'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useScoreCardLogic['"]/g, replacement: "from '@features/game/hooks/useScoreCardLogic'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useScoreGestures['"]/g, replacement: "from '@features/game/hooks/useScoreGestures'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useScoreAnnouncer['"]/g, replacement: "from '@features/game/hooks/useScoreAnnouncer'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useSensoryFX['"]/g, replacement: "from '@features/game/hooks/useSensoryFX'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useMatchLifecycle['"]/g, replacement: "from '@features/game/hooks/useMatchLifecycle'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useMatchSaver['"]/g, replacement: "from '@features/game/hooks/useMatchSaver'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useHorizontalPages['"]/g, replacement: "from '@features/game/hooks/useHorizontalPages'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useHudMeasure['"]/g, replacement: "from '@features/game/hooks/useHudMeasure'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useCollider['"]/g, replacement: "from '@features/game/hooks/useCollider'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useActiveTimeout['"]/g, replacement: "from '@features/game/hooks/useActiveTimeout'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useTimeoutManager['"]/g, replacement: "from '@features/game/hooks/useTimeoutManager'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useDynamicColorStyle['"]/g, replacement: "from '@features/game/hooks/useDynamicColorStyle'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useAdaptiveAnimation['"]/g, replacement: "from '@features/game/hooks/useAdaptiveAnimation'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useElementSize['"]/g, replacement: "from '@features/game/hooks/useElementSize'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useCombinedGameState['"]/g, replacement: "from '@features/game/hooks/useCombinedGameState'" },

  // ── Game Utils ──
  { pattern: /from ['"](\.\.\/)*utils\/gameLogic['"]/g, replacement: "from '@features/game/utils/gameLogic'" },
  { pattern: /from ['"](\.\.\/)*utils\/balanceUtils['"]/g, replacement: "from '@features/game/utils/balanceUtils'" },

  // ── Game Components (root-level) ──
  { pattern: /from ['"](\.\.\/)*components\/ScoreCardFullscreen['"]/g, replacement: "from '@features/game/components/ScoreCardFullscreen'" },
  { pattern: /from ['"](\.\.\/)*components\/ScoreCardNormal['"]/g, replacement: "from '@features/game/components/ScoreCardNormal'" },
  { pattern: /from ['"](\.\.\/)*components\/Controls['"]/g, replacement: "from '@features/game/components/Controls'" },
  { pattern: /from ['"](\.\.\/)*components\/HistoryBar['"]/g, replacement: "from '@features/game/components/HistoryBar'" },
  { pattern: /from ['"](\.\.\/)*components\/MeasuredFullscreenHUD['"]/g, replacement: "from '@features/game/components/MeasuredFullscreenHUD'" },
  { pattern: /from ['"](\.\.\/)*components\/PlayerCard['"]/g, replacement: "from '@features/teams/components/PlayerCard'" },
  { pattern: /from ['"](\.\.\/)*components\/containers\/ScoreCardContainer['"]/g, replacement: "from '@features/game/components/ScoreCardContainer'" },

  // ── Game Fullscreen Components ──
  { pattern: /from ['"](\.\.\/)*components\/Fullscreen\/FloatingControlBar['"]/g, replacement: "from '@features/game/components/FloatingControlBar'" },
  { pattern: /from ['"](\.\.\/)*components\/Fullscreen\/FloatingTopBar['"]/g, replacement: "from '@features/game/components/FloatingTopBar'" },
  { pattern: /from ['"](\.\.\/)*components\/Fullscreen\/FullscreenMenuDrawer['"]/g, replacement: "from '@features/game/components/FullscreenMenuDrawer'" },
  { pattern: /from ['"](\.\.\/)*components\/Fullscreen\/TimeoutOverlay['"]/g, replacement: "from '@features/game/components/TimeoutOverlay'" },
  // Relative shorthand (from within Fullscreen/)
  { pattern: /from ['"]\.\/FloatingControlBar['"]/g, replacement: "from '@features/game/components/FloatingControlBar'" },
  { pattern: /from ['"]\.\/FloatingTopBar['"]/g, replacement: "from '@features/game/components/FloatingTopBar'" },
  { pattern: /from ['"]\.\/FullscreenMenuDrawer['"]/g, replacement: "from '@features/game/components/FullscreenMenuDrawer'" },
  { pattern: /from ['"]\.\/TimeoutOverlay['"]/g, replacement: "from '@features/game/components/TimeoutOverlay'" },

  // ── Game Modals ──
  { pattern: /from ['"](\.\.\/)*components\/modals\/MatchOverModal['"]/g, replacement: "from '@features/game/modals/MatchOverModal'" },
  { pattern: /from ['"](\.\.\/)*components\/modals\/ScoutModal['"]/g, replacement: "from '@features/game/modals/ScoutModal'" },
  { pattern: /from ['"](\.\.\/)*components\/modals\/ConfirmationModal['"]/g, replacement: "from '@features/game/modals/ConfirmationModal'" },
  { pattern: /from ['"](\.\.\/)*components\/modals\/ModalManager['"]/g, replacement: "from '@features/game/modals/ModalManager'" },

  // ── Teams Components ──
  { pattern: /from ['"](\.\.\/)*components\/TeamManager\/(\w+)['"]/g, replacement: "from '@features/teams/components/$2'" },
  // Relative shorthand (from within TeamManager/)
  { pattern: /from ['"]\.\/AddPlayerForm['"]/g, replacement: "from '@features/teams/components/AddPlayerForm'" },
  { pattern: /from ['"]\.\/BenchArea['"]/g, replacement: "from '@features/teams/components/BenchArea'" },
  { pattern: /from ['"]\.\/PlayerContextMenu['"]/g, replacement: "from '@features/teams/components/PlayerContextMenu'" },
  { pattern: /from ['"]\.\/PlayerListItem['"]/g, replacement: "from '@features/teams/components/PlayerListItem'" },
  { pattern: /from ['"]\.\/ProfileCard['"]/g, replacement: "from '@features/teams/components/ProfileCard'" },
  { pattern: /from ['"]\.\/RosterBoard['"]/g, replacement: "from '@features/teams/components/RosterBoard'" },
  { pattern: /from ['"]\.\/RosterColumn['"]/g, replacement: "from '@features/teams/components/RosterColumn'" },
  { pattern: /from ['"]\.\/TeamColumn['"]/g, replacement: "from '@features/teams/components/TeamColumn'" },
  { pattern: /from ['"]\.\/TeamManagerUI['"]/g, replacement: "from '@features/teams/components/TeamManagerUI'" },

  // ── Teams Modals ──
  { pattern: /from ['"](\.\.\/)*components\/modals\/TeamManagerModal['"]/g, replacement: "from '@features/teams/modals/TeamManagerModal'" },
  { pattern: /from ['"](\.\.\/)*components\/modals\/ProfileCreationModal['"]/g, replacement: "from '@features/teams/modals/ProfileCreationModal'" },
  { pattern: /from ['"](\.\.\/)*components\/modals\/ProfileDetailsModal['"]/g, replacement: "from '@features/teams/modals/ProfileDetailsModal'" },
  { pattern: /from ['"](\.\.\/)*components\/modals\/SubstitutionModal['"]/g, replacement: "from '@features/teams/modals/SubstitutionModal'" },
  { pattern: /from ['"](\.\.\/)*components\/modals\/TeamStatsModal['"]/g, replacement: "from '@features/teams/modals/TeamStatsModal'" },

  // ── Teams Hooks ──
  { pattern: /from ['"](\.\.\/)*hooks\/useTeamGenerator['"]/g, replacement: "from '@features/teams/hooks/useTeamGenerator'" },
  { pattern: /from ['"](\.\.\/)*hooks\/usePlayerProfiles['"]/g, replacement: "from '@features/teams/hooks/usePlayerProfiles'" },

  // ── Teams Store ──
  { pattern: /from ['"](\.\.\/)*stores\/rosterStore['"]/g, replacement: "from '@features/teams/store/rosterStore'" },

  // ── Teams Utils ──
  { pattern: /from ['"](\.\.\/)*utils\/rosterLogic['"]/g, replacement: "from '@features/teams/utils/rosterLogic'" },

  // ── Court Components ──
  { pattern: /from ['"](\.\.\/)*components\/Court\/(\w+)['"]/g, replacement: "from '@features/court/components/$2'" },
  // Relative shorthand (from within Court/)
  { pattern: /from ['"]\.\/CourtLayout['"]/g, replacement: "from '@features/court/components/CourtLayout'" },
  { pattern: /from ['"]\.\/VolleyballCourt['"]/g, replacement: "from '@features/court/components/VolleyballCourt'" },
  { pattern: /from ['"]\.\/CourtHeader['"]/g, replacement: "from '@features/court/components/CourtHeader'" },
  { pattern: /from ['"]\.\/CourtFooter['"]/g, replacement: "from '@features/court/components/CourtFooter'" },

  // ── Court Modals ──
  { pattern: /from ['"](\.\.\/)*components\/modals\/CourtModal['"]/g, replacement: "from '@features/court/modals/CourtModal'" },

  // ── Broadcast Screen ──
  { pattern: /from ['"](\.\.\/)*screens\/BroadcastScreen['"]/g, replacement: "from '@features/broadcast/screens/BroadcastScreen'" },

  // ── Broadcast Components ──
  { pattern: /from ['"](\.\.\/)*components\/Broadcast\/(\w+)['"]/g, replacement: "from '@features/broadcast/components/$2'" },
  { pattern: /from ['"]\.\/BroadcastOverlay['"]/g, replacement: "from '@features/broadcast/components/BroadcastOverlay'" },
  { pattern: /from ['"]\.\/ObsScoreDisplay['"]/g, replacement: "from '@features/broadcast/components/ObsScoreDisplay'" },

  // ── Broadcast Modals ──
  { pattern: /from ['"](\.\.\/)*components\/modals\/LiveSyncModal['"]/g, replacement: "from '@features/broadcast/modals/LiveSyncModal'" },

  // ── Broadcast Hooks ──
  { pattern: /from ['"](\.\.\/)*hooks\/useSpectatorSync['"]/g, replacement: "from '@features/broadcast/hooks/useSpectatorSync'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useSpectatorCount['"]/g, replacement: "from '@features/broadcast/hooks/useSpectatorCount'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useRemoteTimeoutSync['"]/g, replacement: "from '@features/broadcast/hooks/useRemoteTimeoutSync'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useTimeoutSync['"]/g, replacement: "from '@features/broadcast/hooks/useTimeoutSync'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useTimerSync['"]/g, replacement: "from '@features/broadcast/hooks/useTimerSync'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useSyncManager['"]/g, replacement: "from '@features/broadcast/hooks/useSyncManager'" },

  // ── Broadcast Services ──
  { pattern: /from ['"](\.\.\/)*services\/SyncEngine['"]/g, replacement: "from '@features/broadcast/services/SyncEngine'" },
  { pattern: /from ['"](\.\.\/)*services\/SyncService['"]/g, replacement: "from '@features/broadcast/services/SyncService'" },
  { pattern: /from ['"](\.\.\/)*services\/TimeoutSyncService['"]/g, replacement: "from '@features/broadcast/services/TimeoutSyncService'" },

  // ── History Service (PDFService residual) ──
  { pattern: /from ['"](\.\.\/)*services\/PDFService['"]/g, replacement: "from '@features/history/services/PDFService'" },

  // ── Catch-all: remaining relative ../components/modals/ imports ──
  { pattern: /from ['"](\.\.\/)+modals\/(\w+)['"]/g, replacement: "from '@/components/modals/$2'" },

  // ── Catch-all: convert remaining deep relative imports to aliases ──
  { pattern: /from ['"](\.\.\/){3,}contexts\/(\w+)['"]/g, replacement: "from '@contexts/$2'" },
  { pattern: /from ['"](\.\.\/){3,}hooks\/(\w+)['"]/g, replacement: "from '@hooks/$2'" },
  { pattern: /from ['"](\.\.\/){3,}features\/(\S+?)['"]/g, replacement: "from '@features/$2'" },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(message, type = 'info') {
  const prefix = {
    info: chalk.blue('ℹ'),
    success: chalk.green('✓'),
    warning: chalk.yellow('⚠'),
    error: chalk.red('✖'),
    section: chalk.cyan('▸'),
  }[type] || chalk.blue('ℹ');
  console.log(`${prefix} ${message}`);
}

function logVerbose(message) {
  if (VERBOSE) {
    console.log(chalk.gray(`  ${message}`));
  }
}

/**
 * Moves file from source to destination (paths relative to SRC_DIR)
 */
async function moveFile(sourcePath, destPath) {
  const absSource = path.join(SRC_DIR, sourcePath);
  const absDest = path.join(SRC_DIR, destPath);

  if (!fs.existsSync(absSource)) {
    log(`Source not found (skipping): ${sourcePath}`, 'warning');
    return false;
  }

  if (DRY_RUN) {
    log(`[DRY RUN] Would move: ${sourcePath} → ${destPath}`, 'info');
    return true;
  }

  try {
    await fs.ensureDir(path.dirname(absDest));
    await fs.move(absSource, absDest, { overwrite: false });
    logVerbose(`Moved: ${sourcePath} → ${destPath}`);
    return true;
  } catch (err) {
    log(`Error moving ${sourcePath}: ${err.message}`, 'error');
    if (VERBOSE) console.error(err);
    return false;
  }
}

/**
 * Gets all .ts/.tsx files in src/ recursively
 */
function getAllTsFiles() {
  return glob.sync('**/*.{ts,tsx}', {
    cwd: SRC_DIR,
    ignore: ['node_modules/**', 'dist/**', 'build/**'],
    absolute: false,
  });
}

/**
 * Applies IMPORT_REPLACEMENTS to a single file
 */
async function updateImportsInFile(filePath) {
  const absPath = path.join(SRC_DIR, filePath);
  if (!fs.existsSync(absPath)) return false;

  let content = await fs.readFile(absPath, 'utf-8');
  const original = content;

  for (const { pattern, replacement } of IMPORT_REPLACEMENTS) {
    // Reset regex lastIndex (important for /g regexes)
    pattern.lastIndex = 0;
    content = content.replace(pattern, replacement);
  }

  if (content !== original) {
    if (DRY_RUN) {
      logVerbose(`[DRY RUN] Would update imports in: ${filePath}`);
    } else {
      await fs.writeFile(absPath, content, 'utf-8');
      logVerbose(`Updated imports: ${filePath}`);
    }
    return true;
  }
  return false;
}

/**
 * Creates re-export stub files at old context paths
 */
async function createReExports() {
  log('\nCreating re-export stubs for backward compatibility...', 'section');

  for (const [relativePath, content] of Object.entries(RE_EXPORTS)) {
    const absPath = path.join(SRC_DIR, relativePath);

    // Only create if the original was already moved (i.e., doesn't exist)
    if (fs.existsSync(absPath)) {
      log(`Re-export skipped (original still exists): ${relativePath}`, 'warning');
      continue;
    }

    if (DRY_RUN) {
      log(`[DRY RUN] Would create re-export: ${relativePath}`, 'info');
      continue;
    }

    await fs.ensureDir(path.dirname(absPath));
    await fs.writeFile(absPath, content, 'utf-8');
    log(`Created re-export: ${relativePath}`, 'success');
  }
}

/**
 * Cleans up empty directories after migration
 */
async function cleanupEmptyDirectories() {
  log('\nCleaning up empty directories...', 'section');

  const dirsToCheck = [
    // Leaf directories first (deepest first)
    'components/TeamManager',
    'components/Court',
    'components/Broadcast',
    'components/Fullscreen',
    'components/containers',
    'components/modals',
    'components',
    'reducers/__tests__',
    'reducers',
    'stores',
    'services',
    'utils',
    'screens',
  ];

  for (const dir of dirsToCheck) {
    const absDir = path.join(SRC_DIR, dir);

    if (!fs.existsSync(absDir)) continue;

    try {
      const contents = fs.readdirSync(absDir);
      // Filter out .DS_Store and similar
      const meaningful = contents.filter(f => !f.startsWith('.'));

      if (meaningful.length === 0) {
        if (DRY_RUN) {
          log(`[DRY RUN] Would remove empty directory: ${dir}/`, 'info');
        } else {
          fs.removeSync(absDir);
          log(`Removed empty directory: ${dir}/`, 'success');
        }
      } else {
        log(`Directory not empty (${meaningful.length} files remain): ${dir}/`, 'warning');
        if (VERBOSE) {
          meaningful.forEach(f => logVerbose(`  └─ ${f}`));
        }
      }
    } catch (err) {
      log(`Error checking directory ${dir}: ${err.message}`, 'error');
    }
  }
}

// ============================================================================
// MAIN MIGRATION LOGIC
// ============================================================================

async function migrateFeature(featureName, featureConfig) {
  console.log(chalk.bold.cyan(`\n📦 Migrating feature: ${featureName}`));

  let movedCount = 0;
  let skippedCount = 0;

  for (const [subdir, files] of Object.entries(featureConfig)) {
    for (const file of files) {
      const fileName = path.basename(file);
      // Handle nested subdirs like 'reducers/__tests__'
      const destPath = `features/${featureName}/${subdir}/${fileName}`;

      const success = await moveFile(file, destPath);
      if (success) {
        movedCount++;
      } else {
        skippedCount++;
      }
    }
  }

  log(`${featureName}: ${movedCount} moved, ${skippedCount} skipped`, 'success');
  return movedCount;
}

async function updateAllImports() {
  console.log(chalk.bold.cyan('\n🔗 Updating imports globally...'));

  const allFiles = getAllTsFiles();
  let updatedCount = 0;

  for (const file of allFiles) {
    const updated = await updateImportsInFile(file);
    if (updated) updatedCount++;
  }

  log(`Updated imports in ${updatedCount}/${allFiles.length} files`, 'success');
}

async function validateMigration() {
  console.log(chalk.bold.cyan('\n🔍 Validating migration...'));

  // 1. Check for orphaned source files
  let orphanedCount = 0;
  for (const [featureName, featureConfig] of Object.entries(MIGRATION_MAP)) {
    for (const files of Object.values(featureConfig)) {
      for (const file of files) {
        const absPath = path.join(SRC_DIR, file);
        if (fs.existsSync(absPath)) {
          log(`Orphaned file: ${file}`, 'warning');
          orphanedCount++;
        }
      }
    }
  }

  if (orphanedCount === 0) {
    log('All source files successfully moved', 'success');
  } else {
    log(`${orphanedCount} orphaned files found`, 'warning');
  }

  // 2. Check that destination files exist
  let missingCount = 0;
  for (const [featureName, featureConfig] of Object.entries(MIGRATION_MAP)) {
    for (const [subdir, files] of Object.entries(featureConfig)) {
      for (const file of files) {
        const fileName = path.basename(file);
        const destPath = path.join(SRC_DIR, 'features', featureName, subdir, fileName);
        if (!fs.existsSync(destPath)) {
          log(`Missing destination: features/${featureName}/${subdir}/${fileName}`, 'error');
          missingCount++;
        }
      }
    }
  }

  if (missingCount === 0) {
    log('All destination files verified', 'success');
  } else {
    log(`${missingCount} destination files missing`, 'error');
  }

  // 3. TypeScript compilation check
  log('\nRunning TypeScript check...', 'section');
  const { execSync } = require('child_process');

  try {
    execSync('npx tsc --noEmit 2>&1', {
      cwd: ROOT_DIR,
      stdio: 'pipe',
      timeout: 60000,
    });
    log('TypeScript compilation passed', 'success');
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : '';
    const errorLines = output.split('\n').filter(l => l.includes('error TS'));
    log(`TypeScript compilation failed (${errorLines.length} errors)`, 'error');

    // Show first 20 errors
    errorLines.slice(0, 20).forEach(line => {
      console.log(chalk.red(`  ${line.trim()}`));
    });

    if (errorLines.length > 20) {
      console.log(chalk.red(`  ... and ${errorLines.length - 20} more errors`));
    }

    return false;
  }

  return true;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log(chalk.bold.cyan('\n🚀 VolleyScore Pro - Migration Phase 3 (Final)'));
  console.log(chalk.gray('================================================='));
  console.log(chalk.gray(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`));
  console.log(chalk.gray(`Verbose: ${VERBOSE ? 'ON' : 'OFF'}\n`));

  if (DRY_RUN) {
    log('DRY RUN mode — no files will be modified\n', 'warning');
  }

  // ── Step 1: Move files per feature ──
  let totalMoved = 0;
  for (const [featureName, featureConfig] of Object.entries(MIGRATION_MAP)) {
    totalMoved += await migrateFeature(featureName, featureConfig);
  }
  console.log(chalk.bold.green(`\n✓ Phase 3 file moves: ${totalMoved} files`));

  // ── Step 2: Create re-export stubs ──
  await createReExports();

  // ── Step 3: Update ALL imports globally ──
  await updateAllImports();

  // ── Step 4: Cleanup empty directories ──
  await cleanupEmptyDirectories();

  // ── Step 5: Validate (skip in dry-run) ──
  if (!DRY_RUN) {
    const valid = await validateMigration();

    if (valid) {
      console.log(chalk.bold.green('\n✨ Migration Phase 3 Complete!\n'));
    } else {
      console.log(chalk.bold.red('\n⚠ Migration completed with errors. Review above.\n'));
    }

    console.log(chalk.gray('Next steps:'));
    console.log(chalk.gray('  1. Review re-export stubs in src/contexts/ (temporary)'));
    console.log(chalk.gray('  2. Run: npm run dev'));
    console.log(chalk.gray('  3. Test all features manually'));
    console.log(chalk.gray('  4. Run: npm run build'));
    console.log(chalk.gray('  5. Commit: git add . && git commit -m "feat: migrate phase 3 core features"'));
    console.log(chalk.gray('  6. Plan cleanup: remove re-export stubs after full validation\n'));
  } else {
    console.log(chalk.bold.yellow('\n✓ Dry run complete — no changes made'));
    console.log(chalk.gray('Run without --dry-run to execute migration\n'));
  }
}

main().catch(error => {
  console.error(chalk.red('\n✖ Migration failed:'), error);
  process.exit(1);
});

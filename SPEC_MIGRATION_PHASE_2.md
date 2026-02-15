# SPEC - Migração Fase 2: Features Periféricas

> **Projeto:** VolleyScore Pro
> **Fase:** 2 de 13
> **Data:** 2026-02-15
> **Autor:** DevOps Engineer
> **Status:** ESPECIFICAÇÃO

---

## 1. Contexto e Objetivo

### 1.1 Pré-requisitos
- ✅ **Fase 0 concluída:** Path aliases configurados em `tsconfig.json` e `vite.config.ts`
- ✅ **Fase 1 concluída:** `@types` e `@config` migrados e funcionais
- ✅ **Repositório limpo:** Sem modificações pendentes (git status clean)

### 1.2 Objetivo da Fase 2
Migrar as **features periféricas** (baixo acoplamento, baixo risco) para a estrutura `src/features/`, organizando-as por domínio funcional:

- **Tutorial:** Onboarding e tutoriais interativos
- **Voice:** Controle por voz e integração com IA (Gemini)
- **Social:** Compartilhamento social e leaderboards
- **Settings:** Configurações da aplicação
- **History:** Histórico de partidas e análises
- **Ads:** Sistema de publicidade (SmartBanner)

### 1.3 Critérios de Sucesso
- ✅ Todos os arquivos movidos para estrutura de features
- ✅ Zero erros de compilação TypeScript
- ✅ Zero erros de build do Vite
- ✅ Todos os imports atualizados (arquivos movidos + consumidores)
- ✅ Aplicação roda sem erros de runtime
- ✅ Git commit limpo com mensagem descritiva

---

## 2. Inventário de Migração

### 2.1 Feature: Tutorial (22 arquivos)

#### 2.1.1 Componentes
| Origem | Destino |
|--------|---------|
| `src/components/tutorial/InteractiveGestureDemo.tsx` | `src/features/tutorial/components/InteractiveGestureDemo.tsx` |
| `src/components/tutorial/MotionScenes.tsx` | `src/features/tutorial/components/MotionScenes.tsx` |
| `src/components/tutorial/TutorialVisuals.tsx` | `src/features/tutorial/components/TutorialVisuals.tsx` |

#### 2.1.2 Scenes (13 arquivos)
| Origem | Destino |
|--------|---------|
| `src/components/tutorial/scenes/BatchInputScene.tsx` | `src/features/tutorial/scenes/BatchInputScene.tsx` |
| `src/components/tutorial/scenes/DragDropScene.tsx` | `src/features/tutorial/scenes/DragDropScene.tsx` |
| `src/components/tutorial/scenes/ExportScene.tsx` | `src/features/tutorial/scenes/ExportScene.tsx` |
| `src/components/tutorial/scenes/MomentumScene.tsx` | `src/features/tutorial/scenes/MomentumScene.tsx` |
| `src/components/tutorial/scenes/PlayerStatsScene.tsx` | `src/features/tutorial/scenes/PlayerStatsScene.tsx` |
| `src/components/tutorial/scenes/RotationScene.tsx` | `src/features/tutorial/scenes/RotationScene.tsx` |
| `src/components/tutorial/scenes/ScoutModeScene.tsx` | `src/features/tutorial/scenes/ScoutModeScene.tsx` |
| `src/components/tutorial/scenes/SettingsScene.tsx` | `src/features/tutorial/scenes/SettingsScene.tsx` |
| `src/components/tutorial/scenes/SkillBalanceScene.tsx` | `src/features/tutorial/scenes/SkillBalanceScene.tsx` |
| `src/components/tutorial/scenes/SubstitutionScene.tsx` | `src/features/tutorial/scenes/SubstitutionScene.tsx` |
| `src/components/tutorial/scenes/TeamCompositionScene.tsx` | `src/features/tutorial/scenes/TeamCompositionScene.tsx` |
| `src/components/tutorial/scenes/VoiceControlScene.tsx` | `src/features/tutorial/scenes/VoiceControlScene.tsx` |
| `src/components/tutorial/scenes/index.ts` | `src/features/tutorial/scenes/index.ts` |
| `src/components/tutorial/scenes/types.ts` | `src/features/tutorial/scenes/types.ts` |

#### 2.1.3 Visuals (6 arquivos)
| Origem | Destino |
|--------|---------|
| `src/components/tutorial/visuals/AppScenes.tsx` | `src/features/tutorial/visuals/AppScenes.tsx` |
| `src/components/tutorial/visuals/HistoryScenes.tsx` | `src/features/tutorial/visuals/HistoryScenes.tsx` |
| `src/components/tutorial/visuals/SystemScenes.tsx` | `src/features/tutorial/visuals/SystemScenes.tsx` |
| `src/components/tutorial/visuals/TeamScenes.tsx` | `src/features/tutorial/visuals/TeamScenes.tsx` |
| `src/components/tutorial/visuals/index.ts` | `src/features/tutorial/visuals/index.ts` |
| `src/components/tutorial/visuals/types.ts` | `src/features/tutorial/visuals/types.ts` |

#### 2.1.4 Modals, Hooks, Data
| Origem | Destino |
|--------|---------|
| `src/components/modals/RichTutorialModal.tsx` | `src/features/tutorial/modals/RichTutorialModal.tsx` |
| `src/components/modals/TutorialModal.tsx` | `src/features/tutorial/modals/TutorialModal.tsx` |
| `src/hooks/useTutorial.ts` | `src/features/tutorial/hooks/useTutorial.ts` |
| `src/data/tutorialContent.ts` | `src/features/tutorial/data/tutorialContent.ts` |

---

### 2.2 Feature: Voice (7 arquivos)

| Origem | Destino |
|--------|---------|
| `src/hooks/useVoiceControl.ts` | `src/features/voice/hooks/useVoiceControl.ts` |
| `src/components/modals/VoiceCommandsModal.tsx` | `src/features/voice/modals/VoiceCommandsModal.tsx` |
| `src/services/VoiceRecognitionService.ts` | `src/features/voice/services/VoiceRecognitionService.ts` |
| `src/services/VoiceCommandParser.ts` | `src/features/voice/services/VoiceCommandParser.ts` |
| `src/services/GeminiCommandService.ts` | `src/features/voice/services/GeminiCommandService.ts` |
| `src/services/TTSService.ts` | `src/features/voice/services/TTSService.ts` |
| `src/services/ai/schemas.ts` | `src/features/voice/services/ai/schemas.ts` |

---

### 2.3 Feature: Social (4 arquivos)

| Origem | Destino |
|--------|---------|
| `src/components/Social/GlobalLeaderboard.tsx` | `src/features/social/components/GlobalLeaderboard.tsx` |
| `src/components/Share/ResultCard.tsx` | `src/features/social/components/ResultCard.tsx` |
| `src/hooks/useSocialShare.ts` | `src/features/social/hooks/useSocialShare.ts` |
| `src/services/SocialService.ts` | `src/features/social/services/SocialService.ts` |

---

### 2.4 Feature: Settings (5 arquivos)

| Origem | Destino |
|--------|---------|
| `src/components/Settings/AppTab.tsx` | `src/features/settings/components/AppTab.tsx` |
| `src/components/Settings/MatchTab.tsx` | `src/features/settings/components/MatchTab.tsx` |
| `src/components/Settings/SystemTab.tsx` | `src/features/settings/components/SystemTab.tsx` |
| `src/components/Settings/SettingsUI.tsx` | `src/features/settings/components/SettingsUI.tsx` |
| `src/components/modals/SettingsModal.tsx` | `src/features/settings/modals/SettingsModal.tsx` |

---

### 2.5 Feature: History (10 arquivos)

| Origem | Destino |
|--------|---------|
| `src/components/History/HistoryList.tsx` | `src/features/history/components/HistoryList.tsx` |
| `src/components/History/MatchDetail.tsx` | `src/features/history/components/MatchDetail.tsx` |
| `src/components/History/MatchTimeline.tsx` | `src/features/history/components/MatchTimeline.tsx` |
| `src/components/History/MomentumGraph.tsx` | `src/features/history/components/MomentumGraph.tsx` |
| `src/components/History/ProAnalysis.tsx` | `src/features/history/components/ProAnalysis.tsx` |
| `src/components/modals/HistoryModal.tsx` | `src/features/history/modals/HistoryModal.tsx` |
| `src/stores/historyStore.ts` | `src/features/history/store/historyStore.ts` |
| `src/services/AnalysisEngine.ts` | `src/features/history/services/AnalysisEngine.ts` |
| `src/utils/statsEngine.ts` | `src/features/history/utils/statsEngine.ts` |
| `src/utils/timelineGenerator.ts` | `src/features/history/utils/timelineGenerator.ts` |

---

### 2.6 Feature: Ads (1 arquivo)

| Origem | Destino |
|--------|---------|
| `src/components/Ads/SmartBanner.tsx` | `src/features/ads/components/SmartBanner.tsx` |

---

## 3. Script de Migração Automatizado

### 3.1 Estrutura do Script

```
scripts/
├── migrate-phase-2.js          # Script principal
├── utils/
│   ├── fileOps.js             # Operações de arquivo (move, read, write)
│   ├── importUpdater.js       # Atualização de imports
│   └── validator.js           # Validação pós-migração
└── config/
    └── phase-2-mappings.json  # Mapeamento de origem -> destino
```

---

### 3.2 Código Completo: `scripts/migrate-phase-2.js`

```javascript
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
```

---

### 3.3 Dependências Necessárias

Adicione ao `package.json`:

```json
{
  "devDependencies": {
    "fs-extra": "^11.2.0",
    "glob": "^10.3.10",
    "chalk": "^4.1.2"
  }
}
```

Instalação:
```bash
npm install --save-dev fs-extra glob chalk
```

---

## 4. Instruções de Execução

### 4.1 Pré-execução (OBRIGATÓRIO)

```bash
# 1. Garantir que o repositório está limpo
git status

# 2. Criar branch para a migração
git checkout -b feat/migration-phase-2

# 3. Instalar dependências do script
npm install
```

### 4.2 Execução em Dry Run (Simulação)

```bash
# Simular migração sem fazer alterações
node scripts/migrate-phase-2.js --dry-run --verbose
```

Revise a saída e confirme que todos os arquivos serão movidos corretamente.

### 4.3 Execução Real

```bash
# Executar migração
node scripts/migrate-phase-2.js
```

### 4.4 Validação Pós-migração

```bash
# 1. Verificar TypeScript
npm run type-check
# ou
npx tsc --noEmit

# 2. Build de produção
npm run build

# 3. Rodar testes (se existirem)
npm test

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

### 4.5 Commit das Alterações

```bash
git add .
git commit -m "feat: migrate peripheral features (Phase 2)

- Migrated Tutorial feature (22 files)
- Migrated Voice feature (7 files)
- Migrated Social feature (4 files)
- Migrated Settings feature (5 files)
- Migrated History feature (10 files)
- Migrated Ads feature (1 file)

Total: 49 files migrated to src/features/

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 5. Checklist de Verificação

### 5.1 Estrutura de Pastas Criada

- [ ] `src/features/tutorial/` com subpastas: components, scenes, visuals, modals, hooks, data
- [ ] `src/features/voice/` com subpastas: hooks, modals, services
- [ ] `src/features/social/` com subpastas: components, hooks, services
- [ ] `src/features/settings/` com subpastas: components, modals
- [ ] `src/features/history/` com subpastas: components, modals, store, services, utils
- [ ] `src/features/ads/` com subpasta: components

### 5.2 Arquivos Movidos (49 total)

- [ ] Tutorial: 22 arquivos ✓
- [ ] Voice: 7 arquivos ✓
- [ ] Social: 4 arquivos ✓
- [ ] Settings: 5 arquivos ✓
- [ ] History: 10 arquivos ✓
- [ ] Ads: 1 arquivo ✓

### 5.3 Imports Atualizados

- [ ] Imports nos arquivos movidos usam path aliases (`@types`, `@ui`, `@lib`, etc.)
- [ ] Arquivos consumidores (ex: `GameScreen.tsx`, `App.tsx`) atualizados
- [ ] Nenhum import quebrado (verificar com TypeScript)

### 5.4 Diretórios Vazios Removidos

- [ ] `src/components/tutorial/` removido
- [ ] `src/components/Social/` removido
- [ ] `src/components/Share/` removido
- [ ] `src/components/Settings/` removido
- [ ] `src/components/History/` removido
- [ ] `src/components/Ads/` removido
- [ ] `src/services/ai/` removido
- [ ] `src/data/` removido (se vazio)

### 5.5 Compilação e Build

- [ ] `npx tsc --noEmit` passa sem erros
- [ ] `npm run build` completa com sucesso
- [ ] `npm run dev` inicia sem erros
- [ ] Aplicação carrega no navegador sem erros de console

### 5.6 Funcionalidades Testadas

- [ ] Tutorial interativo abre e funciona
- [ ] Comandos de voz funcionam
- [ ] Compartilhamento social funciona
- [ ] Modal de configurações abre
- [ ] Histórico de partidas carrega
- [ ] SmartBanner (ads) renderiza

---

## 6. Rollback Plan

Em caso de falha crítica:

```bash
# 1. Descartar todas as alterações
git reset --hard HEAD

# 2. Voltar para a branch anterior
git checkout main

# 3. Deletar branch de migração
git branch -D feat/migration-phase-2

# 4. Revisar erros e ajustar o script
```

---

## 7. Arquivos Consumidores Conhecidos

### 7.1 Consumidores de Tutorial

- `src/App.tsx` → Importa `RichTutorialModal`
- `src/components/modals/ModalManager.tsx` → Importa todos os modais
- `src/contexts/GameContext.tsx` → Pode usar `useTutorial`

### 7.2 Consumidores de Voice

- `src/screens/GameScreen.tsx` → Usa `useVoiceControl`
- `src/components/Fullscreen/FloatingControlBar.tsx` → Botão de voz
- `src/components/modals/ModalManager.tsx` → `VoiceCommandsModal`

### 7.3 Consumidores de Social

- `src/components/modals/MatchOverModal.tsx` → `useSocialShare`
- `src/screens/GameScreen.tsx` → `GlobalLeaderboard`

### 7.4 Consumidores de Settings

- `src/App.tsx` → `SettingsModal`
- `src/components/modals/ModalManager.tsx` → `SettingsModal`

### 7.5 Consumidores de History

- `src/App.tsx` → `HistoryModal`
- `src/hooks/useMatchSaver.ts` → `historyStore`
- `src/components/modals/MatchOverModal.tsx` → `MatchTimeline`

---

## 8. Notas Técnicas

### 8.1 Tratamento de Imports Circulares

Se houver imports circulares detectados:
1. Identificar os arquivos envolvidos
2. Extrair tipos compartilhados para `@types`
3. Usar lazy imports ou re-exports

### 8.2 Atualizações de Path Aliases

Os seguintes aliases já devem estar configurados (Fase 0):

```json
{
  "@types": ["./src/@types"],
  "@ui": ["./src/ui"],
  "@lib": ["./src/lib"],
  "@features/*": ["./src/features/*"],
  "@contexts/*": ["./src/contexts/*"],
  "@layouts/*": ["./src/layouts/*"],
  "@config/*": ["./src/config/*"],
  "@hooks/*": ["./src/hooks/*"]
}
```

### 8.3 Passos Manuais (Caso o Script Falhe)

Se o script automatizado falhar, execute a migração manualmente:

1. Crie as pastas de destino:
   ```bash
   mkdir -p src/features/{tutorial,voice,social,settings,history,ads}/{components,hooks,modals,services,store,utils,data,scenes,visuals}
   ```

2. Mova os arquivos usando git:
   ```bash
   git mv src/components/tutorial/InteractiveGestureDemo.tsx src/features/tutorial/components/
   # ... repetir para cada arquivo
   ```

3. Use Find & Replace no VS Code para atualizar imports:
   - Buscar: `from '../../components/tutorial/`
   - Substituir: `from '@features/tutorial/components/`

---

## 9. Métricas de Sucesso

| Métrica | Antes | Depois |
|---------|-------|--------|
| Arquivos em `src/components/` | 112 | 63 (redução de 44%) |
| Arquivos em `src/hooks/` | 40 | 18 (redução de 55%) |
| Arquivos em `src/services/` | 16 | 6 (redução de 63%) |
| Features organizadas em `src/features/` | 0 | 6 |
| Imports relativos profundos (`../../../`) | ~150 | 0 (eliminados) |
| Tempo para localizar feature | Alto | Baixo (estrutura clara) |

---

## 10. Próximos Passos (Fase 3)

Após conclusão da Fase 2, avançar para a **Fase 3: UI e Layouts**.

```
Fase 3: Migração de UI e Layouts
├── src/ui/ (Design System - 25 arquivos)
└── src/layouts/ (Layouts globais - 5 arquivos)
```

---

## Aprovação e Execução

**IMPORTANTE:** Este documento é uma especificação técnica. A execução só deve ser iniciada após:

1. ✅ Revisão completa do script por um desenvolvedor sênior
2. ✅ Testes em branch isolada
3. ✅ Backup do código atual
4. ✅ Aprovação explícita do tech lead

---

**Documento gerado em:** 2026-02-15
**Versão:** 1.0.0
**Autor:** DevOps Engineer via Claude Code
**Status:** PRONTO PARA REVISÃO

# RELEASE ROADMAP - VolleyScore Pro v2.0 (Gold Master)

> **Production Readiness Audit** | Gerado em: 18/02/2026
> **Rating Atual: 7.5/10** | Meta: 10/10 (Zero Crash, 5.0 Stars)
> **versionCode**: 208 | **versionName**: 2.0.0

---

## Resumo Executivo

| Categoria            | Status    | Itens P0 | Itens P1 | Itens P2 | Itens P3 |
|----------------------|-----------|----------|----------|----------|----------|
| Code Hygiene         | CRITICAL  | 2        | 2        | 1        | 2        |
| Game Engine          | SOLID     | 1        | 1        | 2        | 0        |
| UX/UI Neo-Glass      | GOOD      | 0        | 0        | 2        | 1        |
| Android/Native       | ATTENTION | 1        | 2        | 1        | 0        |
| Performance & Build  | EXCELLENT | 0        | 1        | 1        | 0        |
| **TOTAL**            |           | **4**    | **6**    | **7**    | **3**    |

---

## FASE 1: SANITIZACAO (Code Hygiene)

> **Objetivo**: Codebase limpo, sem artefatos de debug, tipagem segura.
> **Estimativa de esforco**: Baixo-Medio

### 1.1 - [P0] Remover TODOS os `console.log` de producao

**Complexidade**: Baixa | **Arquivos**: 8 | **Ocorrencias**: ~35

O app ja possui um `logger.ts` com controle de ambiente, mas dezenas de `console.log` diretos permanecem. Em producao, `index.tsx:29` faz `console.log = noop`, mas isso e um band-aid - os logs ainda existem no bundle e podem causar problemas em debug builds.

| Arquivo | Linhas | Descricao |
|---------|--------|-----------|
| `src/index.tsx` | 21-22 | App init logs |
| `src/contexts/AuthContext.tsx` | 30, 73, 77, 88, 91, 94, 103 | Google Sign-In flow (7 logs) |
| `src/features/game/components/FullscreenMenuDrawer.tsx` | 60, 114, 119, 125, 130, 136, 141, 147 | Menu navigation (8 logs) |
| `src/features/game/hooks/useVolleyGame.ts` | 62, 123, 139 | Game init/rotation |
| `src/features/game/modals/MatchOverModal.tsx` | 109-110, 114, 158-159, 164, 170-171, 176 | Match over debug (9 logs) |
| `src/features/social/hooks/useSocialShare.ts` | 78 | Share debug |
| `src/lib/platform/useNativeIntegration.ts` | 123 | PWA fullscreen |

**Acao**: Substituir todos por `logger.debug()` ou remover. Manter apenas `console.error`/`console.warn` em catch blocks criticos.

---

### 1.2 - [P0] Tipar exports do Firebase (eliminar `any` criticos)

**Complexidade**: Baixa | **Arquivo**: `src/lib/firebase.ts:36-38`

```typescript
// ATUAL (inseguro)
let authExport: any = null;
let googleProviderExport: any = null;
let dbExport: any = null;

// CORRETO
let authExport: Auth | null = null;
let googleProviderExport: GoogleAuthProvider | null = null;
let dbExport: Firestore | null = null;
```

**Risco**: Sem tipagem, qualquer chamada ao Firebase pode falhar silenciosamente em runtime sem erro de compilacao.

---

### 1.3 - [P1] Reduzir tipos `any` no GameContext

**Complexidade**: Baixa | **Arquivo**: `src/features/game/context/GameContext.tsx`

| Linha | Campo | Tipo Correto |
|-------|-------|-------------|
| 23 | `updateTeamColor: (id: string, color: any)` | `ColorKey` |
| 30 | `setRotationMode: (mode: any)` | `RotationMode` |
| 98 | `deletedPlayerHistory: any[]` | `DeletedPlayerEntry[]` |

---

### 1.4 - [P1] Tipar componentes de Settings (SettingsUI.tsx)

**Complexidade**: Baixa | **Arquivo**: `src/features/settings/components/SettingsUI.tsx`

```typescript
// Linha 5  - icon: any -> icon?: LucideIcon
// Linha 12 - SettingItem = ({ ... }: any) -> interface SettingItemProps
// Linha 25 - PresetButton = ({ ... }: any) -> interface PresetButtonProps
```

Componentes publicos com `any` props sao bombas-relogio para regressoes.

---

### 1.5 - [P2] Tipar `any` restantes em servicos criticos

**Complexidade**: Media | **Arquivos**: ~15 com `any` residuais

**Prioridade por impacto**:
1. `src/features/voice/services/VoiceRecognitionService.ts` - 6 `any` (Web Speech API)
2. `src/features/voice/services/VoiceCommandParser.ts` - 3 `any` (vocab parameter)
3. `src/features/voice/services/GeminiCommandService.ts` - `type: safeData.type as any`
4. `src/lib/audio/AudioService.ts` - 6 `as any` (AudioContext compat)
5. `src/lib/storage/io.ts` - 6 `any` (serialization)
6. `src/features/court/modals/CourtModal.tsx` - `activeDragPlayer: any`, `as any` fallbacks

**Nota**: Alguns `as any` em `AudioService.ts` sao justificaveis (webkitAudioContext, 'interrupted' state nao existem nos tipos oficiais). Marcar com `// eslint-disable-next-line` + comentario explicativo.

---

### 1.6 - [P3] Limpar codigo comentado

**Complexidade**: Baixa | **Arquivos**: 3

| Arquivo | Linha | Descricao |
|---------|-------|-----------|
| `src/features/game/modals/MatchOverModal.tsx` | 72 | `winnerTheme` nao utilizado |
| `src/features/history/components/HistoryList.tsx` | 156 | `activeTab` state comentado |
| `src/features/game/components/FloatingControlBar.tsx` | 69-70 | Estilo antigo comentado |

---

### 1.7 - [P3] Remover re-export legado `src/types.ts`

**Complexidade**: Baixa | **Arquivo**: `src/types.ts:3`

```typescript
// TODO: Remove after all imports are migrated to @types
export * from './@types';
```

Verificar se todos os imports ja usam `@types` e remover o barrel file legado.

---

## FASE 2: BLINDAGEM (Stability & Data Safety)

> **Objetivo**: Zero perda de dados, resistencia ao ciclo de vida Android.
> **Estimativa de esforco**: Medio-Alto

### 2.1 - [P0] Cloud Sync: Implementar retry com backoff exponencial

**Complexidade**: Media | **Arquivo**: `src/features/game/hooks/useMatchSaver.ts:96-107`

**Problema Critico**: O sync atual e fire-and-forget. Se falhar, o usuario ve "Salvo" mas os dados existem apenas localmente. Se o usuario limpar cache ou desinstalar, os dados sao perdidos permanentemente.

```typescript
// ATUAL (perigoso)
SyncService.pushMatch(user.uid, finalMatchData)
  .then(syncSuccess => {
    if (!syncSuccess) {
      console.warn('[useMatchSaver] cloud sync failed...'); // <- silencioso!
    }
  });
```

**Solucao Proposta**:
1. Implementar fila de sync pendente em `SecureStorage` (key: `sync_queue`)
2. Retry com backoff: 3 tentativas (5s, 15s, 60s)
3. Marcar partida como `syncStatus: 'pending' | 'synced' | 'failed'`
4. Mostrar indicador visual se sync falhou (icone de nuvem com aviso)
5. Retry automatico quando conexao retornar (`useOnlineStatus`)

---

### 2.2 - [P1] Memory Leak: setTimeout sem cleanup no FullscreenMenuDrawer

**Complexidade**: Baixa | **Arquivo**: `src/features/game/components/FullscreenMenuDrawer.tsx`

**Problema**: 6 `setTimeout` callbacks (linhas 118-147) sem captura do timer ID. Se o componente desmontar durante os 100ms de delay, o callback executa em componente morto.

```typescript
// ATUAL (vazamento)
setTimeout(() => { onOpenSettings(); }, 100);

// CORRETO
const timerRef = useRef<ReturnType<typeof setTimeout>>();
useEffect(() => () => { clearTimeout(timerRef.current); }, []);
// ...
timerRef.current = setTimeout(() => { onOpenSettings(); }, 100);
```

---

### 2.3 - [P2] Undo/Redo: Adicionar limite maximo de profundidade

**Complexidade**: Baixa | **Arquivo**: `src/features/game/reducers/meta.ts:164-220`

**Problema**: Nao ha limite de snapshots no historico de undo. Em partidas longas (5 sets, 200+ acoes), a memoria pode crescer significativamente.

**Solucao**: Limitar `lastSnapshot` stack a N=50 acoes. Apos o limite, descartar snapshots mais antigos.

---

### 2.4 - [P2] SecureStorage: Escrita nao-atomica entre IDB e localStorage

**Complexidade**: Baixa-Media | **Arquivo**: `src/lib/storage/SecureStorage.ts:11-26`

**Problema**: O dual-write (IndexedDB + localStorage backup) nao e atomico. Se o app crashar entre as duas escritas, pode haver inconsistencia.

**Mitigacao**: Aceitavel para mobile. Adicionar verificacao de integridade no load (comparar timestamps) e preferir a versao mais recente.

---

## FASE 3: POLIMENTO (UX/UI)

> **Objetivo**: Visual pixel-perfect, acessibilidade completa, zero jank.
> **Estimativa de esforco**: Medio

### 3.1 - [P2] Otimizar `useSafeAreaInsets` (DOM thrashing)

**Complexidade**: Baixa | **Arquivo**: `src/lib/platform/useSafeAreaInsets.ts:14-23`

**Problema**: `measureEnvValue()` cria e remove elementos DOM a cada chamada. Isso pode causar reflow desnecessario em dispositivos low-end.

```typescript
// ATUAL (cria/remove DOM element a cada medicao)
const measureEnvValue = (envVar: string): number => {
  const el = document.createElement('div');
  // ...
  el.remove();
};
```

**Solucao**: Criar um unico elemento de medicao persistente (singleton) ou cachear valores apos primeira medicao (safe areas nao mudam em runtime).

---

### 3.2 - [P2] Validar layout em telas extremas

**Complexidade**: Media | **Arquivos**: Multiplos (ScoreCard, CourtModal, MatchOverModal)

**Testar manualmente**:
- [ ] Tela pequena: Galaxy S24 (360x780), iPhone SE (375x667)
- [ ] Tela grande: Samsung Tab S9 (1600x2560)
- [ ] Landscape forcado vs Portrait em modais
- [ ] Notch/Dynamic Island overlap com FloatingTopBar
- [ ] Teclado virtual sobrepondo inputs (AddPlayerForm, Settings)

**Nota**: O `ResponsiveContext` e o sistema de `spacing()` estao bem implementados. O risco e baixo mas testes manuais sao essenciais.

---

### 3.3 - [P3] Auditoria de Dark/Light Mode em componentes menores

**Complexidade**: Baixa

**Status**: O tema dark/light esta bem implementado globalmente (classes Tailwind `dark:`). Realizar varredura visual rapida em:
- [ ] `PlayerContextMenu` - verificar contraste em light mode
- [ ] `ProfileCreationModal` - borders e shadows
- [ ] `VoiceCommandsModal` - badges e separadores
- [ ] `BroadcastOverlay` - overlay transparency

---

## FASE 4: STORE PREP (Native & Release)

> **Objetivo**: APK/AAB pronto para upload na Google Play Store.
> **Estimativa de esforco**: Alto (requer builds e testes nativos)

### 4.1 - [P0] Substituir AdMob Test ID por ID de producao

**Complexidade**: Baixa | **Arquivo**: `android/app/src/main/AndroidManifest.xml:34`

```xml
<!-- ATUAL (ID DE TESTE - vai ser rejeitado na Play Store!) -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-3940256099942544~3347511713" />

<!-- PRODUCAO (substituir pelo seu ID real) -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX" />
```

---

### 4.2 - [P1] Auditar permissoes desnecessarias no AndroidManifest

**Complexidade**: Baixa | **Arquivo**: `android/app/src/main/AndroidManifest.xml:38-51`

**Permissoes atuais vs Justificativa**:

| Permissao | Necessaria? | Justificativa |
|-----------|-------------|---------------|
| `INTERNET` | SIM | Firebase sync |
| `ACCESS_NETWORK_STATE` | SIM | Online status |
| `WRITE_EXTERNAL_STORAGE` | REVISAR | Deprecated no Android 13+. Usar `MediaStore` ou Scoped Storage |
| `READ_EXTERNAL_STORAGE` | REVISAR | Deprecated no Android 13+. Idem |
| `CAMERA` | REVISAR | Usado para foto de perfil? Se nao, remover |
| `RECORD_AUDIO` | SIM | Voice commands (Speech Recognition) |
| `ACCESS_FINE_LOCATION` | **REMOVER** | Nenhuma feature de geolocalizacao detectada no app |
| `VIBRATE` | SIM | Haptic feedback |
| `WAKE_LOCK` | SIM | Keep screen on durante partida |
| `POST_NOTIFICATIONS` | SIM | Notificacoes push |
| `SYSTEM_ALERT_WINDOW` | REVISAR | Overlay? Se nao usado, remover. Play Store e rigorosa |
| `CHANGE_NETWORK_STATE` | REVISAR | Normalmente nao necessaria para apps. Verificar se Capacitor exige |

**CRITICO**: `ACCESS_FINE_LOCATION` sem justificativa sera rejeitado pela Google Play. A politica de permissoes ficou muito mais rigorosa em 2024/2025.

**Acao**:
1. Remover `ACCESS_FINE_LOCATION` imediatamente
2. Remover `SYSTEM_ALERT_WINDOW` se nao utilizado
3. Adicionar `maxSdkVersion="32"` em `WRITE/READ_EXTERNAL_STORAGE`
4. Adicionar `<uses-feature android:name="android.hardware.camera" android:required="false" />` se CAMERA mantida

---

### 4.3 - [P1] Validar `versionCode` e `versionName` para release

**Complexidade**: Baixa | **Arquivo**: `android/app/build.gradle:17-18`

```groovy
versionCode 208
versionName "2.0.0"
```

**Checklist**:
- [ ] `versionCode 208` e maior que a ultima versao publicada na Play Store?
- [ ] `versionName "2.0.0"` esta correto para o marketing?
- [ ] `package.json` version (`1.0.0`) diverge do `build.gradle` (`2.0.0`) - **ALINHAR**

---

### 4.4 - [P2] PWA Manifest: icones com tamanhos incorretos

**Complexidade**: Baixa | **Arquivo**: `vite.config.ts:106-118`

```typescript
icons: [
  { src: 'icon.png', sizes: '192x192', ... },
  { src: 'icon.png', sizes: '512x512', ... } // <- MESMO arquivo para 2 tamanhos!
]
```

**Problema**: O mesmo `icon.png` e declarado como 192x192 E 512x512. O arquivo so pode ter um tamanho real. Criar dois arquivos distintos: `icon-192.png` e `icon-512.png`.

---

### 4.5 - [P1] Build de producao: Verificar bundle size e testar

**Complexidade**: Media

**Checklist pre-release**:
- [ ] Rodar `npm run build` e verificar se compila sem erros de TypeScript
- [ ] Analisar bundle size com `npx vite-bundle-visualizer`
- [ ] Verificar que `target: 'esnext'` nao exclui dispositivos Android antigos (Capacitor usa WebView, verificar `minSdkVersion`)
- [ ] Rodar `npx cap sync` apos build
- [ ] Gerar AAB (Android App Bundle) assinado com keystore de producao
- [ ] Testar APK em dispositivo real (nao apenas emulador)

---

## Checklist Final (Pre-Upload)

### Requisitos Google Play Store

- [ ] **P0** App ID de AdMob trocado para producao
- [ ] **P0** Permissao `ACCESS_FINE_LOCATION` removida
- [ ] **P0** Todos console.log removidos/substituidos
- [ ] **P0** Cloud Sync com retry implementado
- [ ] **P1** `SYSTEM_ALERT_WINDOW` removida (se nao usada)
- [ ] **P1** Storage permissions com `maxSdkVersion`
- [ ] **P1** `versionCode` e `versionName` alinhados (build.gradle + package.json)
- [ ] **P1** Bundle size abaixo de 150MB (AAB)
- [ ] **P1** Signed AAB com keystore de producao
- [ ] **P2** Privacy Policy URL configurada
- [ ] **P2** Screenshots atualizadas para listagem da loja
- [ ] **P2** Ficha de dados de seguranca (Data Safety) preenchida

### Testes Pre-Gold Master

- [ ] Partida completa 3 sets (Indoor 6v6)
- [ ] Partida Beach 2v2 completa
- [ ] Fechar app no meio da partida e reabrir (persistencia)
- [ ] Undo/Redo em todos cenarios (ponto, timeout, substituicao)
- [ ] Voice commands funcionando (se feature habilitada)
- [ ] Google Sign-In flow completo
- [ ] Compartilhar resultado (social share)
- [ ] Testar em Android 10 (API 29), 12 (API 31), 14 (API 34)
- [ ] Testar com "Reduced Motion" ativado nas configs de acessibilidade
- [ ] Testar com fonte do sistema aumentada (Display > Font Size > Largest)
- [ ] Testar botao "Voltar" do hardware em TODOS os modais
- [ ] Testar com conexao offline (modo aviao)

---

## Pontos Positivos (O que esta EXCELENTE)

| Area | Avaliacao | Detalhe |
|------|-----------|---------|
| Arquitetura Feature-Based | A+ | Separacao limpa, sem arquivos orfaos |
| Split Context Pattern | A+ | 4 contextos isolados, zero re-renders desnecessarios |
| Code Splitting (Vite) | A+ | manualChunks otimizado, lazy loading de ProAnalysis e DnD |
| Reduced Motion / Acessibilidade | A+ | 3 modos de performance, respeita `prefers-reduced-motion` |
| Android Back Button | A+ | Modal-aware, match-protected, cleanup correto |
| Data Resilience (SecureStorage) | A | Dual-write IDB+localStorage, auto-heal |
| Timer Lifecycle | A | Ref-based, cleanup no unmount, sobrevive pause/resume |
| Dark Mode | A | Implementacao consistente via Tailwind `dark:` |
| Orientation Lock | A | Hibrido nativo+PWA, error handling correto |
| Splash Screen | A | Configurado corretamente, auto-hide controlado |

---

## Ordem de Execucao Recomendada

```
SEMANA 1 (BLOQUEADORES):
  Dia 1-2: Fase 1.1 (console.log) + Fase 4.1 (AdMob ID) + Fase 4.2 (permissoes)
  Dia 3-4: Fase 2.1 (Cloud Sync retry) + Fase 2.2 (setTimeout cleanup)
  Dia 5:   Fase 4.3 (version alignment) + Fase 4.5 (build test)

SEMANA 2 (HARDENING):
  Dia 1-2: Fase 1.2-1.4 (tipagem any critica)
  Dia 3:   Fase 2.3-2.4 (undo limit + storage integrity)
  Dia 4:   Fase 3.1-3.2 (safe area + responsive testing)
  Dia 5:   Fase 3.3 (dark mode audit visual)

SEMANA 3 (POLISH & RELEASE):
  Dia 1-2: Fase 1.5-1.7 (any restantes + cleanup)
  Dia 3:   Fase 4.4 (PWA icons)
  Dia 4-5: Testes Pre-Gold Master (checklist completo)

RELEASE: Gold Master Build + Upload Play Store
```

---

> **Nota Final**: A base de codigo esta em excelente estado arquitetural. As refatoracoes (Feature-Based, Split Context, Neo-Glass) foram bem executadas. Os 4 itens P0 sao os unicos bloqueadores reais para o lancamento. Com eles resolvidos, o app esta pronto para beta testing.

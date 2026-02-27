# SECURITY AUDIT & CODE REVIEW — VolleyScore-Pro

**Data:** 2026-02-27 | **Branch:** main | **Status:** Pre-lançamento
**Auditor:** Claude Code (Opus 4.6) | **Escopo:** Full-stack security audit
**Arquivos analisados:** 500+ | **Agentes paralelos:** 7

---

## RESUMO EXECUTIVO

Auditoria de segurança completa cobrindo 7 áreas: secrets/API keys, autenticação/Firebase rules, XSS/injection, validação de input, dependências, data leaks, e PWA/service worker.

O aplicativo tem uma **base de segurança sólida** (React auto-escaping, sanitização de input, Firebase App Check, console stripping em produção), mas foram encontrados **problemas críticos que precisam de correção imediata** antes do lançamento.

### Tabela de Severidade

| Severidade | Qtd | Descrição |
|---|---|---|
| **CRITICAL** | 5 | Chaves API expostas no git, regras Firestore permissivas, jsPDF com CVEs |
| **HIGH** | 8 | Logout incompleto, storage rules sem ownership, CSP com unsafe-eval, senha dev hardcoded |
| **MEDIUM** | 9 | Validação de input incompleta, dados no localStorage sem encriptação, erros expostos |
| **LOW** | 6 | Headers de segurança, timestamps, rate limiting |

---

## CRITICAL — Correção Imediata Obrigatória

### C1. Chaves API Expostas no Histórico Git

| Campo | Detalhe |
|-------|---------|
| **Arquivos** | `.env`, `.env.production`, `.history/*.env*` |
| **Commit inicial** | `7372452dc7cb7ada` (Feb 4, 2026) |
| **Impacto** | Acesso não autorizado a Firebase e Gemini AI |

**Chaves expostas:**
```
VITE_FIREBASE_API_KEY=AIzaSyD_foaDrOb4g13jGCw881pEfbv8rIha2M4
VITE_GEMINI_API_KEY=AIzaSyBPc14-9bHLij18DJ8GPQ_RRECQDoH2YOo
VITE_FIREBASE_PROJECT_ID=volleyscore-pro
VITE_FIREBASE_APP_ID=1:812069353468:web:2ea02c46dd325750d0e479
VITE_FIREBASE_MESSAGING_SENDER_ID=812069353468
VITE_FIREBASE_MEASUREMENT_ID=G-XWNJ8R4Z7S
```

**Risco:** Um atacante com estas chaves pode:
- Autenticar-se como o app no Firebase
- Acessar/modificar Firestore database
- Enumerar dados de utilizadores
- Criar contas não autorizadas
- Abusar do Gemini API (custo financeiro)
- Usar recursos Firebase causando custos (DoS)

**Agravante:** Múltiplas rotações de chave detectadas no `.history/` (pelo menos 2 Gemini keys diferentes), indicando consciência da exposição mas remediação incompleta.

**Ações obrigatórias:**
1. Revogar AMBAS as chaves no Google Cloud Console imediatamente
2. Gerar novas chaves e atualizar `.env`
3. Limpar histórico git:
   ```bash
   git filter-repo --invert-paths --path .env --path .env.production
   git push origin --force --all
   ```
4. Deletar pasta `.history/` (backups do VS Code com secrets)
5. Criar `.env.example` com placeholders

---

### C2. Firestore Rules — Leitura Pública Sem Autenticação

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `firestore.rules` |
| **Linhas** | ~59, ~68, ~85 |
| **Impacto** | Exposição de dados de partidas e utilizadores |

**Regras problemáticas:**
```javascript
// Linha ~59 — Coleção pública sem restrição
match /public/{document=**} {
  allow read: if true;      // ACESSO IRRESTRITO
  allow create: if isAuthenticated();
  // Sem validação de schema nos writes
}

// Linha ~68 — Partidas ao vivo públicas
match /live_matches/{sessionId} {
  allow read: if true;      // ACESSO IRRESTRITO
  // Expõe: gameState, hostUid, spectatorCount, timer
}

// Linha ~85 — Espectadores públicos
match /spectators/{spectatorId} {
  allow read: if true;      // ACESSO IRRESTRITO
  // Expõe: userId, joinTimestamp → permite rastreamento
}
```

**Risco:**
- Qualquer pessoa sem autenticação pode ler dados de partidas ao vivo
- Presença de espectadores exposta (privacy violation)
- User IDs e timestamps acessíveis publicamente
- Permite scraping massivo de dados
- Combinando live_matches + spectators = rastreamento de utilizadores

**Fix recomendado:**
```javascript
match /live_matches/{sessionId} {
  allow read: if request.auth != null;  // Requer autenticação
  allow create: if isAuthenticated();
  allow update, delete: if isAuthenticated() && request.auth.uid == resource.data.hostUid;
}

match /spectators/{spectatorId} {
  allow read: if request.auth != null;
  allow create: if isAuthenticated() && spectatorId == request.auth.uid;
  allow delete: if isAuthenticated() && spectatorId == request.auth.uid;
}
```

---

### C3. `sanitizeForFirebase()` — Método Inexistente

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `src/features/broadcast/services/SyncEngine.ts` |
| **Linhas** | 99, 152 |
| **Impacto** | Dados não sanitizados enviados ao Firestore |

```typescript
// Linha 99 — hostMatch()
state: this.sanitizeForFirebase(initialState)  // MÉTODO NÃO EXISTE

// Linha 152 — broadcastState()
state: this.sanitizeForFirebase(state)          // MÉTODO NÃO EXISTE
```

**Risco:** O método `sanitizeForFirebase()` é chamado mas nunca foi implementado na classe. Isso significa que o gameState completo é enviado ao Firestore sem nenhuma sanitização. Conteúdo malicioso em nomes de times/jogadores, estados de jogo manipulados, ou campos extras serão persistidos diretamente.

**Fix:** Implementar o método:
```typescript
private sanitizeForFirebase(state: GameState): Partial<GameState> {
  return {
    scoreA: Math.max(0, Math.min(state.scoreA, 200)),
    scoreB: Math.max(0, Math.min(state.scoreB, 200)),
    currentSet: state.currentSet,
    sets: state.sets,
    teamAName: sanitizeInput(state.teamAName || '', 30),
    teamBName: sanitizeInput(state.teamBName || '', 30),
    serving: state.serving,
    // ... campos necessários com validação
  };
}
```

---

### C4. jsPDF — 8 CVEs Conhecidos (1 Critical)

| Campo | Detalhe |
|-------|---------|
| **Pacote** | `jspdf@<=4.1.0` |
| **Severidade npm** | CRITICAL |
| **CVEs** | 8 vulnerabilidades conhecidas |

**Vulnerabilidades:**
1. **GHSA-f8cm-6447-x5h2** — Local File Inclusion / Path Traversal
2. **GHSA-pqxr-3g65-p328** — PDF Injection → Execução JavaScript Arbitrária (AcroFormChoiceField)
3. **GHSA-p5xg-68wr-hm3m** — PDF Injection → Execução JavaScript Arbitrária (RadioButton)
4. **GHSA-9vjf-qc39-jprp** — PDF Object Injection via addJS
5. **GHSA-vm32-vv63-w422** — XMP Metadata Injection (Spoofing)
6. **GHSA-cjw8-79x6-5cj4** — Race Condition em addJS Plugin
7. **GHSA-95fx-jjr5-f39c** — DoS via BMP Dimensions
8. **GHSA-67pg-wm7f-q7fj** — DoS via GIF Dimensions

**Fix:** `npm install jspdf@4.2.0` (breaking change — testar geração de PDFs após atualização)

---

### C5. Global Leaderboard — Sem Regras Firestore

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `src/features/social/services/SocialService.ts` |
| **Linhas** | 60-76 |
| **Impacto** | Leaderboard poisoning, perfis falsos |

```typescript
public async publishToLeaderboard(profile: PlayerProfile) {
  const ref = doc(db, 'global_leaderboard', profile.id);
  await setDoc(ref, {
    firebaseUid: profile.firebaseUid,
    name: profile.name,        // Sem sanitização
    // stats sem validação...
  }, { merge: true });
  // Sem verificação de ownership
  // Sem regras Firestore para esta coleção
}
```

**Risco:**
- Qualquer utilizador autenticado pode publicar perfis falsos
- Stats podem ser manipulados (wins, MVPs, score arbitrário)
- Não há verificação de que o profile.id pertence ao user autenticado
- Coleção `global_leaderboard` aparentemente sem regras de segurança

**Fix:**
1. Adicionar regra Firestore:
   ```javascript
   match /global_leaderboard/{entryId} {
     allow read: if request.auth != null;
     allow write: if request.auth != null
       && request.auth.uid == request.resource.data.firebaseUid
       && request.resource.data.name is string
       && request.resource.data.name.size() <= 50;
   }
   ```
2. Validar ownership no client: `if (profile.firebaseUid !== auth.currentUser?.uid) return;`

---

## HIGH — Correção Antes do Lançamento

### H1. Logout Incompleto

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `src/contexts/AuthContext.tsx` |
| **Linhas** | 115-123 |
| **Impacto** | Vazamento de dados entre sessões de utilizadores |

```typescript
const logout = useCallback(async () => {
  if (!isFirebaseInitialized || !auth) return;
  try {
    await signOut(auth);
    setUser(null);
  } catch (e) {
    console.error("[Auth] Logout error:", e);
  }
}, []);
```

**O que NÃO é limpo:**
- SecureStorage / IndexedDB (perfis, histórico de partidas)
- localStorage (backups de action_log, player_profiles_master)
- Listeners ativos do Firestore (SyncEngine subscriptions permanecem ativas)
- Fila pendente do SyncService
- Estado de broadcast ativo

**Risco:** Em dispositivo partilhado, o próximo utilizador pode ver dados do utilizador anterior.

**Fix recomendado:**
```typescript
const logout = useCallback(async () => {
  if (!isFirebaseInitialized || !auth) return;
  try {
    // 1. Cancelar subscriptions ativas
    SyncEngine.getInstance().disconnect();

    // 2. Limpar storages
    await SecureStorage.clear();
    localStorage.clear();

    // 3. Logout Firebase
    await signOut(auth);
    setUser(null);
  } catch (e) {
    console.error("[Auth] Logout error:", e);
  }
}, []);
```

---

### H2. Storage Rules — Sem Verificação de Ownership

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `storage.rules` |
| **Linhas** | 32-39 |
| **Impacto** | Qualquer utilizador pode sobrescrever avatar/logo de outros |

```javascript
// Qualquer autenticado pode escrever em QUALQUER perfil
match /profiles/{profileId}/avatar {
  allow write: if isAuthenticated() && isImageFile() && isSmallImage();
  // FALTA: && profileId == request.auth.uid
}

// Qualquer autenticado pode modificar logo de QUALQUER time
match /rosters/{rosterId}/logo {
  allow write: if isAuthenticated() && isImageFile() && isSmallImage();
  // FALTA: ownership check
}
```

**Fix:**
```javascript
match /profiles/{profileId}/avatar {
  allow write: if isAuthenticated()
    && isImageFile()
    && isSmallImage()
    && profileId == request.auth.uid;
}
```

---

### H3. CSP com `unsafe-eval` e `unsafe-inline`

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `index.html` |
| **Linhas** | 12-23 |
| **Impacto** | CSP enfraquecido, permite execução de scripts maliciosos |

```html
<meta http-equiv="Content-Security-Policy" content="
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://cdn.tailwindcss.com https://cdn.jsdelivr.net
    https://esm.sh https://apis.google.com
    https://*.google.com https://*.gstatic.com data: blob:;
  connect-src 'self' ... wss: ws: data: blob: filesystem:;
">
```

**Problemas:**
- `'unsafe-eval'` — Derrota a maioria das proteções CSP, permite `eval()`
- `'unsafe-inline'` — Permite scripts inline (vetor de XSS)
- `data:` e `blob:` em script-src — Permite data/blob URIs como scripts
- `wss:` e `ws:` wildcards — Conexões WebSocket sem restrição de domínio
- `*.google.com` e `*.googleapis.com` — Domínios muito amplos

**Fix:**
1. Remover `'unsafe-eval'` (verificar se alguma lib requer)
2. Migrar de `'unsafe-inline'` para nonces: `'nonce-{random}'`
3. Restringir `connect-src` WebSocket para domínios específicos
4. Considerar remover `data:` e `blob:` de script-src

---

### H4. Senha Dev Mode Hardcoded

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `src/features/settings/components/SystemTab.tsx` |
| **Linhas** | 73-83 |
| **Impacto** | Qualquer pessoa pode ativar developer mode e remover ads |

```typescript
const handleDevLogin = () => {
    if (devPassword === 'devmode') {  // Hardcoded — visível no bundle
        setLocalConfig(prev => ({
          ...prev,
          developerMode: true,
          adsRemoved: true  // Bypass de monetização!
        }));
    }
};
```

**Risco:**
- Senha visível em qualquer bundle minificado (buscar por string "devmode")
- Permite ativar modo developer
- **Remove ads** — bypass direto da monetização
- Pode expor funcionalidades de debug

**Fix:** Remover toggle de dev mode do build de produção:
```typescript
// Apenas incluir em development
if (import.meta.env.DEV) {
  // Dev mode UI...
}
```

---

### H5. Player Names Sem Sanitização

| Campo | Detalhe |
|-------|---------|
| **Arquivos** | `src/features/teams/components/AddPlayerForm.tsx:55`, Batch input |
| **Impacto** | Nomes maliciosos persistidos em DB, exports, PDFs |

```typescript
// AddPlayerForm.tsx:55 — Sem sanitizeInput()
onAdd(name.trim(), number.trim() || undefined, skill);

// BatchInputSection — Sem sanitização no split
const names = rawLines.map(n => n.trim()).filter(n => n.length > 0);
```

**Risco:** Nomes de jogadores fluem para: Firestore, exports JSON, geração de PDF (jsPDF), broadcasts, e ResultCard (compartilhamento social). React escapa por padrão no JSX, mas os outros canais podem ser vulneráveis.

**Fix:**
```typescript
import { sanitizeInput } from '@lib/utils/security';

// AddPlayerForm.tsx
onAdd(sanitizeInput(name.trim()), number.trim() || undefined, skill);

// BatchInputSection
const names = rawLines.map(n => sanitizeInput(n.trim())).filter(n => n.length > 0);
```

---

### H6. Broadcast — Sem Validação de Host

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `src/features/broadcast/services/SyncEngine.ts` |
| **Linhas** | 87-108 |
| **Impacto** | Session hijacking — atacante pode hospedar partidas como outros utilizadores |

```typescript
public async hostMatch(
  sessionId: string,
  userId: string,        // Aceita qualquer userId
  initialState: GameState
): Promise<void> {
  const payload: SyncSessionSchema = {
    hostUid: userId,     // Sem verificação: userId === auth.currentUser.uid
    // ...
  };
  await setDoc(sessionRef, payload);
}
```

**Fix:** Validar no client e nas Firestore rules:
```typescript
if (userId !== auth.currentUser?.uid) throw new Error('Unauthorized');
```

---

### H7. User API Key Exposta no State React

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `src/features/settings/components/SystemTab.tsx` |
| **Linhas** | 292-296 |
| **Impacto** | API key do utilizador visível no React DevTools |

```tsx
<input
  type={showKey ? "text" : "password"}
  value={localConfig.userApiKey || ''}
  onChange={(e) => setLocalConfig(prev => ({ ...prev, userApiKey: e.target.value }))}
/>
```

**Risco:** A chave Gemini do utilizador fica em state React não-encriptado, acessível via DevTools, crash reports, e Redux snapshots.

**Fix:** Usar SecureStorage para persistir e nunca manter em state do componente por mais tempo que o necessário.

---

### H8. ErrorBoundary Expõe Stack Traces

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `src/ui/ErrorBoundary.tsx` |
| **Linhas** | 33-35, 58-60 |
| **Impacto** | Informações internas expostas ao utilizador e no console |

```tsx
// Mostra mensagem de erro ao utilizador (pode conter paths internos, API endpoints)
<p className="mt-8 text-[10px] ...">
  {error?.message}
</p>

// console.error NÃO é stripped pelo esbuild drop (só console.log/info/debug)
public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error("Uncaught error:", error, errorInfo);
}
```

**Fix:**
```tsx
// Mensagem genérica em produção
<p>{import.meta.env.DEV ? error?.message : 'Ocorreu um erro inesperado.'}</p>

// Log condicional
public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  if (import.meta.env.DEV) {
    console.error("Uncaught error:", error, errorInfo);
  }
  // Em produção: enviar para Sentry/Crashlytics
}
```

---

## MEDIUM — Correção Recomendada

### M1. Dados no localStorage Sem Encriptação

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `src/lib/storage/SecureStorage.ts:20-22` |
| **Impacto** | Dados de jogadores/partidas acessíveis via XSS |

```typescript
// Backup em localStorage — texto puro, sem encriptação
if (key === 'action_log' || key === 'player_profiles_master') {
    localStorage.setItem(`${fullKey}_bak`, value);
}
```

**Dados expostos:** Nomes de jogadores, histórico de partidas, skill levels, stats.

**Fix:** Remover backup localStorage (IndexedDB já é resiliente) ou usar biblioteca de encriptação (tweetnacl.js, libsodium.js).

---

### M2. Schema Validation Missing nas Firestore Rules

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `firestore.rules:15-39` |
| **Impacto** | Estruturas de dados arbitrárias aceitas nos writes |

Regras de write não validam `request.resource.data`:
- Sem verificação de campos obrigatórios
- Sem verificação de tipos de dados
- Sem limitação de tamanho de strings
- Utilizadores podem escrever campos arbitrários nos perfis

**Fix:** Adicionar validação:
```javascript
allow write: if isOwner(userId)
  && request.resource.data.name is string
  && request.resource.data.name.size() <= 50
  && request.resource.data.keys().hasOnly(['name', 'skillLevel', 'stats', 'avatar', 'updatedAt']);
```

---

### M3. GameConfig Sem Validação

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `src/features/game/hooks/useGameActions.ts:72-74` |
| **Impacto** | Configurações inválidas corrompem estado do jogo |

```typescript
const applySettings = useCallback((config: GameConfig, shouldReset: boolean) => {
  dispatch({ type: 'APPLY_SETTINGS', config, shouldReset });
  // Sem validação de enums, ranges, ou tipos
}, [dispatch]);
```

**Campos sem validação:**
- `config.mode` — deveria ser enum (INDOOR_6x6, BEACH_2x2, etc.)
- `config.maxSets` — deveria ser 1-5
- `config.pointsPerSet` — deveria ser 15-30
- `config.tieBreakPoints` — deveria ser 10-15
- `config.deuceType` — deveria ser enum
- `config.voiceRate` / `config.voicePitch` — deveria ser 0.1-2.0

**Fix:** Adicionar validação com Zod ou função manual antes do dispatch.

---

### M4. Voice Input playerName Sem Sanitização

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `src/features/voice/services/GeminiCommandService.ts:103-105` |
| **Impacto** | Output do AI pode conter conteúdo malicioso |

```typescript
const playerName: string | undefined = data.playerName || undefined;
// Sem sanitizeInput() — AI output confiado diretamente
```

---

### M5. Jersey Numbers Sem Type Checking

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `src/features/teams/components/AddPlayerForm.tsx:79-86` |
| **Impacto** | Aceita letras, caracteres especiais |

```tsx
<input type="tel" maxLength={3} value={number} onChange={e => setNumber(e.target.value)} />
// type="tel" é cosmético, maxLength é client-side only
```

**Fix:** Validar range 0-99, somente dígitos numéricos.

---

### M6. Spectator Data Sem Schema Validation

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `src/features/broadcast/services/SyncEngine.ts:196-250` |
| **Impacto** | GameState malicioso recebido sem validação |

Dados recebidos do Firestore são aceitos como `SyncSessionSchema` sem validação de schema. Um host malicioso pode enviar:
- Team names com scripts
- Scores como NaN/Infinity
- Objetos de jogadores inválidos

---

### M7. Erros de Config Expostos em `alert()`

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `src/contexts/AuthContext.tsx:90-113` |
| **Impacto** | Informações de infraestrutura expostas ao utilizador |

```typescript
alert(`Erro de Configuração: As seguintes chaves estão faltando no arquivo .env:\n\n${missingKeys.join('\n')}`);
// Expõe nomes de variáveis de ambiente e hostname
```

---

### M8. Filename Sem Path Traversal Protection

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `src/lib/storage/io.ts:59-62` |
| **Impacto** | Filenames com `../` podem causar path traversal |

```typescript
const safeFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
// "../../evil.json" passa nesta verificação
```

**Fix:** Sanitizar `../`, `./`, e caracteres especiais do filename.

---

### M9. Score Validation Max 200 (Muito Alto)

| Campo | Detalhe |
|-------|---------|
| **Arquivo** | `src/lib/utils/security.ts:46-53` |
| **Impacto** | Limite de score muito permissivo |

```typescript
if (result > 200) return false;  // 200 é excessivo
```

**Fix:** Usar `pointsPerSet` da config como limite dinâmico (tipicamente 25-30 + margem de deuce).

---

## LOW — Melhorias Recomendadas

### L1. Security Headers Não Configurados

Headers ausentes (devem ser configurados no Firebase Hosting / CDN):
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(self), geolocation=()`

**Configurar em `firebase.json`:**
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
        ]
      }
    ]
  }
}
```

---

### L2. Firestore — Sem Timestamp Validation

Nenhuma regra usa `request.time` para validar timestamps ou expiração de sessões. Sessões de broadcast podem persistir indefinidamente.

**Fix:** Adicionar `request.time < resource.data.expiresAt` para sessões.

---

### L3. Storage — Limite 5MB Generoso

`storage.rules` permite uploads de até 5MB. Para avatares e logos, 1-2MB é suficiente.

---

### L4. Broadcast — Sem Transaction Safety

Writes debounced em `TimeoutSyncService` não usam Firestore transactions. Race conditions possíveis com múltiplas tabs.

---

### L5. Capacitor — Sem `allowNavigation` Whitelist

`capacitor.config.ts` não define `allowNavigation`, permitindo navegação para qualquer domínio.

**Fix:**
```typescript
allowNavigation: [
  'volleyscore-pro.firebaseapp.com',
  'accounts.google.com'
]
```

---

### L6. Profile Linking Sem Verificação

`useProfileSync.ts:55-68` — Perfil linkado ao Firebase user por `firebaseUid` sem verificação criptográfica. Se o campo for spoofed no Firestore, o perfil errado é carregado.

---

## DEPENDENCY VULNERABILITIES — npm audit

**Total: 23 vulnerabilidades** (15 moderate, 7 high, 1 critical)

### Critical

| Pacote | CVEs | Fix |
|--------|------|-----|
| **jspdf** ≤4.1.0 | 8 CVEs (Path Traversal, JS Injection, DoS, XMP Injection) | `npm install jspdf@4.2.0` |

### High

| Pacote | Vulnerabilidade | Fix |
|--------|----------------|-----|
| **rollup** <4.59.0 | Arbitrary File Write via Path Traversal (GHSA-mw96-cpmx-2vgc) | `npm audit fix` |
| **tar** ≤7.5.7 | Symlink Poisoning + File Overwrite (4 CVEs) | Sem fix (via @capacitor/cli) |
| **minimatch** (5 instâncias) | ReDoS via wildcards (3 CVEs) | Sem fix direto |
| **@capacitor/cli** | Via tar vulnerability | Aguardar update do Capacitor |

### Moderate

| Pacote | Vulnerabilidade | Fix |
|--------|----------------|-----|
| **firebase** (via undici ≤6.22.0) | Afeta @firebase/auth, firestore, functions, storage | `npm audit fix` |
| **esbuild** ≤0.24.2 | Dev server request forwarding | `npm audit fix --force` (breaking: vite@7) |
| **ajv** | ReDoS com `$data` option | `npm audit fix` |
| **lodash** 4.x | Prototype Pollution em `_.unset`/`_.omit` | `npm audit fix` |

### Ação recomendada:
```bash
# Fix não-breaking primeiro
npm audit fix

# Depois atualizar jsPDF manualmente
npm install jspdf@4.2.0

# Testar geração de PDFs após atualização
npm run test
```

---

## PONTOS POSITIVOS — Boas Práticas Encontradas

| Área | Status | Detalhe |
|------|--------|---------|
| XSS Prevention | ✅ PASS | Zero uso de `dangerouslySetInnerHTML`, `innerHTML`, `eval()`, `document.write` |
| Input Sanitization | ✅ PASS | `sanitizeInput()` multi-layer em `src/lib/utils/security.ts` — remove `<>/"'\`\\`, protocolos perigosos, e event handlers |
| Export Security | ✅ PASS | Strip automático de `userApiKey`, `accessToken`, `refreshToken` antes de export |
| Console Stripping | ✅ PASS | `esbuild: { drop: ['console', 'debugger'] }` remove todos os console em produção |
| Source Maps | ✅ PASS | `sourcemap: false` em produção — sem reverse engineering |
| Firebase App Check | ✅ PASS | reCAPTCHA Enterprise configurado para proteção contra bots |
| OAuth Flow | ✅ PASS | Google OAuth via Firebase Auth + Capacitor plugin nativo (sem senhas armazenadas) |
| HTTPS Enforcement | ✅ PASS | `androidScheme: 'https'` no Capacitor config |
| Service Worker | ✅ PASS | Cache restritivo, apenas Google Fonts como CDN externo, `cleanupOutdatedCaches: true` |
| Code Minification | ✅ PASS | esbuild minification + tree-shaking otimizado |
| Dynamic Imports | ✅ PASS | Todos usam paths hardcoded (sem input do utilizador) |
| URL Construction | ✅ PASS | URLs construídas a partir de env vars, não de input do utilizador |
| Fetch Calls | ✅ PASS | Respostas validadas com `response.ok` check e error handling |
| Voice Commands | ✅ PASS | Whitelist-based command matching, sem eval de transcrições |

---

## PLANO DE AÇÃO PRIORITÁRIO

### Semana 1 — ANTES do Lançamento (Critical + High)

| # | Ação | Severidade | Esforço |
|---|------|-----------|---------|
| 1 | Revogar e rotacionar TODAS as API keys (Firebase + Gemini) | CRITICAL | 30 min |
| 2 | Limpar histórico git dos `.env` files | CRITICAL | 1 hora |
| 3 | Fix Firestore rules: auth obrigatória em `live_matches`/`spectators` | CRITICAL | 30 min |
| 4 | Implementar `sanitizeForFirebase()` no SyncEngine | CRITICAL | 1 hora |
| 5 | Adicionar regras Firestore para `global_leaderboard` | CRITICAL | 30 min |
| 6 | Atualizar jsPDF para v4.2.0 + testar PDFs | CRITICAL | 1 hora |
| 7 | Executar `npm audit fix` | HIGH | 15 min |
| 8 | Fix Storage rules: ownership check em avatar/logo | HIGH | 30 min |
| 9 | Remover senha hardcoded do dev mode | HIGH | 30 min |
| 10 | Sanitizar player names em AddPlayerForm + BatchInput | HIGH | 30 min |
| 11 | Implementar logout completo (limpar todos os storages) | HIGH | 1 hora |
| 12 | Corrigir ErrorBoundary para mensagens genéricas em prod | HIGH | 30 min |

### Semana 2 — Hardening (Medium)

| # | Ação | Severidade | Esforço |
|---|------|-----------|---------|
| 13 | Remover `unsafe-eval` da CSP | HIGH | 2 horas |
| 14 | Adicionar schema validation nas Firestore rules | MEDIUM | 2 horas |
| 15 | Validar GameConfig antes de dispatch (enums + ranges) | MEDIUM | 1 hora |
| 16 | Sanitizar voice input playerName | MEDIUM | 15 min |
| 17 | Corrigir filename path traversal em io.ts | MEDIUM | 15 min |
| 18 | Validar jersey numbers (0-99, somente dígitos) | MEDIUM | 15 min |
| 19 | Remover backup localStorage (ou encriptar) | MEDIUM | 30 min |
| 20 | Mascarar erros de config em produção (AuthContext) | MEDIUM | 30 min |

### Semana 3 — Best Practices (Low + Improvements)

| # | Ação | Severidade | Esforço |
|---|------|-----------|---------|
| 21 | Configurar security headers no Firebase Hosting | LOW | 30 min |
| 22 | Adicionar `allowNavigation` whitelist no Capacitor | LOW | 15 min |
| 23 | Implementar backend proxy para Gemini API | LOW | 4 horas |
| 24 | Adicionar timestamp validation nas Firestore rules | LOW | 30 min |
| 25 | Reduzir limite de upload de 5MB para 2MB | LOW | 5 min |
| 26 | Usar Firestore transactions para broadcast writes | LOW | 1 hora |
| 27 | Criar `.env.example` com placeholders | LOW | 10 min |

---

## OWASP TOP 10 — STATUS

| # | Vulnerabilidade | Status | Notas |
|---|----------------|--------|-------|
| A01 | Broken Access Control | ⚠️ PARCIAL | Firestore rules precisam de ownership checks |
| A02 | Cryptographic Failures | ⚠️ PARCIAL | API keys expostas no git, localStorage sem encriptação |
| A03 | Injection | ✅ BOM | React auto-escapes, sanitizeInput() existe, mas cobertura incompleta |
| A04 | Insecure Design | ⚠️ PARCIAL | Senha dev hardcoded, GameConfig sem validação |
| A05 | Security Misconfiguration | ⚠️ PARCIAL | CSP permissiva, headers ausentes |
| A06 | Vulnerable Components | ❌ FALHA | jsPDF critical, 23 npm vulnerabilities |
| A07 | Auth Failures | ✅ BOM | Firebase Auth sólido, mas logout incompleto |
| A08 | Data Integrity | ⚠️ PARCIAL | sanitizeForFirebase() inexistente |
| A09 | Logging Failures | ✅ BOM | Console stripped em prod, ErrorBoundary precisa fix |
| A10 | SSRF | ✅ BOM | URLs vindas de env vars, não de input do utilizador |

---

## CONCLUSÃO

O VolleyScore-Pro está **bem construído em termos de arquitetura de segurança**, com práticas como React auto-escaping, Firebase Auth, App Check, e sanitização de input já implementadas. No entanto, existem **5 problemas críticos** que devem ser resolvidos antes de qualquer lançamento público:

1. **Rotacionar API keys** expostas no git
2. **Restringir Firestore rules** para dados de broadcast
3. **Implementar sanitizeForFirebase()** que está faltando
4. **Proteger global_leaderboard** com regras de ownership
5. **Atualizar jsPDF** para resolver 8 CVEs

Com as correções das semanas 1-2, o aplicativo estará em condição segura para lançamento. As melhorias da semana 3 são best practices que aumentam a postura de segurança a longo prazo.

---

*Relatório gerado por Claude Code (Opus 4.6) em 2026-02-27*
*Metodologia: OWASP Top 10 adaptado para PWA + Firebase*

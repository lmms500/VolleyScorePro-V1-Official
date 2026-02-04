# ✅ Verificação de Funcionalidades - VolleyScore Pro v2

## 🎯 CHECKLIST DE VALIDAÇÃO

### 1. VolleyLink Live (Real-time Broadcasting)

#### 1.1 Modo Host
- [ ] Abrir app em https://volleyscore-pro.web.app
- [ ] Iniciar uma partida
- [ ] Clique no ícone de Live Sync (Radio icon)
- [ ] Selecione "Broadcast Match"
- [ ] Verifique que um código de 6 dígitos foi gerado
- [ ] Notificação mostra "Session {code} Started"
- [ ] Estado: Host (verificar em Settings)

**Espera-se**: 
- Código visível e copiável
- Feedback visual (toast notification)
- Sessão criada no Firebase

#### 1.2 Modo Spectator
- [ ] Abrir app em outro dispositivo/aba
- [ ] Clique em Live Sync
- [ ] Selecione "Watch Match"
- [ ] Digite o código de 6 dígitos
- [ ] Aperte "Conectar"
- [ ] Notificação mostra "Connected to Room {code}"
- [ ] Placar começa a sincronizar em tempo real
- [ ] Não consegue editar o score (botões desabilitados)

**Espera-se**:
- Placar atualiza em tempo real no spectator
- Score do host aparece no spectator
- Spectator não consegue adicionar pontos
- Desconexão automática se mudar aba

#### 1.3 OBS Overlay
- [ ] Em Host, clique em "Copy Overlay Link (OBS)"
- [ ] Link deve estar no formato: `?mode=broadcast&code=XXXXXX`
- [ ] Cole URL em OBS → Add Source → Browser
- [ ] Verifique que o overlay renderiza
- [ ] Placar visível e sem barras de navegação
- [ ] Tema escuro (bom pra green screen)
- [ ] Animações suaves ao atualizar score

**Espera-se**:
- Link copiado automaticamente
- Overlay renderiza completo
- Score atualiza ao vivo no OBS
- Qualidade 60fps

---

### 2. Cloud Sync (Firebase)

#### 2.1 Google Authentication
- [ ] Vá em Settings > System
- [ ] Clique "Sign in with Google"
- [ ] Selecione conta Google
- [ ] Volte pra Settings após login
- [ ] Dever estar logado (mostra email/username)

**Espera-se**:
- Login funciona sem erro
- Sessão persiste após reload
- User info aparece em Settings

#### 2.2 Cloud Sync
- [ ] Crie uma partida com alguns dados
- [ ] Adicione alguns jogadores ao time
- [ ] Vá em Settings > System
- [ ] Clique "Cloud Sync"
- [ ] Aguarde status mudar pra "Synced!"
- [ ] Checkmark verde aparece
- [ ] Abre outro navegador/dispositivo
- [ ] Faz login com mesmo Google
- [ ] Clique "Cloud Sync"
- [ ] Dados aparecem (histórico, perfis)

**Espera-se**:
- Dados sincronizam bidirecional
- Histórico aparece em ambos dispositivos
- Perfis de jogadores em sync
- Merge sem duplicatas
- Timestamps corretos

---

### 3. Backup Local

#### 3.1 Exportar Backup
- [ ] Vá em Settings > System
- [ ] Clique "Generate Backup"
- [ ] Arquivo JSON deve baixar automaticamente
- [ ] Nome: `volleyscore_backup_YYYY-MM-DD.json`
- [ ] Abra o JSON em editor de texto
- [ ] Verifique estrutura:
  ```json
  {
    "meta": { "version": "2.0.0", ... },
    "data": { "history": [...], "profiles": [...] }
  }
  ```

**Espera-se**:
- Download automático
- Nome descritivo com data
- Schema válido
- Dados não criptografados (JSON puro)

#### 3.2 Restaurar Backup
- [ ] Limpe os dados locais (ou abra em incógnito)
- [ ] Vá em Settings > System
- [ ] Clique "Restore Backup"
- [ ] Selecione arquivo JSON baixado
- [ ] Aguarde "Parsing..." > "Restoring..."
- [ ] Notificação "Restored successfully"
- [ ] App recarrega automaticamente
- [ ] Dados anteriores aparecem:
  - Histórico de partidas
  - Perfis de jogadores
  - Estado do jogo

**Espera-se**:
- File picker abre
- Validação JSON OK
- Dados restauram atomicamente
- Reload automático
- Sem perda de dados

---

### 4. Integração & Edge Cases

#### 4.1 Offline Resilience
- [ ] Inicie Host com Live Sync ativo
- [ ] Desative internet (Airplane mode)
- [ ] Adicione alguns pontos
- [ ] Observe fila de sync (badge no ícone)
- [ ] Ative internet novamente
- [ ] Dados devem sincronizar automaticamente

**Espera-se**:
- Fila visual do offline
- Auto-flush ao conectar
- Nenhum dado perdido

#### 4.2 Múltiplos Spectators
- [ ] Host em Device A
- [ ] Spectator 1 em Device B
- [ ] Spectator 2 em Device C
- [ ] Todos com mesmo código
- [ ] Host adiciona ponto
- [ ] B e C veem atualização simultaneamente

**Espera-se**:
- Todos conectados
- Sincronização em paralelo
- Sem lag apreciável

#### 4.3 Data Merge
- [ ] Crie partida no Device A
- [ ] Crie partida diferente no Device B
- [ ] Cloud Sync em A
- [ ] Cloud Sync em B
- [ ] Ambas partidas deveriam estar em cada device

**Espera-se**:
- Merge sem duplicatas
- IDs únicos respeitados
- Timestamps mantidos

---

## 🔧 TROUBLESHOOTING

### Issue: "Firebase not initialized"
**Solução**: 
- Verificar .env com VITE_FIREBASE_* keys
- Recarregar página
- Limpar cache do navegador

### Issue: Code não sincroniza
**Solução**:
- Verificar internet ativa
- Código deve ter 6 dígitos
- Host deve estar logado (pra sync)
- Verificar Firestore Rules em Console

### Issue: Backup não restaura
**Solução**:
- JSON corrompido? Tentar outro backup
- Schema inválido? Verificar estrutura
- Espaço em disco? Limpar localStorage
- Versão incompatível? Usar backup mais recente

### Issue: Google Sign-In falha
**Solução**:
- Firebase Console → verificar OAuth2 redirects
- Permitir localhost:5173 pra dev
- Verificar googleProvider inicializado

---

## 📊 VERIFICAÇÃO TÉCNICA

### Services Verificados
```typescript
✅ SyncEngine.hostMatch()
✅ SyncEngine.broadcastState()
✅ SyncEngine.subscribeToMatch()
✅ SyncService.pullMatches()
✅ SyncService.pushMatches()
✅ SyncService.pullProfiles()
✅ SyncService.pushProfiles()
✅ BackupService.generateBackup()
✅ BackupService.restoreBackup()
✅ AuthContext.signInWithGoogle()
```

### Firebase Rules Verificadas
```
✅ /users/{uid}/matches → UID check
✅ /users/{uid}/profiles → UID check
✅ /live_matches/{id} → Host UID check
```

### LocalStorage Verificadas
```
✅ sync_pending_queue
✅ vsp_game_core
✅ vsp_game_logs
✅ player_profiles_master
✅ vsp_matches_v1
```

---

## 🎬 DEMONSTRAÇÃO RÁPIDA (5 min)

### 1. Setup
1. Abra 2 abas: uma pra Host, uma pra Spectator
2. Ambas em https://volleyscore-pro.web.app

### 2. Host Setup (Aba 1)
```
- Clique em novo jogo
- Vá em Live Sync
- Clique "Broadcast Match"
- Copie o código de 6 dígitos
```

### 3. Spectator Setup (Aba 2)
```
- Clique em Live Sync
- Clique "Watch Match"
- Cole o código de 6 dígitos
- Aperte "Conectar"
```

### 4. Interação
```
- No Host, clique "Score A" algumas vezes
- No Spectator, observe o score atualizar em RT
- Vire pra OBS overlay mode
- Veja overlay sincronizando
```

### 5. Cloud Sync
```
- Host: Vá em Settings > Cloud Sync
- Faça login com Google
- Clique "Cloud Sync" pra sincronizar
- Abra outro dispositivo/incógnito
- Faça login com mesmo Google
- Dados aparecem!
```

### 6. Backup
```
- Host: Vá em Settings > Backup
- Clique "Generate Backup"
- JSON baixa
- Clique "Restore Backup"
- Selecione o JSON
- Dados restauram!
```

---

## ✨ RESULTADO ESPERADO

Após passar por todos os testes:

✅ VolleyLink Live completamente funcional  
✅ Host transmitindo ao vivo  
✅ Spectators assistindo em tempo real  
✅ OBS overlay renderizando  
✅ Google Auth funcionando  
✅ Cloud Sync sincronizando  
✅ Backup exportando JSON  
✅ Restore funcionando  

**Status Final**: 🟢 **PRONTO PARA PRODUÇÃO**

---

**Data**: 2025-12-30  
**Versão**: 2.0.6  
**Ambiente**: https://volleyscore-pro.web.app

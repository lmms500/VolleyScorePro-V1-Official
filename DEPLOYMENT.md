# 🚀 DEPLOYMENT - VolleyScore Pro v2

## Firebase Hosting Setup Completo

### ✅ Arquivos de Configuração Criados

1. **`.firebaserc`** - Vincula o projeto ao Firebase
2. **`firebase.json`** - Configuração de hosting e cache
3. **`package.json`** - Scripts de deployment adicionados

### 📋 Pré-requisitos

- ✅ Firebase CLI instalado (`npm install -g firebase-tools`)
- ✅ Conta Google ativa
- ✅ Projeto Firebase criado (volleyscore-pro)
- ✅ `.env` preenchido com credenciais Firebase

### 🔐 Autenticação (Primeira vez)

Execute uma vez para fazer login:

```bash
firebase login
```

Será aberto o navegador para autenticar com sua conta Google.

### 🚀 Deploy

#### **Opção 1: Deploy Completo (Recomendado)**
```bash
npm run deploy
```
Faz build e faz deploy de todos os serviços.

#### **Opção 2: Deploy apenas Hosting**
```bash
npm run deploy:hosting
```
Mais rápido se não alterou Firestore/Storage.

#### **Opção 3: Manual**
```bash
npm run build          # Gera dist/
firebase deploy        # Faz upload
```

### ✨ O que acontece no deploy:

1. **TypeScript Compile** → Verifica tipos
2. **Vite Build** → Gera arquivos otimizados em `dist/`
3. **PWA Build** → Gera Service Worker
4. **Firebase Upload** → Faz upload para hosting

### 📊 Monitorar Deploy

```bash
firebase deploy --debug    # Ver logs detalhados
firebase hosting:list      # Listar deploys anteriores
firebase hosting:channel:list  # Ver canais de preview
```

### 🌐 URLs

Após deploy, sua app estará em:
- **Production**: `https://volleyscore-pro.web.app`
- **Preview**: `https://volleyscore-pro--CHANNEL.web.app`

### 🔍 Verificar Status

```bash
firebase projects:list
firebase projects:describe volleyscore-pro
```

### ♻️ Rollback (Reverter Deploy Anterior)

```bash
firebase hosting:rollback
```

### 📱 Mobile Testing

Se quiser testar em dispositivo móvel antes de publicar:

```bash
firebase hosting:channel:create preview
npm run build
firebase deploy --only hosting:volleyscore-pro --channel=preview
```

Compartilhe o link gerado (ex: `https://volleyscore-pro--preview.web.app`) para testar.

### 🚨 Troubleshooting

**Erro: "Permission denied"**
```bash
firebase logout && firebase login
```

**Erro: "Project not found"**
Verifique `.firebaserc`:
```json
{
  "projects": {
    "default": "volleyscore-pro"
  }
}
```

**Erro: "public directory not found"**
Execute `npm run build` primeiro.

---

## 🎯 Seu Próximo Passo

1. Execute `firebase login` e autentique
2. Execute `npm run deploy:hosting`
3. Acesse `https://volleyscore-pro.web.app` 🎉

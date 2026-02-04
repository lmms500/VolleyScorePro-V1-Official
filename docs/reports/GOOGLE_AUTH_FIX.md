# 🔧 Configuração do Google OAuth - Firebase Console

## ⚠️ PROBLEMA IDENTIFICADO

O login com Google não está funcionando porque o domínio precisa ser autorizado no Firebase Console.

---

## 🛠️ SOLUÇÃO - PASSO A PASSO

### 1. Acesse o Firebase Console

1. Vá para: https://console.firebase.google.com
2. Selecione o projeto: **volleyscore-pro**
3. No menu lateral, clique em: **Authentication** (Autenticação)

---

### 2. Configure o Google Sign-In

#### Passo 1: Ativar Google Provider
1. Clique na aba **Sign-in method** (Método de login)
2. Localize **Google** na lista de provedores
3. Clique em **Google** para editar

#### Passo 2: Adicionar Domínios Autorizados
Na seção **Authorized domains** (Domínios autorizados), adicione:

```
localhost
volleyscore-pro.web.app
volleyscore-pro.firebaseapp.com
```

#### Passo 3: Salvar
1. Clique em **Save** (Salvar)
2. Aguarde alguns segundos para propagar

---

### 3. Verifique a Configuração OAuth

1. Ainda em **Authentication** > **Sign-in method**
2. Role até **Authorized domains** (Domínios autorizados)
3. Certifique-se que os seguintes domínios estão listados:
   - ✅ `localhost`
   - ✅ `volleyscore-pro.web.app`
   - ✅ `volleyscore-pro.firebaseapp.com`

---

### 4. Configure o Google Cloud Console (Opcional, se ainda não funcionar)

1. Acesse: https://console.cloud.google.com
2. Selecione o projeto: **volleyscore-pro**
3. Menu lateral: **APIs & Services** > **Credentials**
4. Localize o **OAuth 2.0 Client ID** criado pelo Firebase
5. Edite e adicione em **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:4173
   https://volleyscore-pro.web.app
   https://volleyscore-pro.firebaseapp.com
   ```

6. Adicione em **Authorized redirect URIs**:
   ```
   http://localhost:5173/__/auth/handler
   http://localhost:4173/__/auth/handler
   https://volleyscore-pro.web.app/__/auth/handler
   https://volleyscore-pro.firebaseapp.com/__/auth/handler
   ```

7. Clique em **Save** (Salvar)

---

## � CONFIGURAÇÃO ANDROID (IMPORTANTE)

### ⚠️ ATENÇÃO: SHA-1 Fingerprint Obrigatório

Para que o login do Google funcione em **apps Android nativos**, você precisa adicionar a impressão digital SHA-1 do certificado de assinatura.

### Passo 1: Gerar SHA-1 Fingerprint

#### Para Debug (Desenvolvimento):
```bash
# Windows (PowerShell)
cd android
.\gradlew signingReport

# Ou usando keytool diretamente:
keytool -list -v -keystore C:\Users\<SEU_USER>\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### Para Release (Produção):
```bash
keytool -list -v -keystore <CAMINHO_DO_SEU_KEYSTORE> -alias <SEU_ALIAS>
```

**Você verá algo como:**
```
SHA1: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0
```

### Passo 2: Adicionar SHA-1 no Firebase Console

1. Acesse: https://console.firebase.google.com/project/volleyscore-pro/settings/general
2. Role até a seção **Seus apps**
3. Localize o app Android (com.volleyscore.pro ou similar)
4. Clique em **Adicionar impressão digital**
5. Cole o SHA-1 que você copiou
6. Clique em **Salvar**

### Passo 3: Baixar google-services.json Atualizado

1. Ainda em **Configurações do projeto** > **Seus apps**
2. Clique no app Android
3. Clique em **Baixar google-services.json**
4. Substitua o arquivo em: `android/app/google-services.json`

### 📋 Checklist Android OAuth:
- ✅ SHA-1 de Debug adicionado (para testes)
- ✅ SHA-1 de Release adicionado (para produção)
- ✅ google-services.json atualizado
- ✅ Package name correto: `com.volleyscore.pro`
- ✅ Google Sign-In ativado no Firebase

**Documentação Oficial**: https://developers.google.com/android/guides/client-auth?hl=pt-br

---

## �🧪 TESTANDO APÓS CONFIGURAÇÃO

### Teste Local (Development)
1. Execute: `npm run dev`
2. Abra: http://localhost:5173
3. Vá em Settings > System
4. Clique em "Sign in with Google"
5. Pop-up deve abrir e permitir selecionar conta Google
6. Após autorizar, você deve estar logado

### Teste em Produção
1. Acesse: https://volleyscore-pro.web.app
2. Vá em Settings > System
3. Clique em "Sign in with Google"
4. Pop-up deve abrir e funcionar normalmente

---

## ✅ RESULTADO ESPERADO

Após configurar:
- ✅ Pop-up abre normalmente
- ✅ Mostra lista de contas Google
- ✅ Após selecionar conta, faz login automático
- ✅ Aparece nome/email do usuário em Settings
- ✅ Botão "Broadcast Match" funciona (pede login se não estiver logado)

---

## 🔍 VERIFICAÇÃO ADICIONAL

Se ainda não funcionar, verifique no **Console do Navegador** (F12):

### Erros Comuns:

#### 1. "auth/unauthorized-domain"
**Solução**: Adicionar domínio em Firebase Console > Authentication > Authorized domains

#### 2. "redirect_uri_mismatch"
**Solução**: Adicionar redirect URI no Google Cloud Console

#### 3. "popup_closed_by_user"
**Normal**: Usuário fechou o popup antes de completar login

#### 4. "auth/popup-blocked"
**Solução**: Permitir pop-ups no navegador para volleyscore-pro.web.app

---

## 📝 CONFIGURAÇÃO ATUAL

Atualmente o código está configurado para:
- **Desktop**: Usar `signInWithPopup` (mais rápido)
- **Mobile**: Usar `signInWithRedirect` (melhor UX)
- **Fallback**: Se Firebase não inicializado, mostra warning

---

## 🚀 PRÓXIMOS PASSOS

Após configurar o Firebase Console:

1. Execute build: `npm run build`
2. Faça deploy: `firebase deploy --only hosting`
3. Teste em produção: https://volleyscore-pro.web.app
4. Verifique que login funciona
5. Teste VolleyLink Live (Broadcast Match)

---

## 📞 SUPORTE

Se ainda não funcionar após seguir todos os passos:

1. Verifique logs no Console do Firebase: https://console.firebase.google.com/project/volleyscore-pro/analytics
2. Abra DevTools (F12) e copie qualquer erro
3. Verifique que Firebase Auth está habilitado
4. Tente limpar cache do navegador (Ctrl+Shift+Delete)

---

**Última Atualização**: 2025-12-30

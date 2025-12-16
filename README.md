# VolleyScore Pro v2 - Deployment Guide

Este projeto foi exportado do Google AI Studio. Siga os passos abaixo para configurar o ambiente de desenvolvimento local com acesso ao terminal.

## 1. Pré-requisitos

Certifique-se de ter instalado na sua máquina:
*   **Node.js** (v18 ou superior)
*   **NPM** ou **Yarn**
*   **Android Studio** (para compilar Android)
*   **Xcode** (para compilar iOS - apenas Mac)

## 2. Instalação Inicial

Abra o terminal na pasta raiz do projeto e execute:

```bash
# 1. Instalar dependências
npm install

# 2. Compilar a versão Web (Gera a pasta 'dist')
npm run build

# 3. Inicializar o Capacitor (caso não tenha as pastas android/ios)
npx cap add android
npx cap add ios
```

## 3. Sincronização Nativa

Sempre que você alterar código JS/React, você precisa sincronizar com a camada nativa:

```bash
# Copia a pasta 'dist' para dentro das plataformas nativas
npm run cap:sync
```

## 4. Rodar no Emulador/Dispositivo

```bash
# Abrir no Android Studio
npm run android

# Abrir no Xcode (iOS)
npm run ios
```

## 5. Plugins Nativos Adicionais

O código atual possui "Mocks" (simulações) para rodar na Web. Para ativar funcionalidades reais nativas (Ads, Google Auth), instale os plugins oficiais:

```bash
# AdMob (Propaganda)
npm install @capacitor-community/admob

# Google Auth
npm install @codetrix-studio/capacitor-google-auth
```

Após instalar, rode `npm run cap:sync` novamente.

## 6. Variáveis de Ambiente

Crie um arquivo `.env` na raiz para suas chaves de API (opcional para dev, obrigatório para prod):

```env
VITE_FIREBASE_API_KEY=sua_chave_aqui
VITE_GEMINI_API_KEY=sua_chave_aqui
```

# PRD - Lote 1: Infraestrutura e Core UI
**VolleyScore Pro v2 - Spec-Driven Development**

---

## 🎯 Objetivo

Estabelecer a **fundação arquitetural** do VolleyScore Pro v2, implementando:
- **Configuração do Agente** (.clinerules já criado ✅)
- **Estrutura de Pastas** padronizada
- **Design System** (cores Neo-Glass)
- **Hook de Safe Area** (responsividade mobile)
- **Contexto de Tema** (Dark Mode)
- **Componente ModalHeader** (base para modais)

Este lote **NÃO** inclui lógica de jogo. Foco total em infraestrutura visual e responsiva.

---

## 📋 Status da Análise

### ✅ Dependências Verificadas
Todas as dependências necessárias **JÁ ESTÃO INSTALADAS**:
- ✅ `framer-motion@11.0.0` - Animações
- ✅ `lucide-react@0.460.0` - Ícones
- ✅ `tailwindcss@3.4.19` - Estilização
- ✅ `react@19.0.0` + `react-dom@19.0.0`

**Nenhuma instalação adicional necessária.**

### 📁 Estrutura de Pastas Existente

| Pasta | Status |
|-------|--------|
| `src/components/ui/` | ✅ Existe (18 arquivos) |
| `src/components/modals/` | ✅ Existe (16 arquivos) |
| `src/hooks/` | ✅ Existe (26 arquivos) |
| `src/contexts/` | ✅ Existe (8 arquivos) |
| `src/stores/` | ✅ Existe (2 arquivos) |
| `src/services/` | ✅ Existe (19 arquivos) |
| `src/utils/` | ✅ Existe (10 arquivos) |
| `src/types/` | ✅ Existe (3 arquivos) |
| `src/theme/` | ❌ **NÃO EXISTE** - Criar |
| `src/components/Court/` | ✅ Existe (3 arquivos) |

**Ação**: Criar apenas `src/theme/`.

### 📄 Arquivos Analisados

#### `src/App.tsx` (506 linhas)
- **Providers atuais** (ordem de wrapping):
  ```tsx
  <LayoutProvider>
    <ErrorBoundary>
      <AuthProvider>
        <TimerProvider>
          <GameProvider>
            <ModalProvider>
              <NotificationProvider>
                <GameContent />
  ```
- **Onde injetar ThemeProvider**: **Entre `LayoutProvider` e `ErrorBoundary`** (primeiro provider lógico)

#### `src/index.css` (154 linhas)
- **Safe Area Variables** já definidas (linhas 78-82):
  ```css
  :root {
    --sat: env(safe-area-inset-top);
    --sar: env(safe-area-inset-right);
    --sab: env(safe-area-inset-bottom);
    --sal: env(safe-area-inset-left);
  }
  ```
- **Ação**: Nenhuma modificação necessária (já correto)

---

## 📝 Lista de Arquivos a Criar

### 1. `src/theme/colors.ts` (NOVO)
**Propósito**: Centralizar paleta de cores do Design System Neo-Glass.

**Conteúdo**:
```typescript
/**
 * VolleyScore Pro v2 - Design System Colors
 * Neo-Glass Premium Palette
 */

export const colors = {
  // === BACKGROUNDS (Neo-Glass) ===
  background: {
    primary: '#020617',    // slate-950 (OLED-friendly, nunca #000)
    secondary: '#0f172a',  // slate-900 (cards, modals)
    tertiary: '#1e293b',   // slate-800 (elevações secundárias)
  },

  // === ACCENT COLORS (Team Colors) ===
  accent: {
    teamA: {
      default: '#6366f1',   // indigo-500
      light: '#818cf8',     // indigo-400
      dark: '#4f46e5',      // indigo-600
    },
    teamB: {
      default: '#f43f5e',   // rose-500
      light: '#fb7185',     // rose-400
      dark: '#e11d48',      // rose-600
    },
  },

  // === TEXT ===
  text: {
    primary: '#f8fafc',     // slate-50 (high contrast)
    secondary: '#cbd5e1',   // slate-300 (labels)
    tertiary: '#94a3b8',    // slate-400 (subtle hints)
    disabled: '#64748b',    // slate-500
  },

  // === BORDERS ===
  border: {
    subtle: 'rgba(255, 255, 255, 0.05)',   // Glassmorphism
    medium: 'rgba(255, 255, 255, 0.10)',
    strong: 'rgba(255, 255, 255, 0.20)',
  },

  // === STATES (Semantic) ===
  states: {
    success: '#10b981',     // emerald-500 (vitórias, confirmações)
    warning: '#f59e0b',     // amber-500 (avisos, MVP)
    error: '#ef4444',       // red-500 (erros, deletar)
    info: '#3b82f6',        // blue-500 (notificações neutras)
  },

  // === GRADIENTS (Backgrounds dinâmicos) ===
  gradients: {
    teamA: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    teamB: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    neutral: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
  },

  // === SHADOWS (Elevações) ===
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(99, 102, 241, 0.3)', // Indigo glow
  },
} as const;

export type ColorTheme = keyof typeof colors;
```

---

### 2. `src/hooks/useSafeAreaInsets.ts` (NOVO)
**Propósito**: Ler safe areas do dispositivo (notch, home bar) e expor como state React.

**Conteúdo**:
```typescript
import { useState, useEffect } from 'react';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Hook para ler Safe Area Insets do CSS env()
 * Atualiza dinamicamente em mudanças de orientação
 */
export const useSafeAreaInsets = (): SafeAreaInsets => {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const updateInsets = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      const top = parseInt(computedStyle.getPropertyValue('--sat').replace('px', '')) || 0;
      let bottom = parseInt(computedStyle.getPropertyValue('--sab').replace('px', '')) || 0;
      const left = parseInt(computedStyle.getPropertyValue('--sal').replace('px', '')) || 0;
      const right = parseInt(computedStyle.getPropertyValue('--sar').replace('px', '')) || 0;

      // CRITICAL: Limitar bottom a 24px (evitar áreas mortas excessivas)
      bottom = Math.min(bottom, 24);

      setInsets({ top, bottom, left, right });
    };

    updateInsets();

    // Atualizar em resize (mudança de orientação)
    window.addEventListener('resize', updateInsets);
    window.addEventListener('orientationchange', updateInsets);

    return () => {
      window.removeEventListener('resize', updateInsets);
      window.removeEventListener('orientationchange', updateInsets);
    };
  }, []);

  return insets;
};
```

---

### 3. `src/contexts/ThemeContext.tsx` (NOVO)
**Propósito**: Gerenciar tema Light/Dark com persistência.

**Conteúdo**:
```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'volleyscore-theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicializa com dark mode (padrão do app)
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    return stored || 'dark';
  });

  useEffect(() => {
    // Aplicar classe no HTML root
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Persistir
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

---

### 4. `src/components/ui/ModalHeader.tsx` (NOVO)
**Propósito**: Header reutilizável para todos os modais (consistência visual).

**Conteúdo**:
```typescript
import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSafeAreaInsets } from '../../hooks/useSafeAreaInsets';

export interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  rightContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  showDivider?: boolean;
  scrolled?: boolean;  // Usado para adicionar shadow quando modal scrollou
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  onClose,
  rightContent,
  centerContent,
  showDivider = true,
  scrolled = false,
}) => {
  const { top } = useSafeAreaInsets();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`
        sticky top-0 z-50 w-full
        bg-slate-900/95 dark:bg-slate-950/95
        backdrop-blur-xl
        transition-all duration-300
        ${scrolled ? 'shadow-lg shadow-black/20' : ''}
        ${showDivider ? 'border-b border-white/5' : ''}
      `}
      style={{ paddingTop: `${top + 8}px` }}
    >
      <div className="flex items-center justify-between px-4 pb-3">
        {/* Left: Close Button */}
        <button
          onClick={onClose}
          className="
            p-2 -ml-2
            text-slate-400 hover:text-white
            hover:bg-white/5 active:bg-white/10
            rounded-full transition-all
            active:scale-95
          "
          aria-label="Fechar"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Center: Title or Custom Content */}
        {centerContent ? (
          <div className="flex-1 flex justify-center">{centerContent}</div>
        ) : (
          <div className="flex-1 flex flex-col items-center text-center px-4">
            <h2 className="text-base font-bold text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        )}

        {/* Right: Custom Actions */}
        <div className="w-9">
          {rightContent}
        </div>
      </div>
    </motion.header>
  );
};
```

---

## 🔧 Lista de Arquivos a Modificar

### 1. `src/App.tsx` (Linha 486-501)
**Modificação**: Adicionar `ThemeProvider` na hierarquia de providers.

**Diff XML**:
```xml
<change>
  <before>
function App() {
  return (
    <LayoutProvider>
      <ErrorBoundary>
        <AuthProvider>
  </before>
  <after>
function App() {
  return (
    <LayoutProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AuthProvider>
  </after>
</change>

<change>
  <before>
          </AuthProvider>
        </ErrorBoundary>
      </LayoutProvider>
  </before>
  <after>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </LayoutProvider>
  </after>
</change>
```

**Import a adicionar** (linha ~2):
```typescript
import { ThemeProvider } from './contexts/ThemeContext';
```

---

### 2. `src/index.css` (SEM MODIFICAÇÃO)
**Status**: Safe Area variables **JÁ ESTÃO CONFIGURADAS** corretamente (linhas 78-82).

✅ Nenhuma alteração necessária.

---

## 📦 Análise de Dependências

### Dependências Necessárias
Todas **JÁ INSTALADAS** no `package.json`:

| Dependência | Versão | Status |
|-------------|--------|--------|
| `react` | 19.0.0 | ✅ Instalado |
| `react-dom` | 19.0.0 | ✅ Instalado |
| `framer-motion` | 11.0.0 | ✅ Instalado |
| `lucide-react` | 0.460.0 | ✅ Instalado |
| `tailwindcss` | 3.4.19 | ✅ Instalado |

**Comandos de instalação**: ❌ **NENHUM** (tudo pronto)

---

## 🧪 Plano de Verificação

### Testes Automatizados
❌ **Não aplicável** - Este lote é puramente infraestrutura (sem lógica de negócio).

### Verificação Manual

#### ✅ Teste 1: Estrutura de Pastas
```bash
# Verificar se a pasta theme/ foi criada
ls src/theme/
# Esperado: colors.ts
```

#### ✅ Teste 2: Design System (colors.ts)
```typescript
// No console do navegador (após iniciar app):
import { colors } from './src/theme/colors';
console.log(colors.background.primary);
// Esperado: "#020617"
```

#### ✅ Teste 3: Safe Area Hook
1. Abrir app em dispositivo mobile (ou DevTools mobile mode)
2. Abrir console e executar:
```javascript
document.documentElement.style.setProperty('--sat', '44px'); // Simular notch
```
3. Verificar se componentes com `useSafeAreaInsets` atualizam padding

#### ✅ Teste 4: ThemeProvider
1. Iniciar app (`npm run dev`)
2. Abrir DevTools > Console
3. Executar:
```javascript
document.documentElement.classList.contains('dark'); // true
localStorage.getItem('volleyscore-theme'); // "dark"
```
4. Mudar tema (quando UI implementada) e verificar persistência

#### ✅ Teste 5: ModalHeader
1. Importar `ModalHeader` em qualquer modal existente
2. Renderizar com props:
```tsx
<ModalHeader
  title="Teste"
  subtitle="Subtítulo"
  onClose={() => console.log('Fechar')}
/>
```
3. Verificar:
   - Safe area top aplicada
   - Botão X funciona
   - Animação de entrada suave
   - Estilização Neo-Glass (backdrop-blur, border)

---

## 🚀 Plano de Execução (Ordem Sequencial)

### Fase 1: Estrutura Base (5 min)
1. ✅ **Criar pasta** `src/theme/`
2. ✅ **Criar arquivo** `src/theme/colors.ts` (copiar conteúdo acima)

### Fase 2: Hooks e Contextos (10 min)
3. ✅ **Criar arquivo** `src/hooks/useSafeAreaInsets.ts`
4. ✅ **Criar arquivo** `src/contexts/ThemeContext.tsx`

### Fase 3: Componentes UI (5 min)
5. ✅ **Criar arquivo** `src/components/ui/ModalHeader.tsx`

### Fase 4: Integração (5 min)
6. ✅ **Modificar** `src/App.tsx`:
   - Adicionar import de `ThemeProvider`
   - Inserir `<ThemeProvider>` na hierarquia (após `LayoutProvider`)

### Fase 5: Verificação (5 min)
7. ✅ **Executar** `npm run dev`
8. ✅ **Testar** no navegador (seguir Plano de Verificação)
9. ✅ **Verificar** console sem erros TypeScript/ESLint

---

## ⚠️ Riscos e Mitigações

### Risco 1: Conflito de Providers
**Probabilidade**: Baixa  
**Impacto**: Médio (app não inicia)  
**Mitigação**: `ThemeProvider` é simples (sem side effects). Posicioná-lo logo após `LayoutProvider` evita conflitos.

### Risco 2: Safe Area Insets não detectadas
**Probabilidade**: Baixa (variáveis CSS já existem)  
**Impacto**: Baixo (UI ficaria com padding zero)  
**Mitigação**: Fallback para `0` no hook. Testar em device real antes de produção.

### Risco 3: TypeScript Strict Mode
**Probabilidade**: Baixa  
**Impacto**: Médio (build falha)  
**Mitigação**: Todos os tipos estão explícitos. Executar `npm run build` antes de commit.

---

## 📊 Resumo Executivo

| Item | Status |
|------|--------|
| **Dependências** | ✅ Todas instaladas |
| **Pastas Existentes** | ✅ 7/8 (faltando apenas `theme/`) |
| **Arquivos a Criar** | 🟡 4 arquivos novos |
| **Arquivos a Modificar** | 🟡 1 arquivo (`App.tsx`) |
| **Complexidade** | 🟢 Baixa (código declarativo) |
| **Tempo Estimado** | ⏱️ 30 minutos |

---

## ✅ Checklist de Conclusão

- [ ] Pasta `src/theme/` criada
- [ ] `colors.ts` implementado e exportando objeto `colors`
- [ ] `useSafeAreaInsets.ts` criado com lógica de fallback
- [ ] `ThemeContext.tsx` criado e persistindo no localStorage
- [ ] `ModalHeader.tsx` criado com animações Framer Motion
- [ ] `App.tsx` modificado (ThemeProvider injetado)
- [ ] App inicia sem erros (`npm run dev`)
- [ ] Build de produção funciona (`npm run build`)
- [ ] ESLint sem erros

---

**Autor**: Antigravity AI (Spec-Driven Development)  
**Data**: 2026-02-04  
**Versão**: 1.0  
**Status**: ✅ Pronto para Implementação

# SPEC - Lote 1: Infraestrutura e Core UI
**Especificação Técnica de Implementação - SDD Fase 2**

---

## 📋 Instruções de Uso

Este documento contém **instruções à prova de falhas** para implementação do Lote 1.  
**Siga a ordem exata** das tarefas listadas abaixo.  
**Não pule etapas**. Cada tarefa indica se depende de tarefas anteriores.

---

## ✅ Pré-requisitos

Antes de iniciar, confirme:
- [ ] Você está no diretório raiz do projeto: `VolleyScore-Pro-Versão-1.0---Official/`
- [ ] O terminal está aberto
- [ ] Você tem permissão de escrita na pasta `src/`

---

## 🔧 Tarefas de Implementação

### Tarefa 0: Verificar/Criar Diretório `src/theme/`

**Ação:** CRIAR (se não existir)  
**Descrição:** Criação do diretório para centralizar o Design System.  
**Dependências:** Nenhuma

**Comando (Windows PowerShell)**:
```powershell
if (-Not (Test-Path "src\theme")) { New-Item -Path "src\theme" -ItemType Directory }
```

**Comando (Linux/macOS/Git Bash)**:
```bash
mkdir -p src/theme
```

**Verificação**:
```powershell
Test-Path "src\theme"  # Deve retornar: True
```

---

### Tarefa 1: Criar `src/theme/colors.ts`

**Ação:** CRIAR  
**Descrição:** Define a paleta de cores do Design System Neo-Glass. Este arquivo será importado por componentes UI para manter consistência visual.  
**Dependências:** Nenhuma

**Código Final Completo**:
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

**Verificação**:
- Arquivo existe em `src/theme/colors.ts` ✅
- Não há erros TypeScript no arquivo ✅

---

### Tarefa 2: Criar `src/hooks/useSafeAreaInsets.ts`

**Ação:** CRIAR  
**Descrição:** Hook personalizado que lê as Safe Area Insets do CSS (notch, home bar) e expõe como estado React. Atualiza automaticamente em mudanças de orientação.  
**Dependências:** Nenhuma (mas será usado por Tarefa 4)

**Código Final Completo**:
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

**Verificação**:
- Arquivo existe em `src/hooks/useSafeAreaInsets.ts` ✅
- Não há erros TypeScript no arquivo ✅
- Exporta interface `SafeAreaInsets` ✅
- Exporta função `useSafeAreaInsets` ✅

---

### Tarefa 3: Criar `src/contexts/ThemeContext.tsx`

**Ação:** CRIAR  
**Descrição:** Contexto React que gerencia o tema (light/dark) com persistência em localStorage. Aplica classe CSS no elemento HTML root.  
**Dependências:** Nenhuma (mas será usado por Tarefa 5)

**Código Final Completo**:
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

**Verificação**:
- Arquivo existe em `src/contexts/ThemeContext.tsx` ✅
- Não há erros TypeScript no arquivo ✅
- Exporta `ThemeProvider` (componente) ✅
- Exporta `useTheme` (hook) ✅

---

### Tarefa 4: Criar `src/components/ui/ModalHeader.tsx`

**Ação:** CRIAR  
**Descrição:** Componente reutilizável de header para modais. Usa Framer Motion para animações e Safe Area Insets para notch.  
**Dependências:** Tarefa 2 (`useSafeAreaInsets`)

**Código Final Completo**:
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

**Verificação**:
- Arquivo existe em `src/components/ui/ModalHeader.tsx` ✅
- Não há erros TypeScript no arquivo ✅
- Importa `useSafeAreaInsets` corretamente ✅
- Exporta `ModalHeader` (componente) ✅
- Exporta `ModalHeaderProps` (interface) ✅

---

### Tarefa 5: Modificar `src/App.tsx` - Adicionar ThemeProvider

**Ação:** MODIFICAR  
**Descrição:** Injetar o `ThemeProvider` na hierarquia de providers, entre `LayoutProvider` e `ErrorBoundary`.  
**Dependências:** Tarefa 3 (`ThemeContext`)

**Instruções Detalhadas**:

#### Passo 5.1: Adicionar Import

**Localização**: Procure a seção de imports no topo do arquivo (próximo à linha 2-50)

**Buscar por**:
```typescript
import { LayoutProvider } from './contexts/LayoutContext';
```

**Adicionar logo APÓS** essa linha:
```typescript
import { ThemeProvider } from './contexts/ThemeContext';
```

**Resultado Final da Seção de Imports** (deve incluir):
```typescript
import { LayoutProvider } from './contexts/LayoutContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
```

---

#### Passo 5.2: Modificar Hierarquia de Providers

**Localização**: Procure a função `App()` (aproximadamente linha 485-502)

**BUSCAR pelo trecho EXATO** (linhas 486-491):
```typescript
function App() {
  return (
    <LayoutProvider>
      <ErrorBoundary>
        <AuthProvider>
          <TimerProvider>
```

**SUBSTITUIR por**:
```typescript
function App() {
  return (
    <LayoutProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AuthProvider>
            <TimerProvider>
```

**E também BUSCAR** (linhas 498-501):
```typescript
          </AuthProvider>
        </ErrorBoundary>
      </LayoutProvider>
  );
```

**SUBSTITUIR por**:
```typescript
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </LayoutProvider>
  );
```

---

**Resultado Final da Função `App()`** (deve ser):
```typescript
function App() {
  return (
    <LayoutProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AuthProvider>
            <TimerProvider>
              <GameProvider>
                <ModalProvider>
                  <NotificationProvider>
                    <GameContent />
                  </NotificationProvider>
                </ModalProvider>
              </GameProvider>
            </TimerProvider>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </LayoutProvider>
  );
}
```

**Verificação**:
- Import de `ThemeProvider` adicionado ✅
- `<ThemeProvider>` wrapeando `<ErrorBoundary>` ✅
- `</ThemeProvider>` fechando antes de `</LayoutProvider>` ✅
- Indentação correta (2 espaços por nível) ✅
- Não há erros TypeScript no arquivo ✅

---

## ✅ Verificação Final

### Checklist de Conclusão

Execute os seguintes comandos para verificar se tudo está correto:

#### 1. Verificar Estrutura de Arquivos
```powershell
# PowerShell
Test-Path "src\theme\colors.ts"                    # Deve retornar: True
Test-Path "src\hooks\useSafeAreaInsets.ts"         # Deve retornar: True
Test-Path "src\contexts\ThemeContext.tsx"          # Deve retornar: True
Test-Path "src\components\ui\ModalHeader.tsx"      # Deve retornar: True
```

```bash
# Linux/macOS/Git Bash
ls -la src/theme/colors.ts                    # Deve listar o arquivo
ls -la src/hooks/useSafeAreaInsets.ts         # Deve listar o arquivo
ls -la src/contexts/ThemeContext.tsx          # Deve listar o arquivo
ls -la src/components/ui/ModalHeader.tsx      # Deve listar o arquivo
```

#### 2. Compilar TypeScript (Verificar Erros)
```bash
npm run build
```

**Resultado esperado**: Build completo sem erros TypeScript.

Se houver erros, verifique:
- Todos os imports estão corretos
- Todos os tipos estão definidos
- Não há typos nos nomes de arquivos/pastas

#### 3. Iniciar Dev Server
```bash
npm run dev
```

**Resultado esperado**:
- App inicia sem erros
- Console do navegador não mostra erros

#### 4. Verificar Dark Mode no Navegador

Abra o Dev Tools (F12) e execute no Console:
```javascript
document.documentElement.classList.contains('dark') // Deve retornar: true
localStorage.getItem('volleyscore-theme')           // Deve retornar: "dark"
```

#### 5. Verificar Safe Area Hook

No Console do navegador:
```javascript
// Simular notch (44px no topo)
document.documentElement.style.setProperty('--sat', '44px');

// Verificar se hook detecta (abra React DevTools para ver o estado)
// ou adicione um console.log temporário no hook
```

---

## 🎯 Plano de Verificação (Testes Manuais)

### Teste 1: Design System (colors.ts)
**Objetivo**: Confirmar que o arquivo de cores está acessível e exportando corretamente.

**Passos**:
1. Abra `src/theme/colors.ts` no editor
2. Verifique que não há erros de syntax highlighting
3. No terminal, execute: `npm run build`
4. Confirme que não há erros relacionados a `colors.ts`

**Resultado Esperado**: ✅ Build sem erros

---

### Teste 2: Safe Area Hook (useSafeAreaInsets.ts)
**Objetivo**: Verificar que o hook lê corretamente as variáveis CSS.

**Passos**:
1. Inicie o app: `npm run dev`
2. Abra o navegador em `http://localhost:5173`
3. Abra Dev Tools (F12) → Console
4. Execute:
   ```javascript
   document.documentElement.style.setProperty('--sat', '44px');
   ```
5. Se o `ModalHeader` já estiver em uso, observe se o padding superior muda

**Resultado Esperado**: ✅ Hook detecta mudanças nas variáveis CSS

---

### Teste 3: Theme Context (ThemeContext.tsx)
**Objetivo**: Confirmar que o tema dark mode está ativo e persistido.

**Passos**:
1. App rodando (`npm run dev`)
2. Abra Dev Tools → Console
3. Execute:
   ```javascript
   document.documentElement.classList.contains('dark') // true
   localStorage.getItem('volleyscore-theme')           // "dark"
   ```
4. Recarregue a página (F5)
5. Execute os comandos novamente

**Resultado Esperado**: ✅ Tema "dark" persiste após reload

---

### Teste 4: ModalHeader Component (ModalHeader.tsx) - USUÁRIO DEVE TESTAR
**Objetivo**: Verificar renderização e animação do componente.

**NOTA**: Este teste requer modificação temporária do código. **Solicitar ao usuário** que execute os seguintes passos:

**Passos**:
1. Abrir `src/App.tsx` no editor
2. Adicionar import do `ModalHeader` no topo:
   ```typescript
   import { ModalHeader } from './components/ui/ModalHeader';
   ```
3. Dentro da função `GameContent`, adicionar state:
   ```typescript
   const [showTestModal, setShowTestModal] = useState(false);
   ```
4. Antes do `return` final, adicionar modal de teste:
   ```tsx
   {showTestModal && (
     <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
       <div className="bg-slate-900 rounded-xl w-96 max-h-[80vh] overflow-auto">
         <ModalHeader 
           title="Teste de Header" 
           subtitle="Verificando animação e safe area"
           onClose={() => setShowTestModal(false)}
         />
         <div className="p-4 text-white">Conteúdo de teste</div>
       </div>
     </div>
   )}
   
   <button 
     onClick={() => setShowTestModal(true)}
     className="fixed bottom-4 right-4 z-[9998] px-4 py-2 bg-indigo-500 text-white rounded-lg"
   >
     Testar ModalHeader
   </button>
   ```
5. Salvar e aguardar hot reload
6. Clicar no botão "Testar ModalHeader"
7. Observar animação e funcionamento do botão X
8. **REMOVER código de teste** após verificar

**Resultado Esperado**: ✅ Modal renderiza com animação, botão X funciona

---

## 🚨 Troubleshooting

### Erro: "Cannot find module './contexts/ThemeContext'"
**Solução**: Verifique que você criou `src/contexts/ThemeContext.tsx` (com extensão `.tsx`, não `.ts`)

### Erro: "Type 'SafeAreaInsets' is not defined"
**Solução**: Certifique-se que `src/hooks/useSafeAreaInsets.ts` exporta a interface `SafeAreaInsets`

### Erro: Build falha com erro TypeScript
**Solução**: Execute `npm run build` e leia a mensagem de erro. Normalmente será um typo ou import incorreto.

### App não inicia (tela branca)
**Solução**: 
1. Abra Console do navegador (F12)
2. Veja o erro exato
3. Geralmente é um erro de sintaxe JSX em `App.tsx` (verifique que todos os `<tags>` estão fechados corretamente)

---

## 📊 Resumo das Modificações

| Arquivo | Ação | Linhas Modificadas |
|---------|------|-------------------|
| `src/theme/colors.ts` | CRIAR | 72 linhas |
| `src/hooks/useSafeAreaInsets.ts` | CRIAR | 52 linhas |
| `src/contexts/ThemeContext.tsx` | CRIAR | 50 linhas |
| `src/components/ui/ModalHeader.tsx` | CRIAR | 80 linhas |
| `src/App.tsx` | MODIFICAR | ~6 linhas (1 import + 2 wrappers) |
| **TOTAL** | | **~260 linhas** |

---

## ✅ Critérios de Sucesso

Considere esta implementação **CONCLUÍDA** quando:

- [ ] Todos os 4 arquivos novos foram criados
- [ ] `src/App.tsx` foi modificado corretamente
- [ ] `npm run build` executa sem erros
- [ ] `npm run dev` inicia o app sem crashes
- [ ] Console do navegador não mostra erros em tempo de execução
- [ ] `document.documentElement.classList.contains('dark')` retorna `true`
- [ ] Não há warnings TypeScript/ESLint críticos

---

**Autor**: Antigravity AI - SDD Fase 2 (Spec)  
**Data**: 2026-02-04  
**Versão**: 1.0  
**Status**: ✅ Pronto para Execução

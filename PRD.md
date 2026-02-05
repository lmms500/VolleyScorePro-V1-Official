# PRD - Lote 8.1 (Integração Nativa Profunda)

> **Status:** Planning Mode
> **Foco:** Edge-to-Edge, System UI Control, Safe Area Stability

## 1. Visão Geral
Implementação do sistema "Edge-to-Edge" (conteúdo desenhado atrás das barras de sistema) e controle manual da visibilidade das barras (Modo Imersivo) via Bridge Nativo no Android.

---

## 2. Plano Nativo (Android)

### 2.1 `styles.xml`
**Objetivo:** Modernizar o tema para remover flags obsoletas e preparar para controle via código (`WindowCompat`).
**Arquivo:** `android/app/src/main/res/values/styles.xml`

```xml
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <!-- ... -->
    </style>

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
        <!-- Edge-to-Edge Support -->
        <item name="android:windowLayoutInDisplayCutoutMode" tools:targetApi="o_mr1">shortEdges</item>
        <item name="android:enforceNavigationBarContrast" tools:targetApi="q">false</item>
    </style>
    <!-- ... -->
</resources>
```

### 2.2 `MainActivity.java`
**Objetivo:** Implementar `SystemUiPlugin` local para controle de visibilidade via JS e ativar Edge-to-Edge no `onCreate`.
**Arquivo:** `android/app/src/main/java/com/volleyscore/pro2/MainActivity.java`

**Alterações Planejadas:**
1.  **Imports:** `WindowCompat`, `WindowInsetsCompat`, `WindowInsetsControllerCompat`.
2.  **onCreate:**
    ```java
    import androidx.core.view.WindowCompat;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Habilitar Edge-to-Edge
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        // ... permission code ...
        
        // Registrar Plugin Local
        registerPlugin(SystemUiPlugin.class);
    }
    ```
3.  **SystemUiPlugin (Inner Class ou Arquivo Separado):**
    ```java
    @CapacitorPlugin(name = "SystemUi")
    public class SystemUiPlugin extends Plugin {
        @PluginMethod
        public void setImmersiveMode(PluginCall call) {
            boolean enabled = call.getBoolean("enabled", true);
            
            getActivity().runOnUiThread(() -> {
                Window window = getActivity().getWindow();
                WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
                
                if (enabled) {
                    // Hide bars
                    controller.hide(WindowInsetsCompat.Type.systemBars());
                    controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                } else {
                    // Show bars
                    controller.show(WindowInsetsCompat.Type.systemBars());
                }
                call.resolve();
            });
        }
    }
    ```

---

## 3. Upgrade: CSS & Hooks

### 3.1 `useSafeAreaInsets.ts`
**Objetivo:** Injetar variáveis CSS `--sat`, `--sab` proativamente e garantir leitura correta.

**Refatoração:**
```typescript
// Lógica para detectar e injetar medidas safe area
const updateInsets = () => {
    // 1. Ler variáveis CSS (prioridade para env())
    let top = 0, bottom = 0;
    
    // Tenta ler do ComputedStyle (env)
    // Se zero, tenta fallback para valores conhecidos se estivermos em native mode
    // ...
    
    // INJECTION: Escrever as variáveis calculadas no :root se necessário
    // ou apenas disponibilizar via hook context.
    // A melhor prática é ler do CSS (env), pois o Capacitor StatusBar atualiza o webview.
    // Mas o hook deve garantir que 'bottom' tenha um mínimo seguro (ex: 24px) apenas se detectado gesture bar.
};
```
*Decisão:* O hook continuará lendo do CSS, mas vamos garantir que o `index.css` tenha `:root { --sat: env(safe-area-inset-top); ... }` e o hook aplique um *clamp* inteligente.

### 3.2 `index.css` (Estabilidade)
**Objetivo:** Evitar saltos de layout quando a barra some/aparece.

```css
#root {
    /* Isolar layout para evitar repaints globais */
    contain: layout size;
    /* Garantir que o app ocupe sempre a tela toda, desenhando atrás das barras */
    height: 100vh;
    width: 100vw;
}
```

---

## 4. Otimização UI: `ModalHeader.tsx`

**Objetivo:** O Background deve ir até o topo (top: 0), mas o conteúdo (Título/Botões) deve ter padding.

**Refatoração:**
```tsx
// ModalHeader.tsx
const { top } = useSafeAreaInsets();
// top vem do hook já tratado (env value)

return (
  <motion.header
     className="fixed top-0 w-full ..." 
     // Padding top aplicado DINAMICAMENTE
     style={{ 
        paddingTop: `${top}px`, 
        height: `${top + 56}px` // Altura explícita = notch + conteúdo (56px)
     }}
  >
     <div className="h-[56px] flex items-center ...">
        {/* Conteúdo centralizado verticalmente na área útil */}
     </div>
  </motion.header>
)
```

## 5. Passos de Verificação
1.  **Build Android:** `npx cap sync && npx cap open android` -> Run.
2.  **Edge-to-Edge:** Verificar se o background do app flui atrás da Status Bar (transparente).
3.  **Immersive Mode:** Criar botão temporário para chamar `SystemUi.setImmersiveMode(true)` e verificar se barras somem.
4.  **Modal Header:** Abrir um modal e verificar se o título não fica cortado pelo notch.

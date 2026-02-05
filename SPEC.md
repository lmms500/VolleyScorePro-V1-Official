# SPEC - Lote 8.1 (Integração Nativa Profunda)

> **Status:** Ready for Execution
> **Referência:** [PRD.md](file:///c:/Dev/VolleyScore-Pro/PRD.md)

Esta especificação contém o código exato para implementação do modo Edge-to-Edge e controle de UI do sistema.

---

## 1. Native Android (Java & XML)

### 1.1 `android/app/src/main/res/values/styles.xml`
**Ação:** Substituir ou mesclar o estilo para garantir suporte a `windowLayoutInDisplayCutoutMode`.

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources xmlns:tools="http://schemas.android.com/tools">

    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
        
        <!-- Edge-to-Edge: Desenhar sob o notch em landscape -->
        <item name="android:windowLayoutInDisplayCutoutMode" tools:targetApi="o_mr1">shortEdges</item>
        
        <!-- Navigation Bar Transparent Contrast -->
        <item name="android:enforceNavigationBarContrast" tools:targetApi="q">false</item>
    </style>

    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:background">@drawable/splash</item>
        <!-- Garantir consistência no splash também -->
        <item name="android:windowLayoutInDisplayCutoutMode" tools:targetApi="o_mr1">shortEdges</item>
    </style>
</resources>
```

### 1.2 `android/app/src/main/java/com/volleyscore/pro2/MainActivity.java`
**Ação:** Implementar `SystemUiPlugin` como inner class e configurar WindowCompat.

```java
package com.volleyscore.pro2;

import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import androidx.core.app.ActivityCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 1. Edge-to-Edge: App desenha atrás das barras
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        // Permissões Android 6.0+ (Mantido)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            String[] permissions = {
                "android.permission.READ_EXTERNAL_STORAGE",
                "android.permission.WRITE_EXTERNAL_STORAGE",
                "android.permission.CAMERA",
                "android.permission.RECORD_AUDIO",
                "android.permission.ACCESS_FINE_LOCATION"
            };
            
            for (String permission : permissions) {
                if (checkSelfPermission(permission) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(this, new String[]{permission}, 1);
                }
            }
        }

        // 2. Registrar Plugin Nativo Local
        registerPlugin(SystemUiPlugin.class);
    }

    /**
     * Local Plugin para controle de Modo Imersivo
     * Exposto para JS como "SystemUi"
     */
    @CapacitorPlugin(name = "SystemUi")
    public static class SystemUiPlugin extends Plugin {
        @PluginMethod
        public void setImmersiveMode(PluginCall call) {
            boolean enabled = call.getBoolean("enabled", true);
            
            getActivity().runOnUiThread(() -> {
                Window window = getActivity().getWindow();
                WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
                
                if (enabled) {
                    // Esconder Status Bar e Navigation Bar
                    controller.hide(WindowInsetsCompat.Type.systemBars());
                    // Barras aparecem temporariamente ao deslizar (transient)
                    controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                } else {
                    // Mostrar Barras
                    controller.show(WindowInsetsCompat.Type.systemBars());
                }
                call.resolve();
            });
        }
    }
}
```

---

## 2. Web Frontend (TS & CSS)

### 2.1 `src/hooks/useSafeAreaInsets.ts`
**Ação:** Refatorar para garantir injeção de variáveis e leitura robusta.

```typescript
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export interface SafeAreaInsets {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export const useSafeAreaInsets = (): SafeAreaInsets => {
    const [insets, setInsets] = useState<SafeAreaInsets>({
        top: 0, bottom: 0, left: 0, right: 0,
    });

    useEffect(() => {
        const updateInsets = () => {
            const root = document.documentElement;
            const computedStyle = getComputedStyle(root);

            // 1. Ler variáveis CSS (prioridade para env())
            let top = parseInt(computedStyle.getPropertyValue('--sat').replace('px', '')) || 0;
            let bottom = parseInt(computedStyle.getPropertyValue('--sab').replace('px', '')) || 0;
            let left = parseInt(computedStyle.getPropertyValue('--sal').replace('px', '')) || 0;
            let right = parseInt(computedStyle.getPropertyValue('--sar').replace('px', '')) || 0;

            // 2. Fallback caso variáveis não estejam setadas (Native Mode)
            // Se estivermos em nativo e top for zero, pode ser que o CSS env() falhou ou demorou.
            // Para edge-to-edge, o env() deve funcionar se viewport-fit=cover estiver setado.
            
            setInsets({ top, bottom, left, right });
        };

        // Delay para garantir que StatusBar tenha injetado os valores
        setTimeout(updateInsets, 100);
        
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

### 2.2 `src/index.css`
**Ação:** Adicionar isolamento no root e mapeamento de variáveis.

```css
/* SAFE AREA MAPPING */
:root {
  --sat: env(safe-area-inset-top, 0px);
  --sar: env(safe-area-inset-right, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
}

/* LAYOUT STABILITY */
html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: fixed; /* Evita bounce no iOS */
  background-color: #020617; /* Slate 950 base */
}

#root {
  height: 100%;
  width: 100%;
  
  /* Isolar layout recalculations */
  contain: layout size;
  
  display: flex;
  flex-direction: column;
}
/* ... restante ... */
```

---

## 3. UI Component

### 3.1 `src/components/ui/ModalHeader.tsx`
**Ação:** Padding top dinâmico com background fixo no topo.

```tsx
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
    scrolled?: boolean; 
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
    
    // Altura base do conteúdo (excluindo notch)
    const CONTENT_HEIGHT = 56; 
    
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
            // O Header cresce para acomodar o notch
            style={{ 
                paddingTop: `${top}px`,
                height: `${top + CONTENT_HEIGHT}px`
            }}
        >
            <div 
                className="flex items-center justify-between px-4 w-full h-full"
            >
                {/* Close Button */}
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

                {/* Title Area */}
                <div className="flex-1 flex justify-center mx-2 overflow-hidden">
                    {centerContent ? centerContent : (
                        <div className="flex flex-col items-center text-center truncate">
                            <h2 className="text-base font-bold text-white tracking-tight truncate w-full">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-xs text-slate-400 mt-0.5 truncate w-full">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="w-9 flex justify-end">
                    {rightContent}
                </div>
            </div>
        </motion.header>
    );
};
```

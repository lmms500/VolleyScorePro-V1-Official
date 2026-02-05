package com.volleyscore.pro2;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
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
    // Estado global do modo imersivo (acessível pelo plugin e onWindowFocusChanged)
    private static boolean sImmersiveModeEnabled = false;
    private Handler handler = new Handler(Looper.getMainLooper());
    private Runnable hideRunnable = null;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();

        // 1. Edge-to-Edge: App desenha atrás das barras do sistema
        WindowCompat.setDecorFitsSystemWindows(window, false);

        // 2. Barras TRANSPARENTES (modo normal - estilo YouTube Music)
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        // 3. Permitir desenhar atrás das barras
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
        }

        // 4. Ícones das barras: CLAROS (para fundo escuro)
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(false);
            controller.setAppearanceLightNavigationBars(false);
        }

        // Permissões Android 6.0+
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

        // 5. Registrar Plugin Nativo Local
        registerPlugin(SystemUiPlugin.class);
    }

    /**
     * CRÍTICO: Este método é chamado quando a janela ganha/perde foco.
     * Quando o usuário desliza para revelar as barras, a janela perde foco momentaneamente.
     * Quando as barras são escondidas novamente, a janela ganha foco.
     * Usamos isso para re-esconder as barras automaticamente.
     */
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);

        if (sImmersiveModeEnabled && hasFocus) {
            // Quando ganha foco E está em modo imersivo, re-esconder as barras
            // Delay maior para garantir que o sistema estabilizou
            if (hideRunnable != null) {
                handler.removeCallbacks(hideRunnable);
            }
            hideRunnable = () -> hideSystemBars();
            handler.postDelayed(hideRunnable, 100);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // Re-aplicar modo imersivo quando a activity é resumed
        if (sImmersiveModeEnabled) {
            handler.postDelayed(() -> hideSystemBars(), 100);
        }
    }

    /**
     * Esconde as barras do sistema de forma imersiva
     */
    private void hideSystemBars() {
        Window window = getWindow();
        View decorView = window.getDecorView();
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decorView);

        if (controller != null) {
            // Esconder status bar e navigation bar
            controller.hide(WindowInsetsCompat.Type.statusBars());
            controller.hide(WindowInsetsCompat.Type.navigationBars());

            // BEHAVIOR_DEFAULT permite swipe para mostrar temporariamente
            // e esconde automaticamente após alguns segundos (Android 11+)
            // BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE também funciona mas é mais antigo
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_DEFAULT);
            } else {
                controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }

            // Fallback adicional usando flags antigas para Android < 11
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
                decorView.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                );
            }
        }
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
            sImmersiveModeEnabled = enabled;

            getActivity().runOnUiThread(() -> {
                Window window = getActivity().getWindow();
                WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());

                if (controller == null) {
                    call.reject("WindowInsetsController não disponível");
                    return;
                }

                if (enabled) {
                    // FULLSCREEN: Esconder Status Bar e Navigation Bar
                    controller.hide(WindowInsetsCompat.Type.systemBars());
                    controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                } else {
                    // MODO NORMAL: Mostrar barras transparentes
                    controller.show(WindowInsetsCompat.Type.systemBars());

                    // Reconfigurar barras como transparentes
                    window.setStatusBarColor(Color.TRANSPARENT);
                    window.setNavigationBarColor(Color.TRANSPARENT);

                    // Ícones claros para fundo escuro
                    controller.setAppearanceLightStatusBars(false);
                    controller.setAppearanceLightNavigationBars(false);
                }
                call.resolve();
            });
        }
    }
}

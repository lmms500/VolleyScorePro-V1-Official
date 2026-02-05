package com.volleyscore.pro2;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
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
            // Android 11+: Usar o novo método
            window.setDecorFitsSystemWindows(false);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            // Android 5.0+: Flags para desenhar atrás das barras
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
        }

        // 4. Ícones das barras: CLAROS (para fundo escuro como #020617)
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(false);
            controller.setAppearanceLightNavigationBars(false);
        }

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

        // 5. Registrar Plugin Nativo Local
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

                if (controller == null) {
                    call.reject("WindowInsetsController não disponível");
                    return;
                }

                if (enabled) {
                    // FULLSCREEN: Esconder Status Bar e Navigation Bar
                    controller.hide(WindowInsetsCompat.Type.systemBars());
                    // Barras aparecem temporariamente ao deslizar da borda
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

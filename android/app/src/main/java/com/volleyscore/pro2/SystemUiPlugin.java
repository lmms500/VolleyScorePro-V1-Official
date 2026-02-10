package com.volleyscore.pro2;

import android.graphics.Color;
import android.view.View;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Custom Capacitor plugin for controlling Android System UI (Immersive Mode)
 * Exposed to JavaScript as "SystemUi"
 */
@CapacitorPlugin(name = "SystemUi")
public class SystemUiPlugin extends Plugin {

    @PluginMethod
    public void setImmersiveMode(PluginCall call) {
        boolean enabled = call.getBoolean("enabled", true);
        
        // Update the global state in MainActivity
        MainActivity.setImmersiveModeEnabled(enabled);

        getActivity().runOnUiThread(() -> {
            Window window = getActivity().getWindow();
            View decorView = window.getDecorView();
            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decorView);

            if (controller == null) {
                call.reject("WindowInsetsController not available");
                return;
            }

            try {
                if (enabled) {
                    // FULLSCREEN: Hide Status Bar and Navigation Bar
                    controller.setSystemBarsBehavior(
                        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                    );
                    controller.hide(WindowInsetsCompat.Type.systemBars());
                } else {
                    // NORMAL MODE: Show transparent bars
                    controller.show(WindowInsetsCompat.Type.systemBars());

                    // Reconfigure bars as transparent
                    window.setStatusBarColor(Color.TRANSPARENT);
                    window.setNavigationBarColor(Color.TRANSPARENT);

                    // Light icons for dark background
                    controller.setAppearanceLightStatusBars(false);
                    controller.setAppearanceLightNavigationBars(false);
                }
                call.resolve();
            } catch (Exception e) {
                call.reject("Error setting immersive mode: " + e.getMessage());
            }
        });
    }
}

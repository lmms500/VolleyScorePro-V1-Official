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

public class MainActivity extends BridgeActivity {
    // Global state for immersive mode (accessed by plugin and onWindowFocusChanged)
    private static boolean sImmersiveModeEnabled = false;
    private Handler handler = new Handler(Looper.getMainLooper());
    private Runnable hideRunnable = null;

    /**
     * Static setter for immersive mode state.
     * Called by SystemUiPlugin to update the global state.
     */
    public static void setImmersiveModeEnabled(boolean enabled) {
        sImmersiveModeEnabled = enabled;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // CRITICAL: Register plugin BEFORE super.onCreate() for Capacitor 4+
        registerPlugin(SystemUiPlugin.class);
        
        super.onCreate(savedInstanceState);

        Window window = getWindow();

        // 1. Edge-to-Edge: App draws behind system bars
        WindowCompat.setDecorFitsSystemWindows(window, false);

        // 2. TRANSPARENT bars (normal mode - YouTube Music style)
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        // 3. Allow drawing behind bars
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
        }

        // 4. Bar icons: LIGHT (for dark background)
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(false);
            controller.setAppearanceLightNavigationBars(false);
        }

        // Permissions Android 6.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            String[] permissions = {
                "android.permission.CAMERA",
                "android.permission.RECORD_AUDIO"
            };

            for (String permission : permissions) {
                if (checkSelfPermission(permission) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(this, new String[]{permission}, 1);
                }
            }
        }
    }

    /**
     * CRITICAL: This method is called when the window gains/loses focus.
     * When the user swipes to reveal bars, the window temporarily loses focus.
     * When bars are hidden again, the window gains focus.
     * We use this to automatically re-hide the bars.
     */
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);

        if (sImmersiveModeEnabled && hasFocus) {
            // When gaining focus AND in immersive mode, re-hide bars
            // Larger delay to ensure system has stabilized
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
        // Re-apply immersive mode when activity is resumed
        if (sImmersiveModeEnabled) {
            handler.postDelayed(() -> hideSystemBars(), 100);
        }
    }

    /**
     * Hides system bars in immersive mode
     */
    private void hideSystemBars() {
        Window window = getWindow();
        View decorView = window.getDecorView();
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decorView);

        if (controller != null) {
            // First, set behavior BEFORE hiding
            // BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE: swipe shows bars temporarily,
            // then they auto-hide
            controller.setSystemBarsBehavior(
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            );

            // Hide ALL system bars (status + navigation) at once
            controller.hide(WindowInsetsCompat.Type.systemBars());
        }
    }
}


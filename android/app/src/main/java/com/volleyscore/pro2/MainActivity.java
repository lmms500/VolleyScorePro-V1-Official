package com.volleyscore.pro2;

import android.os.Build;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Request runtime permissions for Android 6.0+
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
    }
}

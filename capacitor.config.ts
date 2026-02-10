
import { CapacitorConfig } from '@capacitor/cli';
import type { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.volleyscore.pro2',
  appName: 'VolleyScore Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  backgroundColor: "#020617",
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: false,
      backgroundColor: "#020617",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    // [LOTE 8.2] StatusBar config removed - Our custom SystemUi plugin handles immersive mode
    // StatusBar: {
    //   style: "DARK",
    //   backgroundColor: "#00000000",
    //   overlaysWebView: true,
    // },
    Keyboard: {
      resize: "body" as KeyboardResize,
      style: "DARK" as KeyboardStyle
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    },
  }
};

export default config;

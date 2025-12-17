
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.volleyscore.pro2',
  appName: 'VolleyScore Pro',
  webDir: 'dist', // Crítico para Vite
  server: {
    androidScheme: 'https'
  },
  backgroundColor: "#020617", 
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#020617",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK", 
      backgroundColor: "#00000000",
      overlaysWebView: true,
    }
  }
};

export default config;

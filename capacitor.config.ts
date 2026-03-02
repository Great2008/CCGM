import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.ccgworld.app',
  appName: 'CCG World',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // During development, point to your live Vercel URL so the app
    // always has fresh data. Remove this block for production builds.
    // url: 'https://your-vercel-url.vercel.app',
    // cleartext: true,
  },
  android: {
    backgroundColor: '#0f1f3d',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // set true only during dev
  },
  ios: {
    backgroundColor: '#0f1f3d',
    contentInset: 'automatic',
    limitsNavigationsToAppBoundDomains: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f1f3d',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',           // light text on dark background
      backgroundColor: '#0f1f3d',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#f5a623',   // CCG gold
    },
  },
};

export default config;

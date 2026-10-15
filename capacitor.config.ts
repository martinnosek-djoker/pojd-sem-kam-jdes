import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cz.pojdsemkamjdes.app',
  appName: 'Pojď sem! Kam jdeš?',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  android: {
    // targetSdk 35+ draws the app edge-to-edge under the status/navigation bars; this keeps the
    // WebView (and its fixed header/nav elements) inside them.
    adjustMarginsForEdgeToEdge: 'auto',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FBF3E7',
      showSpinner: false,
    },
  },
};

export default config;

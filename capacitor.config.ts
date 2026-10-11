import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cz.pojdsemkamjdes.app',
  appName: 'Pojď sem! Kam jdeš?',
  webDir: 'out',
  server: {
    androidScheme: 'https',
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

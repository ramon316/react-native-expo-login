import config from './app.json';

export default {
  ...config,
  expo: {
    ...config.expo,
    extra: {
      ...config.expo.extra,
      // Variables personalizadas para la app (desde .env)
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://seccion8.org/api",
      stage: process.env.EXPO_PUBLIC_STAGE || "dev",
    },
  },
};
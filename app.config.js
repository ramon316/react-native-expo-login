import config from './app.json';

export default {
  ...config,
  expo: {
    ...config.expo,
    extra: {
      ...config.expo.extra,
      // Variables personalizadas para la app
      apiUrl: "https://seccion8.org/api",
      stage: "prod",
    },
  },
};
import Constants from 'expo-constants';

/**
 * Logger centralizado que usa app.config.js (que extiende app.json)
 * Esto asegura que funcione correctamente en APKs compilados
 *
 * Configuración: app.config.js importa app.json y agrega variables extra
 */

// Obtener el stage desde app.config.js
const STAGE = Constants.expoConfig?.extra?.stage || 'dev';

/**
 * Logger condicional basado en el entorno desde app.config.js
 */
export const appLogger = {
    log: (...args: any[]) => {
        if (STAGE === 'dev') {
            console.log(...args);
        }
    },
    warn: (...args: any[]) => {
        if (STAGE === 'dev') {
            console.warn(...args);
        }
    },
    error: (...args: any[]) => {
        if (STAGE === 'dev') {
            console.error(...args);
        }
        // En producción, aquí podrías enviar errores críticos a un servicio de monitoreo
    },
    info: (...args: any[]) => {
        if (STAGE === 'dev') {
            console.info(...args);
        }
    },
    debug: (...args: any[]) => {
        if (STAGE === 'dev') {
            console.debug(...args);
        }
    }
};

/**
 * Obtiene el stage actual desde app.config.js
 */
export const getAppStage = (): string => {
    return STAGE;
};

/**
 * Obtiene la configuración completa de app.config.js
 */
export const getAppConfig = () => {
    return Constants.expoConfig?.extra || {};
};

/**
 * Verifica si estamos en modo desarrollo
 */
export const isDevelopment = (): boolean => {
    return STAGE === 'dev';
};

/**
 * Verifica si estamos en modo producción
 */
export const isProduction = (): boolean => {
    return STAGE === 'prod';
};

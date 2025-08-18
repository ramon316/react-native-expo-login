import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage.adapter';
import axios from 'axios';
import { Platform } from 'react-native';

//TODO: concetar mediante env vars. Andoid and IOS
const STAGE = process.env.EXPO_PUBLIC_STAGE || 'dev';

// Logger condicional basado en el entorno
const logger = {
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
    }
};

/* Verificamos en que sistema estamos para tomar el api correcto */
export const API_URL =
(STAGE === 'prod')
    ? process.env.EXPO_PUBLIC_API_URL
    :(Platform.OS === 'android') 
        ? process.env.EXPO_PUBLIC_API_URL_ANDROID
        : process.env.EXPO_PUBLIC_API_URL_IOS;

// Validación de URL
if (!API_URL) {
    logger.error('❌ ERROR: No se encontró URL de API para la plataforma:', Platform.OS);
    logger.error('📋 Variables disponibles:', {
        STAGE,
        EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
        EXPO_PUBLIC_API_URL_ANDROID: process.env.EXPO_PUBLIC_API_URL_ANDROID,
        EXPO_PUBLIC_API_URL_IOS: process.env.EXPO_PUBLIC_API_URL_IOS,
    });
}

// Logging detallado
logger.log('🔧 Configuración de API:');
logger.log('📱 Plataforma:', Platform.OS);
logger.log('🌍 Entorno:', STAGE);
logger.log('🌐 URL de API:', API_URL);
logger.log('📋 Variables de entorno cargadas:', {
    STAGE,
    API_URL_ANDROID: process.env.EXPO_PUBLIC_API_URL_ANDROID,
    API_URL_IOS: process.env.EXPO_PUBLIC_API_URL_IOS,
});

const attendancesApi = axios.create({
    baseURL: API_URL,
    /* timeout: 10000, // 10 segundos de timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    }, */
});

/* Interceptor de request combinado: Token + Logging */
attendancesApi.interceptors.request.use(
    async (config) => {
        /* Verificar si tenemos un token en secure storage */
        const token = await SecureStorageAdapter.getItem('token');

        if (token) {
            /* Si tenemos un token, lo agregamos a la petición */
            config.headers.Authorization = `Bearer ${token}`;
            logger.log('🔑 Token agregado a la petición');
        } else {
            logger.warn('⚠️ No se encontró token en SecureStorage');
        }

        /* Logging detallado de la petición */
        logger.log('📤 REQUEST ENVIADO:');
        logger.log('🎯 URL completa:', `${config.baseURL}${config.url}`);
        logger.log('📋 Método:', config.method?.toUpperCase());
        logger.log('📦 Data:', config.data);
        logger.log('🔧 Headers:', JSON.stringify(config.headers, null, 2));

        return config;
    },
    (error) => {
        logger.error('❌ Error en request interceptor:', error);
        return Promise.reject(error);
    }
);

// Interceptor de response para logging detallado
attendancesApi.interceptors.response.use(
    (response) => {
        logger.log('📥 RESPONSE RECIBIDO:');
        logger.log('✅ Status:', response.status);
        logger.log('📦 Data:', response.data);
        return response;
    },
    (error) => {
        logger.error('❌ ERROR EN RESPONSE:');
        logger.error('🔢 Status:', error.response?.status);
        logger.error('📄 Error Data:', error.response?.data);
        logger.error('🌐 URL que falló:', error.config?.url);
        logger.error('📋 Método:', error.config?.method);

        // Mensajes específicos para errores comunes
        if (error.response?.status === 401) {
            logger.error('🚨 ERROR 401: No autorizado - Token inválido o expirado');
            logger.error('🔍 El usuario necesita volver a hacer login');
        } else if (error.response?.status === 404) {
            logger.error('🚨 ERROR 404: Ruta no encontrada');
            logger.error('🔍 Verifica que la ruta exista en routes/api.php de Laravel');
            logger.error('🔍 URL intentada:', `${error.config?.baseURL}${error.config?.url}`);
        } else if (error.response?.status === 500) {
            logger.error('🚨 ERROR 500: Error interno del servidor');
            logger.error('🔍 Revisa los logs de Laravel para más detalles');
        } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
            logger.error('🚨 ERROR DE RED: No se puede conectar al servidor');
            logger.error('🔍 Verifica que Laravel esté corriendo en:', error.config?.baseURL);
        } else if (error.code === 'ECONNREFUSED') {
            logger.error('🚨 CONEXIÓN RECHAZADA: El servidor no está disponible');
            logger.error('🔍 Verifica que Laragon esté corriendo');
        }

        return Promise.reject(error);
    }
);

export { attendancesApi };


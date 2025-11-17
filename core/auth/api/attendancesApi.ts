import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage.adapter';
import { getAppStage, appLogger as logger } from '@/helpers/logger/appLogger';
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/* Obtenemos la URL de la API desde app.config.js */
export const API_URL = Constants.expoConfig?.extra?.apiUrl || null;

// Validación de URL
if (!API_URL) {
    logger.error('❌ ERROR: No se encontró URL de API en app.config.js');
    logger.error('📋 Configuración disponible:', {
        stage: getAppStage(),
        expoConfig: Constants.expoConfig?.extra || 'No disponible',
        Platform: Platform.OS,
    });
}

// Logging detallado
logger.log('🔧 Configuración de API desde app.config.js:');
logger.log('📱 Plataforma:', Platform.OS);
logger.log('🌍 Entorno (stage):', getAppStage());
logger.log('🌐 URL de API:', API_URL);
logger.log('📋 Configuración extra completa:', Constants.expoConfig?.extra || 'No disponible');

const attendancesApi = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 segundos de timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

/* Interceptor de request combinado: Token + Logging optimizado */
attendancesApi.interceptors.request.use(
    async (config) => {
        /* Verificar si tenemos un token en secure storage */
        const token = await SecureStorageAdapter.getItem('token');

        if (token) {
            /* Si tenemos un token, lo agregamos a la petición */
            config.headers.Authorization = `Bearer ${token}`;
        }

        /* Logging simplificado solo en desarrollo */
        if (getAppStage() === 'dev') {
            logger.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
            if (config.data) {
                logger.log('📦 Data:', config.data);
            }
        }

        return config;
    },
    (error) => {
        logger.error('❌ Error en request interceptor:', error);
        return Promise.reject(error);
    }
);

// Interceptor de response optimizado
attendancesApi.interceptors.response.use(
    (response) => {
        /* Logging simplificado solo en desarrollo */
        if (getAppStage() === 'dev') {
            logger.log(`📥 ${response.status} ${response.config.url}`);
        }
        return response;
    },
    (error) => {
        /* Logging de errores (siempre activo para debugging) */
        const status = error.response?.status;
        const url = error.config?.url;

        // Mensajes específicos para errores comunes
        if (status === 401) {
            logger.error(`🚨 401 No autorizado - ${url}`);
        } else if (status === 404) {
            logger.error(`🚨 404 Ruta no encontrada - ${url}`);
        } else if (status === 422) {
            logger.error(`🚨 422 Validación incorrecta - ${url}`, error.response?.data);
        } else if (status === 500) {
            logger.error(`🚨 500 Error del servidor - ${url}`);
        } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
            logger.error(`🚨 Error de red - ${url}`);
        } else if (error.code === 'ECONNREFUSED') {
            logger.error(`🚨 Conexión rechazada - ${url}`);
        } else if (error.code === 'ECONNABORTED') {
            logger.error(`🚨 Timeout (10s) - ${url}`);
        } else {
            logger.error(`❌ Error ${status || 'desconocido'} - ${url}`);
        }

        return Promise.reject(error);
    }
);

export { attendancesApi };


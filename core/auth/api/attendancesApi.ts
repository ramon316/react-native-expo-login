import { SecureStorageAdapter } from '@/helpers/adapters/secure-storage.adapter';
import axios from 'axios';
import { Platform } from 'react-native';
//TODO: concetar mediante env vars. Andoid and IOS
const STAGE = process.env.EXPO_PUBLIC_STAGE || 'dev';

/* Verificamos en que sistema estamos para tomar el api correcto */
export const API_URL =
(STAGE === 'prod')
    ? process.env.EXPO_PUBLIC_API_URL
    :(Platform.OS === 'android') 
        ? process.env.EXPO_PUBLIC_API_URL_ANDROID
        : process.env.EXPO_PUBLIC_API_URL_IOS;

// Validación de URL
if (!API_URL) {
    console.error('❌ ERROR: No se encontró URL de API para la plataforma:', Platform.OS);
    console.error('📋 Variables disponibles:', {
        STAGE,
        EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
        EXPO_PUBLIC_API_URL_ANDROID: process.env.EXPO_PUBLIC_API_URL_ANDROID,
        EXPO_PUBLIC_API_URL_IOS: process.env.EXPO_PUBLIC_API_URL_IOS,
    });
}

// Logging detallado
console.log('🔧 Configuración de API:');
console.log('📱 Plataforma:', Platform.OS);
console.log('🌍 Entorno:', STAGE);
console.log('🌐 URL de API:', API_URL);
console.log('📋 Variables de entorno cargadas:', {
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

/* Inteerceptores en Axios */
attendancesApi.interceptors.request.use(  async (config) => {
    /* Siempre se manda la configuración ya que ella es la que tenemos que hacer los cambios. */
    /* Verificar si tenemos un token en secure storage */
    const token = await SecureStorageAdapter.getItem('token');

    if (token) {
        /* Si tenemos un token, lo agregamos a la petición */
        config.headers.Authorization = `Bearer ${token}`;
    }
    /* como no existe no mandamos nada.*/
    return config;
});


// Interceptor de request para logging detallado
attendancesApi.interceptors.request.use(
    (config) => {
        console.log('📤 REQUEST ENVIADO:');
        console.log('🎯 URL completa:', `${config.baseURL}${config.url}`);
        console.log('📋 Método:', config.method?.toUpperCase());
        console.log('📦 Data:', config.data);
        console.log('🔧 Headers:', config.headers);
        return config;
    },
    (error) => {
        console.error('❌ Error en request interceptor:', error);
        return Promise.reject(error);
    }
);

// Interceptor de response para logging detallado
attendancesApi.interceptors.response.use(
    (response) => {
        console.log('📥 RESPONSE RECIBIDO:');
        console.log('✅ Status:', response.status);
        console.log('📦 Data:', response.data);
        return response;
    },
    (error) => {
        console.error('❌ ERROR EN RESPONSE:');
        console.error('🔢 Status:', error.response?.status);
        console.error('📄 Error Data:', error.response?.data);
        console.error('🌐 URL que falló:', error.config?.url);
        console.error('📋 Método:', error.config?.method);

        // Mensajes específicos para errores comunes
        if (error.response?.status === 401) {
            console.error('🚨 ERROR 401: No autorizado - Token inválido o expirado');
            console.error('🔍 El usuario necesita volver a hacer login');
        } else if (error.response?.status === 404) {
            console.error('🚨 ERROR 404: Ruta no encontrada');
            console.error('🔍 Verifica que la ruta exista en routes/api.php de Laravel');
            console.error('🔍 URL intentada:', `${error.config?.baseURL}${error.config?.url}`);
        } else if (error.response?.status === 500) {
            console.error('🚨 ERROR 500: Error interno del servidor');
            console.error('🔍 Revisa los logs de Laravel para más detalles');
        } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
            console.error('🚨 ERROR DE RED: No se puede conectar al servidor');
            console.error('🔍 Verifica que Laravel esté corriendo en:', error.config?.baseURL);
        } else if (error.code === 'ECONNREFUSED') {
            console.error('🚨 CONEXIÓN RECHAZADA: El servidor no está disponible');
            console.error('🔍 Verifica que Laragon esté corriendo');
        }

        return Promise.reject(error);
    }
);

export { attendancesApi };


import { appLogger as logger } from "@/helpers/logger/appLogger";
import { attendancesApi } from "../api/attendancesApi";
import { AuthResponse, User } from "../interface/user";

// Caché para validación de matrículas (optimización de rendimiento)
interface MatriculaCacheEntry {
    result: boolean;
    timestamp: number;
}

const matriculaCache = new Map<string, MatriculaCacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

/**
 * Limpia entradas expiradas del caché de matrículas
 */
const cleanExpiredCache = () => {
    const now = Date.now();
    for (const [key, entry] of matriculaCache.entries()) {
        if (now - entry.timestamp > CACHE_DURATION) {
            matriculaCache.delete(key);
            logger.log(`🗑️ Entrada de caché expirada eliminada: ${key}`);
        }
    }
};

const returnUserToken = (data: AuthResponse): { user: User; token: string } | null => {
    if (!data.user || !data.token) {
        logger.error('❌ Respuesta de autenticación incompleta:', data);
        return null;
    }

    return {
        user: data.user,
        token: data.token,
    };
};

export const authLogin = async (email: string, password: string) => {
    email = email.toLowerCase();

    logger.log(`AuthLogin recibe, ${email} and password ${password}`);

    try {
        const { data } = await attendancesApi.post<AuthResponse>('/login', {
            email, password
        });

        const result = returnUserToken(data);
        if (!result) {
            logger.error('❌ Error al procesar respuesta de login');
            return null;
        }

        return result;
    } catch (error: any) {
        logger.log('❌ Error completo en authLogin:', error);
        logger.log('📡 Error message:', error.message);
        logger.log('🔢 Error status:', error.response?.status);
        logger.log('📄 Error data:', error.response?.data);
        logger.log('🌐 Error config URL:', error.config?.url);
        logger.log('🎯 Error config baseURL:', error.config?.baseURL);

        if (error.response?.status === 404) {
            logger.log('🚨 ERROR 404: La ruta no existe en el servidor');
            logger.log('🔍 Verifica que la URL sea correcta y que Laravel esté corriendo');
        }

        return null;
    }
};

// Función para registrar un nuevo usuario
export const authRegister = async (
    name: string,
    employee_id: string,
    email: string,
    password: string
) => {
    // Normalizar datos
    email = email.toLowerCase().trim();
    name = name.trim();
    employee_id = employee_id.trim();

    logger.log(`AuthRegister recibe:`, {
        name,
        employee_id,
        email,
        password: '***' // No mostrar la contraseña en logs
    });

    try {
        logger.log('🌐 URL base de la API:', attendancesApi.defaults.baseURL);
        logger.log('🎯 URL completa del request:', `${attendancesApi.defaults.baseURL}/register`);

        const { data } = await attendancesApi.post<AuthResponse>('/register', {
            name,
            employee_id,
            email,
            password
        });

        logger.log(`AuthRegister response:`, JSON.stringify(data));

        const result = returnUserToken(data);
        if (!result) {
            logger.error('❌ Error al procesar respuesta de registro');
            return null;
        }

        return result;
    } catch (error: any) {
        logger.log('❌ Error completo en authRegister:', error);
        logger.log('📡 Error message:', error.message);
        logger.log('🔢 Error status:', error.response?.status);
        logger.log('📄 Error data:', error.response?.data);
        logger.log('🌐 Error config URL:', error.config?.url);
        logger.log('🎯 Error config baseURL:', error.config?.baseURL);

        if (error.response?.status === 422) {
            logger.log('🚨 ERROR 422: Datos de validación incorrectos');
            logger.log('🔍 Detalles de validación:', error.response?.data);
        } else if (error.response?.status === 409) {
            logger.log('🚨 ERROR 409: Usuario ya existe');
        }

        return null;
    }
};

export const authCheckStatus = async () => {
    try {
        logger.log('📡 Verificando estado de autenticación con el servidor...');
        const { data } = await attendancesApi.get<AuthResponse>('/check-status');

        logger.log('✅ Respuesta de check-status:', data);

        const result = returnUserToken(data);
        if (!result) {
            logger.error('❌ Error al procesar respuesta de check-status');
            return null;
        }

        return result;
    } catch (error: any) {
        logger.error('❌ Error en authCheckStatus:', error);

        if (error.response?.status === 401) {
            logger.error('🚨 Token expirado o inválido (401)');
        } else if (error.response?.status === 500) {
            logger.error('🚨 Error del servidor (500)');
        } else if (error.code === 'NETWORK_ERROR') {
            logger.error('🚨 Error de red - servidor no disponible');
        }

        return null;
    }
};

/**
 * Valida si una matrícula existe en el sistema (con caché optimizado)
 * @param matricula - Matrícula a validar
 * @returns true si existe, false si no existe, null si hay error
 */
export const validateMatricula = async (matricula: string): Promise<boolean | null> => {
    const normalizedMatricula = matricula.trim().toLowerCase();

    // Limpiar caché expirado periódicamente
    cleanExpiredCache();

    // Verificar si está en caché y no ha expirado
    const cached = matriculaCache.get(normalizedMatricula);
    if (cached) {
        const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
        if (!isExpired) {
            logger.log(`✅ Matrícula encontrada en caché (${normalizedMatricula}):`, cached.result);
            return cached.result;
        } else {
            // Eliminar entrada expirada
            matriculaCache.delete(normalizedMatricula);
            logger.log(`🗑️ Entrada de caché expirada: ${normalizedMatricula}`);
        }
    }

    // No está en caché o expiró, hacer request al servidor
    try {
        logger.log('🔍 Validando matrícula con servidor:', normalizedMatricula);

        const { data } = await attendancesApi.post('/validate-matricula', {
            matricula: normalizedMatricula
        });

        logger.log('📦 Respuesta de validación de matrícula:', data);

        let result: boolean;

        // Asumiendo que la API retorna { success: boolean, exists: boolean }
        if (data.success !== undefined) {
            result = data.success;
        } else if (data.exists !== undefined) {
            // Si la respuesta tiene un campo 'exists'
            result = data.exists;
        } else if (typeof data === 'boolean') {
            // Si la respuesta es directamente un boolean
            result = data;
        } else {
            logger.warn('⚠️ Formato de respuesta inesperado:', data);
            return null;
        }

        // Guardar en caché
        matriculaCache.set(normalizedMatricula, {
            result,
            timestamp: Date.now()
        });
        logger.log(`💾 Matrícula guardada en caché (${normalizedMatricula}):`, result);

        return result;

    } catch (error: any) {
        logger.error('❌ Error al validar matrícula:', error);
        logger.log('🔢 Error status:', error.response?.status);
        logger.log('📄 Error data:', error.response?.data);

        if (error.response?.status === 404) {
            // Si el endpoint retorna 404, la matrícula no existe
            const result = false;
            // Guardar en caché el resultado negativo también
            matriculaCache.set(normalizedMatricula, {
                result,
                timestamp: Date.now()
            });
            logger.log(`💾 Matrícula no encontrada guardada en caché (${normalizedMatricula})`);
            return result;
        }

        return null;
    }
};

//TODO Tarea: hacer el register

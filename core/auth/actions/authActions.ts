import { attendancesApi } from "../api/attendancesApi";
import { AuthResponse, User } from "../interface/user";

const returnUserToken = (data: AuthResponse): { user: User; token: string } | null => {
    if (!data.user || !data.token) {
        console.error('❌ Respuesta de autenticación incompleta:', data);
        return null;
    }

    return {
        user: data.user,
        token: data.token,
    };
};

export const authLogin = async (email: string, password: string) => {
    email = email.toLowerCase();

    console.log(`AuthLogin recibe, ${email} and password ${password}`);

    try {
        const { data } = await attendancesApi.post<AuthResponse>('/login', {
            email, password
        });

        const result = returnUserToken(data);
        if (!result) {
            console.error('❌ Error al procesar respuesta de login');
            return null;
        }

        return result;
    } catch (error: any) {
        console.log('❌ Error completo en authLogin:', error);
        console.log('📡 Error message:', error.message);
        console.log('🔢 Error status:', error.response?.status);
        console.log('📄 Error data:', error.response?.data);
        console.log('🌐 Error config URL:', error.config?.url);
        console.log('🎯 Error config baseURL:', error.config?.baseURL);

        if (error.response?.status === 404) {
            console.log('🚨 ERROR 404: La ruta no existe en el servidor');
            console.log('🔍 Verifica que la URL sea correcta y que Laravel esté corriendo');
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

    console.log(`AuthRegister recibe:`, {
        name,
        employee_id,
        email,
        password: '***' // No mostrar la contraseña en logs
    });

    try {
        console.log('🌐 URL base de la API:', attendancesApi.defaults.baseURL);
        console.log('🎯 URL completa del request:', `${attendancesApi.defaults.baseURL}/register`);

        const { data } = await attendancesApi.post<AuthResponse>('/register', {
            name,
            employee_id,
            email,
            password
        });

        console.log(`AuthRegister response:`, JSON.stringify(data));

        const result = returnUserToken(data);
        if (!result) {
            console.error('❌ Error al procesar respuesta de registro');
            return null;
        }

        return result;
    } catch (error: any) {
        console.log('❌ Error completo en authRegister:', error);
        console.log('📡 Error message:', error.message);
        console.log('🔢 Error status:', error.response?.status);
        console.log('📄 Error data:', error.response?.data);
        console.log('🌐 Error config URL:', error.config?.url);
        console.log('🎯 Error config baseURL:', error.config?.baseURL);

        if (error.response?.status === 422) {
            console.log('🚨 ERROR 422: Datos de validación incorrectos');
            console.log('🔍 Detalles de validación:', error.response?.data);
        } else if (error.response?.status === 409) {
            console.log('🚨 ERROR 409: Usuario ya existe');
        }

        return null;
    }
};

export const authCheckStatus = async () => {
    try {
        console.log('📡 Verificando estado de autenticación con el servidor...');
        const { data } = await attendancesApi.get<AuthResponse>('/check-status');

        console.log('✅ Respuesta de check-status:', data);

        const result = returnUserToken(data);
        if (!result) {
            console.error('❌ Error al procesar respuesta de check-status');
            return null;
        }

        return result;
    } catch (error: any) {
        console.error('❌ Error en authCheckStatus:', error);

        if (error.response?.status === 401) {
            console.error('🚨 Token expirado o inválido (401)');
        } else if (error.response?.status === 500) {
            console.error('🚨 Error del servidor (500)');
        } else if (error.code === 'NETWORK_ERROR') {
            console.error('🚨 Error de red - servidor no disponible');
        }

        return null;
    }
};

/**
 * Valida si una matrícula existe en el sistema
 * @param matricula - Matrícula a validar
 * @returns true si existe, false si no existe
 */
export const validateMatricula = async (matricula: string): Promise<boolean | null> => {
    try {
        console.log('🔍 Validando matrícula:', matricula);

        const { data } = await attendancesApi.post('/validate-matricula', {
            matricula: matricula.trim()
        });

        console.log('📦 Respuesta de validación de matrícula:', data);

        // Asumiendo que la API retorna { success: boolean, exists: boolean }
        if (data.success !== undefined) {
            return data.success;
        }

        // Si la respuesta tiene un campo 'exists'
        if (data.exists !== undefined) {
            return data.exists;
        }

        // Si la respuesta es directamente un boolean
        if (typeof data === 'boolean') {
            return data;
        }

        console.warn('⚠️ Formato de respuesta inesperado:', data);
        return null;

    } catch (error: any) {
        console.error('❌ Error al validar matrícula:', error);
        console.log('🔢 Error status:', error.response?.status);
        console.log('📄 Error data:', error.response?.data);

        if (error.response?.status === 404) {
            // Si el endpoint retorna 404, la matrícula no existe
            return false;
        }

        return null;
    }
};

//TODO Tarea: hacer el register

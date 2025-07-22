import { attendancesApi } from "../api/attendancesApi";
import { User } from "../interface/user";

export interface AuthResponse {
    success: boolean;
    user:    User;
    token:   string;
}

const returnUserToken = (data: AuthResponse):{ user: User; token: string } => {
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
        return returnUserToken(data);
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

export const authCheckStatus = async () => {
    try {
        const { data } = await attendancesApi.get<AuthResponse>('/check-status');
        return returnUserToken(data);
    } catch (error) {
        return null;
    }
};

//TODO Tarea: hacer el register

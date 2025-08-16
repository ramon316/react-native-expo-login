/* Manejo de nuestro usuario e información respectiva */
import { authCheckStatus, authLogin, authRegister } from "@/core/auth/actions/authActions";
import { isUserActive, User } from "@/core/auth/interface/user";
import { SecureStorageAdapter } from "@/helpers/adapters/secure-storage.adapter";
/* Zuztand */
import { create } from "zustand";

/* Estos son los estado de autenticación */
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';

export interface AuthState {
    status: AuthStatus;
    token?: string;
    user?: User;

    changeStatus: (token?:string, user?:User, origin?: string) => Promise<boolean>;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    register: (name: string, employee_id: string, email: string, password: string, confirmPassword: string, matriculaValidated?: boolean) => Promise<boolean>;
    checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    /* Properties */
    status: 'checking',
    token: undefined,
    user: undefined,

    /* Helper function para adaptar usuario */
    adaptUser: (user: User): User => {
        // Agregar campos de compatibilidad
        return {
            ...user,
            // Campos calculados para compatibilidad
            fullName: user.name,
            isActive: isUserActive(user),
            roles: [user.role]
        } as User;
    },

    /* Methods  o actions in Zuztand */
    changeStatus: async (token?:string, user?:User, origin?: string) =>{
        console.log(`🔄 changeStatus llamado desde ${origin || 'UNKNOWN'} con:`, { token: !!token, user: !!user });

        if (!token || !user) {
            console.log(`❌ changeStatus (${origin}): Token o User faltante`);
            /* Si no tenemos respuesta, no se autentico */
            set({ status: 'unauthenticated', token: undefined, user: undefined });
            //todo: llamar a logout
            await SecureStorageAdapter.deleteItem('token');
            /* Ya no seguimos ejecutando */
            return false;
        }

        console.log(`✅ changeStatus (${origin}): Autenticación exitosa`);
        /* Si tenemos respuesta, si se autentico */

        // Adaptar usuario para compatibilidad
        const adaptedUser = get().adaptUser(user);

        set({
            status: 'authenticated',
            token: token,
            user: adaptedUser
        });
        //TODO: guardar token en storage
        await SecureStorageAdapter.setItem('token', token);
        return true;
    },

    checkAuthStatus: async () => {
        console.log('🔍 checkAuthStatus iniciado');

        // Primero verificar si ya tenemos un token en storage
        const existingToken = await SecureStorageAdapter.getItem('token');
        console.log('🔑 Token existente en storage:', !!existingToken);

        if (!existingToken) {
            console.log('❌ No hay token en storage, usuario no autenticado');
            set({ status: 'unauthenticated', token: undefined, user: undefined });
            return;
        }

        // Si tenemos token, verificar con el servidor
        console.log('📡 Verificando token con el servidor...');
        const resp = await authCheckStatus();

        if (resp?.token && resp?.user) {
            console.log('✅ Token válido, usuario autenticado');
            await get().changeStatus(resp.token, resp.user, 'CHECK_STATUS');
        } else {
            console.log('❌ Token inválido o expirado, eliminando...');
            // Solo eliminar si el servidor confirma que el token es inválido
            set({ status: 'unauthenticated', token: undefined, user: undefined });
            await SecureStorageAdapter.deleteItem('token');
        }
    },

    login: async (email: string, password: string) => {
        console.log('🔐 useAuthStore.login iniciado');
        const resp = await authLogin(email, password);
        console.log('📦 Respuesta de authLogin:', resp);
        console.log('🔑 Token recibido:', resp?.token);
        console.log('👤 User recibido:', resp?.user);

        const result = await get().changeStatus(resp?.token, resp?.user, 'LOGIN');
        console.log('✅ Resultado de changeStatus desde LOGIN:', result);
        return result;
    },

    register: async (name: string, employee_id: string, email: string, password: string, confirmPassword: string, matriculaValidated?: boolean) => {
        console.log('🔐 useAuthStore.register iniciado');
        console.log('🎓 Estado de matrícula validada:', matriculaValidated);

        // Validación básica de contraseñas
        if (password !== confirmPassword) {
            console.log('❌ Las contraseñas no coinciden');
            return false;
        }

        const resp = await authRegister(name, employee_id, email, password);
        console.log('📦 Respuesta de authRegister:', resp);
        console.log('🔑 Token recibido:', resp?.token);
        console.log('👤 User recibido:', resp?.user);

        // Si la matrícula no fue validada (false), el usuario quedará pendiente de verificación
        if (matriculaValidated === false && resp?.user) {
            console.log('⚠️ Usuario registrado con matrícula no validada - quedará pendiente de verificación');
            // El estado del usuario ya debería ser 'pending_verification' desde el backend
        } else if (matriculaValidated === true && resp?.user) {
            console.log('✅ Usuario registrado con matrícula validada - cuenta activa');
            // El estado del usuario debería ser 'active' desde el backend
        }

        const result = await get().changeStatus(resp?.token, resp?.user, 'REGISTER');
        console.log('✅ Resultado de changeStatus desde REGISTER:', result);
        return result;
    },

    logout: async () => {
        //TODO, clear toke del secure storage
        SecureStorageAdapter.deleteItem('token');

        set({ 
            status: 'unauthenticated', 
            token: undefined, 
            user: undefined 
        });
    },
}));

/* Manejo de nuestro usuario e información respectiva */
import { authCheckStatus, authLogin, authRegister } from "@/core/auth/actions/authActions";
import { User } from "@/core/auth/interface/user";
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
    register: (name: string, employee_id: string, email: string, password: string, confirmPassword: string) => Promise<boolean>;
    checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    /* Properties */
    status: 'checking',
    token: undefined,
    user: undefined,
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
        set({
            status: 'authenticated',
            token: token,
            user: user
        });
        //TODO: guardar token en storage
        await SecureStorageAdapter.setItem('token', token);
        return true;
    },

    checkAuthStatus: async () => {

        /* Esto esta deshabilitado ya que lo que deseamos es que siempre que entre
        verifique el estado de la autenticación */
        /* Aquí vamos a probar si ya tenemos un usuario */
       /*  if (get().user) { */
            /* set({ status: 'authenticated' }); */
           /*  return;
        } */

        const resp = await authCheckStatus();
        get().changeStatus(resp?.token, resp?.user);
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

    register: async (name: string, employee_id: string, email: string, password: string, confirmPassword: string) => {
        console.log('🔐 useAuthStore.register iniciado');

        // Validación básica de contraseñas
        if (password !== confirmPassword) {
            console.log('❌ Las contraseñas no coinciden');
            return false;
        }

        const resp = await authRegister(name, employee_id, email, password);
        console.log('📦 Respuesta de authRegister:', resp);
        console.log('🔑 Token recibido:', resp?.token);
        console.log('👤 User recibido:', resp?.user);

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

/* Manejo de nuestro usuario e información respectiva */
import { authCheckStatus, authLogin } from "@/core/auth/actions/authActions";
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

    changeStatus: (token?:string, user?:User) => Promise<boolean>;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    /* Properties */
    status: 'checking',
    token: undefined,
    user: undefined,
    /* Methods  o actions in Zuztand */
    changeStatus:  async (token?:string, user?:User) =>{
        if (!token || !user) {
            /* Si no tenemos respuesta, no se autentico */
            set({ status: 'unauthenticated', token: undefined, user: undefined });
            //todo: llamar a logout
            await SecureStorageAdapter.deleteItem('token');
            /* Ya no seguimos ejecutando */
            return false;
        }
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
        const resp = await authLogin(email, password);
        return get().changeStatus(resp?.token, resp?.user);
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

import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

export class SecureStorageAdapter {
    static async setItem(key: string, value: string) {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            Alert.alert('Error', 'Error al guardar el token');
            console.log(error);
        }
    }

    static async getItem(key: string) {
        try {
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            Alert.alert('Error', 'Error al obtener el token');
            console.log(error);
        }
    }

    static async deleteItem(key: string) {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            Alert.alert('Error', 'Error al eliminar el token');
            console.log(error);
        }
    }
}
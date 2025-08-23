import { appLogger as logger } from '@/helpers/logger/appLogger';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

/* Drawer */
import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const CheckAuthenticationLayout = () => {

  /* Verificar el estus de nuestro authentication */
  const { status, checkAuthStatus, logout, user } = useAuthStore();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Función para manejar el logout
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              logger.log('✅ Logout exitoso');
            } catch (error) {
              logger.error('❌ Error en logout:', error);
            }
          },
        },
      ]
    );
  };


  if (status === 'checking') {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator/>
      </View>
    )
  }

  if (status === 'unauthenticated') {
    //TODO: guardar la ruta del usuario, keyValuePear storage retornar a la pantalla despues del login
    return <Redirect href="/auth/login" />
    /* return <Redirect href="/test" /> */
  }

  return (
/*     <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#fff',
        },
        contentStyle: {
          backgroundColor: '#fff',
        },
      }}
    >
      <Stack.Screen
      name='(home)/index'
      options={{
        headerShown: false,
        title: 'Home'
      }}/>

    </Stack> */
    <GestureHandlerRootView style={{ flex: 1}}>
      <Drawer
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f8f9fa',
          },
          headerTintColor: '#333',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              className="mr-4 bg-red-500 px-3 py-2 rounded-lg flex-row items-center"
              activeOpacity={0.7}
            >
              <Text className="text-white text-sm font-medium mr-1">Salir</Text>
            </TouchableOpacity>
          ),
        }}
      >
        <Drawer.Screen
          name='(home)/index'
          options={{
            drawerLabel: 'Asistencias',
            title: 'Asistencias'
          }}
        />
        <Drawer.Screen
          name='qrAttendance/index'
          options={{
            drawerLabel: 'Nueva asistencia',
            title: 'Nueva Asistencia'
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  )

};

export default CheckAuthenticationLayout
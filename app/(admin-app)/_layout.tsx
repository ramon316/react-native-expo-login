import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

/* Drawer */
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const CheckAuthenticationLayout = () => {

  /* Verificar el estus de nuestro authentication */
  const { status, checkAuthStatus} = useAuthStore();

  useEffect(() => {
    checkAuthStatus();
  }, []);


  if (status === 'checking') {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator/>
      </View>
    )
  }

  if (status === 'unauthenticated') {
    //TODO: guardar la ruta del usuario, keyValuePear storage retornar a la pantalla despues del login
    return <Redirect href='/auth/login' />
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
      <Drawer>
        <Drawer.Screen
        name='(dashboard)/index'
        options={{
          drawerLabel: 'Dashboard',
          title: 'Dashboard'
        }}
        />
      </Drawer>
        <Drawer.Screen
          name='events/index'
          options={{
            drawerLabel: 'Eventos',
            title: 'Eventos'
          }}
        />
    </GestureHandlerRootView>
  )

};

export default CheckAuthenticationLayout
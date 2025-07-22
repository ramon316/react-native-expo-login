import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Redirect, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

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
    <Stack
    /* Esto es para que se aplique el color de fondo en neustras pantallas */
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
      
    </Stack>
  )

};

export default CheckAuthenticationLayout
import 'react-native-reanimated'
import React from 'react'

import { Stack } from 'expo-router'
import "../global.css"

const RootLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Pantalla de test accesible sin autenticación */}
      {/* <Stack.Screen
        name="test/index"
        options={{
          headerShown: true,
          title: "🔧 Test API",
          presentation: "modal"
        }}
      /> */}
    </Stack>
  )
}

export default RootLayout
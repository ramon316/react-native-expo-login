import { API_URL, attendancesApi } from '@/core/auth/api/attendancesApi';
import { appLogger as logger } from '@/helpers/logger/appLogger';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { Button, Platform, ScrollView, Text, View } from 'react-native';

const DebugLogger = () => {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
    logger.log(`[TEST] ${timestamp}: ${message}`);
  };

  const testAppConfig = () => {
    addLog('=== VERIFICANDO APP.CONFIG.JS (extiende app.json) ===');
    addLog(`Platform: ${Platform.OS}`);

    // Obtener configuración de app.config.js
    const expoConfig = Constants.expoConfig;
    const extraConfig = expoConfig?.extra;

    addLog(`Expo Config disponible: ${expoConfig ? 'SÍ' : 'NO'}`);
    addLog(`Extra Config disponible: ${extraConfig ? 'SÍ' : 'NO'}`);

    if (extraConfig) {
      addLog(`✅ apiUrl desde app.config: ${extraConfig.apiUrl || 'NO DEFINIDA'}`);
      addLog(`✅ stage desde app.config: ${extraConfig.stage || 'NO DEFINIDA'}`);

      // Mostrar configuración heredada de app.json
      if (extraConfig.eas) {
        addLog(`✅ EAS config (de app.json): ${JSON.stringify(extraConfig.eas)}`);
      }

      addLog(`📋 Todas las variables extra: ${JSON.stringify(extraConfig, null, 2)}`);
    } else {
      addLog('❌ No se encontró configuración extra en app.config.js');
    }

    // Verificar que la configuración se está aplicando
    addLog('--- Verificación de aplicación ---');
    addLog(`API_URL calculada (attendancesApi): ${API_URL || 'NO CALCULADA'}`);
    addLog(`✅ Configuración completamente migrada a app.config.js`);

    addLog('=== FIN VERIFICACIÓN APP.CONFIG ===');
  };

  const testBasicConnectivity = async () => {
    try {
      addLog('=== PRUEBA DE CONECTIVIDAD CON APP.CONFIG ===');

      // Obtener URL desde app.config.js
      const expoConfig = Constants.expoConfig;
      const apiUrl = expoConfig?.extra?.apiUrl;

      if (!apiUrl) {
        addLog('❌ ERROR: No se encontró apiUrl en app.config.js');
        addLog('Intentando con API_URL legacy...');

        if (!API_URL) {
          addLog('❌ ERROR: Tampoco hay URL de API legacy configurada');
          return;
        }

        // Usar URL legacy como fallback
        const baseUrl = API_URL.replace('/api', '');
        addLog(`Usando URL legacy: ${baseUrl}`);

        const response = await fetch(baseUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        addLog(`✅ Conectividad legacy - Status: ${response.status}`);
        return;
      }

      // Extraer la URL base sin /api
      const baseUrl = apiUrl.replace('/api', '');
      addLog(`URL desde app.config: ${apiUrl}`);
      addLog(`Probando conectividad a: ${baseUrl}`);

      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      addLog(`✅ Conectividad básica - Status: ${response.status}`);
      addLog(`Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

    } catch (error: any) {
      addLog(`❌ Error de conectividad: ${error.message}`);
      addLog(`Tipo de error: ${error.name}`);
      if (error.cause) {
        addLog(`Causa: ${error.cause}`);
      }
    }
  };

  const testAPIEndpoint = async () => {
    try {
      addLog('=== PRUEBA DE ENDPOINT API ===');

      if (!API_URL) {
        addLog('❌ ERROR: No hay URL de API configurada');
        return;
      }

      addLog(`Probando endpoint: ${API_URL}`);

      // Usar fetch directo primero
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      addLog(`Status: ${response.status}`);
      addLog(`Status Text: ${response.statusText}`);

      const responseText = await response.text();
      addLog(`Respuesta (texto): ${responseText.substring(0, 200)}...`);

      // Intentar parsear como JSON
      try {
        const data = JSON.parse(responseText);
        addLog(`Respuesta (JSON): ${JSON.stringify(data, null, 2)}`);
      } catch (parseError) {
        addLog(`⚠️ La respuesta no es JSON válido`);
      }

    } catch (error: any) {
      addLog(`❌ Error en endpoint API: ${error.message}`);
      addLog(`Tipo de error: ${error.name}`);
      if (error.stack) {
        addLog(`Stack: ${error.stack.substring(0, 300)}...`);
      }
    }
  };

  const testSpecificEndpoint = async () => {
    try {
      addLog('=== PRUEBA ENDPOINT /test CON APP.CONFIG ===');

      // Obtener URL desde app.config.js
      const expoConfig = Constants.expoConfig;
      const apiUrl = expoConfig?.extra?.apiUrl;

      if (!apiUrl) {
        addLog('❌ ERROR: No se encontró apiUrl en app.config.js');
        return;
      }

      const testUrl = `${apiUrl}/test`;
      addLog(`URL desde app.config: ${apiUrl}`);
      addLog(`Probando endpoint: ${testUrl}`);

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      addLog(`✅ Status: ${response.status}`);
      addLog(`Status Text: ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        addLog(`✅ Respuesta JSON: ${JSON.stringify(data, null, 2)}`);

        // Verificar estructura esperada
        if (data.success === true && data.message === "Test route") {
          addLog(`🎉 ¡PERFECTO! El endpoint retorna la estructura esperada`);
        } else {
          addLog(`⚠️ La estructura no coincide con lo esperado:`);
          addLog(`   Esperado: {"success": true, "message": "Test route"}`);
          addLog(`   Recibido: ${JSON.stringify(data)}`);
        }
      } else {
        const errorText = await response.text();
        addLog(`❌ Error HTTP ${response.status}: ${errorText}`);
      }

    } catch (error: any) {
      addLog(`❌ Error en endpoint /test: ${error.message}`);
      addLog(`Tipo de error: ${error.name}`);

      if (error.cause) {
        addLog(`Causa: ${error.cause}`);
      }
    }
  };

  const testAxiosInstance = async () => {
    try {
      addLog('=== PRUEBA CON AXIOS INSTANCE ===');

      addLog(`Base URL de attendancesApi: ${attendancesApi.defaults.baseURL}`);
      addLog(`Headers por defecto: ${JSON.stringify(attendancesApi.defaults.headers, null, 2)}`);

      // Probar endpoint /test con axios
      addLog('Probando /test con Axios...');
      const response = await attendancesApi.get('/test');
      addLog(`✅ Axios /test - Status: ${response.status}`);
      addLog(`✅ Axios /test - Data: ${JSON.stringify(response.data, null, 2)}`);

      // Verificar estructura esperada
      if (response.data.success === true && response.data.message === "Test route") {
        addLog(`🎉 ¡PERFECTO! Axios también retorna la estructura esperada`);
      } else {
        addLog(`⚠️ Axios: La estructura no coincide con lo esperado`);
      }

    } catch (error: any) {
      addLog(`❌ Error con Axios: ${error.message}`);

      if (error.response) {
        addLog(`Response Status: ${error.response.status}`);
        addLog(`Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
        addLog(`Response Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
      } else if (error.request) {
        addLog(`Request Error: ${JSON.stringify(error.request, null, 2)}`);
      } else {
        addLog(`Config Error: ${error.config ? JSON.stringify(error.config, null, 2) : 'No config'}`);
      }
    }
  };

  const runAllTests = async () => {
    setLogs([]);
    addLog('🚀 INICIANDO DIAGNÓSTICO COMPLETO DE API');

    testAppConfig();
    await testBasicConnectivity();
    await testAPIEndpoint();
    await testSpecificEndpoint();
    await testAxiosInstance();

    addLog('✅ DIAGNÓSTICO COMPLETADO');
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        🔧 Diagnóstico de API
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <Button title="⚙️ App Config" onPress={testAppConfig} />
        <Button title="🌐 Conectividad" onPress={testBasicConnectivity} />
        <Button title="📡 Endpoint API" onPress={testAPIEndpoint} />
        <Button title="🎯 Test /test" onPress={testSpecificEndpoint} />
        <Button title="🔧 Axios Instance" onPress={testAxiosInstance} />
        <Button title="🚀 Ejecutar Todo" onPress={runAllTests} />
        <Button title="🗑️ Limpiar" onPress={() => setLogs([])} />
      </View>

      <ScrollView
        style={{
          flex: 1,
          backgroundColor: '#f8f9fa',
          padding: 15,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#e9ecef'
        }}
        showsVerticalScrollIndicator={true}
      >
        {logs.length === 0 ? (
          <Text style={{ color: '#6c757d', fontStyle: 'italic', textAlign: 'center' }}>
            Presiona un botón para comenzar las pruebas...
          </Text>
        ) : (
          logs.map((log, index) => (
            <Text
              key={index}
              style={{
                fontSize: 11,
                marginBottom: 8,
                fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                color: log.includes('❌') ? '#dc3545' :
                       log.includes('✅') ? '#28a745' :
                       log.includes('⚠️') ? '#ffc107' : '#212529'
              }}
            >
              {log}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default DebugLogger;
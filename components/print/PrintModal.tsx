import { Event } from '@/core/event/interface/event';
import { PDFService } from '@/services/pdfService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { generateEventPrintHTML } from './EventPrintView';

interface PrintModalProps {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  visible,
  event,
  onClose
}) => {

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!event) return null;

  const html = generateEventPrintHTML({ event });

  // Función para manejar la impresión
  const handlePrint = () => {
    Alert.alert(
      'Imprimir Evento',
      '¿Cómo deseas imprimir este evento?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Imprimir',
          onPress: () => {
            // En React Native, la impresión se maneja a través del WebView
            // El usuario puede usar Ctrl+P o Cmd+P en el WebView
            Alert.alert(
              'Instrucciones de Impresión',
              Platform.OS === 'ios' 
                ? 'Usa Cmd+P para imprimir o el botón de compartir para guardar como PDF'
                : 'Usa Ctrl+P para imprimir o el menú del navegador para más opciones',
              [{ text: 'Entendido' }]
            );
          }
        },
        {
          text: 'Generar PDF',
          onPress: handleGeneratePDF
        }
      ]
    );
  };

  // Función para generar y compartir PDF
  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      console.log('📄 Generando PDF para evento:', event.name);

      const success = await PDFService.generateAndSharePDF(event);

      if (success) {
        Alert.alert(
          'PDF Generado',
          'El PDF del evento se ha generado y compartido exitosamente.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      Alert.alert(
        'Error',
        'No se pudo generar el PDF. Inténtalo de nuevo.'
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Función para solo generar PDF (sin compartir)
  const handleSavePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      console.log('💾 Generando PDF para guardar:', event.name);

      const result = await PDFService.generateEventPDF(event);

      if (result.success && result.uri) {
        await PDFService.savePDFToDevice(result.uri, event.name);
      } else {
        Alert.alert(
          'Error',
          result.error || 'No se pudo generar el PDF'
        );
      }
    } catch (error) {
      console.error('Error al guardar PDF:', error);
      Alert.alert(
        'Error',
        'No se pudo generar y guardar el PDF. Inténtalo de nuevo.'
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Función para compartir texto (opción alternativa)
  const handleShareText = async () => {
    try {
      const shareText = `📋 Evento: ${event.name}\n📍 Ubicación: ${event.address || 'No especificada'}\n🕐 Inicio: ${new Date(event.start_time).toLocaleDateString('es-ES')}\n🔲 Código QR: ${event.qr_code}`;

      Alert.alert(
        'Compartir Información',
        shareText,
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Copiar',
            onPress: () => {
              console.log('📋 Información del evento:', shareText);
              Alert.alert('Información Preparada', 'La información del evento está lista para compartir.');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error al compartir texto:', error);
      Alert.alert('Error', 'No se pudo preparar la información para compartir.');
    }
  };

  // Función para manejar mensajes del WebView
  const handleWebViewMessage = (event: any) => {
    const { data } = event.nativeEvent;
    
    if (data === 'print') {
      handlePrint();
    } else if (data === 'close') {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header del modal */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="print-outline" size={24} color="#3b82f6" />
          <Text className="text-lg font-semibold text-gray-900 ml-2">
            Vista de Impresión
          </Text>
        </View>
        
        <View className="flex-row items-center space-x-2">
          {/* Botón Generar PDF */}
          <TouchableOpacity
            onPress={handleGeneratePDF}
            className="bg-red-500 px-3 py-2 rounded-lg flex-row items-center"
            activeOpacity={0.7}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="document-outline" size={16} color="white" />
            )}
            <Text className="text-white font-medium ml-1 text-sm">
              {isGeneratingPDF ? 'Generando...' : 'PDF'}
            </Text>
          </TouchableOpacity>

          {/* Botón Guardar PDF */}
          <TouchableOpacity
            onPress={handleSavePDF}
            className="bg-green-500 px-3 py-2 rounded-lg flex-row items-center"
            activeOpacity={0.7}
            disabled={isGeneratingPDF}
          >
            <Ionicons name="save-outline" size={16} color="white" />
            <Text className="text-white font-medium ml-1 text-sm">Guardar</Text>
          </TouchableOpacity>

          {/* Botón Compartir Texto */}
          <TouchableOpacity
            onPress={handleShareText}
            className="bg-blue-500 px-3 py-2 rounded-lg flex-row items-center"
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={16} color="white" />
            <Text className="text-white font-medium ml-1 text-sm">Texto</Text>
          </TouchableOpacity>

          {/* Botón Cerrar */}
          <TouchableOpacity
            onPress={onClose}
            className="bg-gray-500 px-3 py-2 rounded-lg"
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* WebView con la vista de impresión */}
      <WebView
        source={{ html }}
        style={{ flex: 1 }}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View className="flex-1 justify-center items-center bg-white">
            <Ionicons name="print-outline" size={48} color="#3b82f6" />
            <Text className="text-gray-600 mt-4">Preparando vista de impresión...</Text>
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error: ', nativeEvent);
          Alert.alert(
            'Error',
            'No se pudo cargar la vista de impresión. Inténtalo de nuevo.',
            [
              { text: 'Cerrar', onPress: onClose }
            ]
          );
        }}
        // Permitir zoom para mejor visualización
        scalesPageToFit={true}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={false}
      />

      {/* Footer con instrucciones */}
      <View className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <Text className="text-sm text-gray-600 text-center">
          💡 Tip: {Platform.OS === 'ios' ? 'Usa Cmd+P' : 'Usa Ctrl+P'} para imprimir directamente desde la vista
        </Text>
      </View>
    </Modal>
  );
};

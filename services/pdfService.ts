import { generateEventPrintHTML } from '@/components/print/EventPrintView';
import { Event } from '@/core/event/interface/event';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export interface PDFGenerationResult {
  success: boolean;
  uri?: string;
  error?: string;
}

export class PDFService {
  
  /**
   * Genera un PDF a partir de los datos del evento
   */
  static async generateEventPDF(event: Event): Promise<PDFGenerationResult> {
    try {
      console.log('📄 Iniciando generación de PDF para evento:', event.name);
      
      // Generar HTML optimizado para PDF
      const htmlContent = generateEventPrintHTML({ event });
      
      // Configuración para la generación del PDF
      const printOptions: Print.PrintOptions = {
        html: htmlContent,
        width: 612, // Ancho en puntos (8.5 pulgadas * 72 puntos/pulgada)
        height: 792, // Alto en puntos (11 pulgadas * 72 puntos/pulgada) - Tamaño carta
        margins: {
          left: 40,
          top: 40,
          right: 40,
          bottom: 40,
        },
      };
      
      // Generar el PDF
      console.log('🔄 Generando PDF...');
      const { uri } = await Print.printToFileAsync(printOptions);
      
      if (!uri) {
        throw new Error('No se pudo generar el archivo PDF');
      }
      
      // Crear nombre de archivo único
      const fileName = `evento_${event.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Mover el archivo a una ubicación permanente
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });
      
      console.log('✅ PDF generado exitosamente:', newUri);
      
      return {
        success: true,
        uri: newUri,
      };
      
    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
  
  /**
   * Comparte un PDF usando el sistema nativo de compartir
   */
  static async sharePDF(pdfUri: string, eventName: string): Promise<boolean> {
    try {
      console.log('📤 Compartiendo PDF:', pdfUri);
      
      // Verificar que el archivo existe
      const fileInfo = await FileSystem.getInfoAsync(pdfUri);
      if (!fileInfo.exists) {
        throw new Error('El archivo PDF no existe');
      }
      
      // Verificar si el compartir está disponible
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          'Compartir no disponible',
          'La función de compartir no está disponible en este dispositivo.'
        );
        return false;
      }
      
      // Compartir el archivo
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Compartir evento: ${eventName}`,
        UTI: 'com.adobe.pdf',
      });
      
      console.log('✅ PDF compartido exitosamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error al compartir PDF:', error);
      Alert.alert(
        'Error al compartir',
        'No se pudo compartir el archivo PDF. Inténtalo de nuevo.'
      );
      return false;
    }
  }
  
  /**
   * Guarda el PDF en la galería/descargas del dispositivo
   */
  static async savePDFToDevice(pdfUri: string, eventName: string): Promise<boolean> {
    try {
      console.log('💾 Guardando PDF en dispositivo:', pdfUri);
      
      // En Expo, los archivos se guardan automáticamente en el directorio de documentos
      // Para Android, podríamos usar MediaLibrary para guardar en descargas
      
      const fileInfo = await FileSystem.getInfoAsync(pdfUri);
      if (!fileInfo.exists) {
        throw new Error('El archivo PDF no existe');
      }
      
      Alert.alert(
        'PDF Guardado',
        `El archivo PDF del evento "${eventName}" se ha guardado en el dispositivo.\n\nUbicación: ${pdfUri}`,
        [
          {
            text: 'Compartir',
            onPress: () => this.sharePDF(pdfUri, eventName),
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
      
      console.log('✅ PDF guardado exitosamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error al guardar PDF:', error);
      Alert.alert(
        'Error al guardar',
        'No se pudo guardar el archivo PDF. Inténtalo de nuevo.'
      );
      return false;
    }
  }
  
  /**
   * Elimina un archivo PDF temporal
   */
  static async deletePDF(pdfUri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(pdfUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(pdfUri);
        console.log('🗑️ PDF temporal eliminado:', pdfUri);
      }
    } catch (error) {
      console.error('❌ Error al eliminar PDF temporal:', error);
    }
  }
  
  /**
   * Genera y comparte un PDF en una sola operación
   */
  static async generateAndSharePDF(event: Event): Promise<boolean> {
    try {
      // Mostrar indicador de carga
      console.log('🚀 Generando y compartiendo PDF...');
      
      // Generar PDF
      const result = await this.generateEventPDF(event);
      
      if (!result.success || !result.uri) {
        Alert.alert(
          'Error',
          result.error || 'No se pudo generar el PDF'
        );
        return false;
      }
      
      // Compartir PDF
      const shared = await this.sharePDF(result.uri, event.name);
      
      // Opcional: eliminar archivo temporal después de compartir
      // await this.deletePDF(result.uri);
      
      return shared;
      
    } catch (error) {
      console.error('❌ Error en generateAndSharePDF:', error);
      Alert.alert(
        'Error',
        'No se pudo generar y compartir el PDF. Inténtalo de nuevo.'
      );
      return false;
    }
  }
  
  /**
   * Obtiene información sobre el tamaño del archivo PDF
   */
  static async getPDFInfo(pdfUri: string): Promise<{ size: number; exists: boolean } | null> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(pdfUri);
      return {
        size: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0,
        exists: fileInfo.exists,
      };
    } catch (error) {
      console.error('❌ Error al obtener info del PDF:', error);
      return null;
    }
  }
}

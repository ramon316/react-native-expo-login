import React, { FC, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

interface DateTimeFieldState {
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
}

interface PureDateTimePickerProps {
  value: Date | null;
  onDateChange: (date: Date) => void;
  minimumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
  placeholder?: string;
}

const defaultStyles = {
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 400,
  } as ViewStyle,
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333'
  } as TextStyle,
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#fafafa'
  } as TextStyle,
  quickButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    margin: 2
  } as ViewStyle,
  quickButtonText: {
    color: '#666',
    fontSize: 12
  } as TextStyle
};

const PureDateTimePicker: FC<PureDateTimePickerProps> = ({ 
  value, 
  onDateChange, 
  minimumDate,
  mode = "datetime",
  placeholder = "Seleccionar fecha"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tempDateTime, setTempDateTime] = useState<DateTimeFieldState>({
    day: value ? value.getDate().toString().padStart(2, '0') : '',
    month: value ? (value.getMonth() + 1).toString().padStart(2, '0') : '',
    year: value ? value.getFullYear().toString() : '',
    hour: value ? value.getHours().toString().padStart(2, '0') : '09',
    minute: value ? value.getMinutes().toString().padStart(2, '0') : '00'
  });

  const formatDateTime = (date: Date | null): string => {
    if (!date) return placeholder;
    
    if (mode === "date") {
      return date.toLocaleDateString('es-ES');
    } else if (mode === "time") {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const validateAndSetDateTime = (): void => {
    const { day, month, year, hour, minute } = tempDateTime;
    
    if (mode !== "time" && (!day || !month || !year)) {
      Alert.alert('Error', 'Por favor completa la fecha');
      return;
    }
    
    if (mode !== "date" && (!hour || !minute)) {
      Alert.alert('Error', 'Por favor completa la hora');
      return;
    }

    const dayNum = mode === "time" ? 1 : parseInt(day);
    const monthNum = mode === "time" ? 1 : parseInt(month);
    const yearNum = mode === "time" ? 2024 : parseInt(year);
    const hourNum = mode === "date" ? 0 : parseInt(hour);
    const minuteNum = mode === "date" ? 0 : parseInt(minute);

    if (mode !== "time") {
      if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) {
        Alert.alert('Error', 'Fecha inválida');
        return;
      }
    }
    
    if (mode !== "date") {
      if (hourNum < 0 || hourNum > 23 || minuteNum < 0 || minuteNum > 59) {
        Alert.alert('Error', 'Hora inválida');
        return;
      }
    }

    const newDate = new Date(yearNum, monthNum - 1, dayNum, hourNum, minuteNum);
    
    if (minimumDate && newDate < minimumDate) {
      Alert.alert('Error', 'La fecha debe ser posterior a la fecha mínima');
      return;
    }

    onDateChange(newDate);
    setIsVisible(false);
  };

  const updateDateTime = (field: keyof DateTimeFieldState, text: string): void => {
    let numericText = text.replace(/[^0-9]/g, '');
    let maxLength = 2;
    if (field === 'year') maxLength = 4;
    
    const truncatedText = numericText.substring(0, maxLength);
    
    setTempDateTime(prev => ({ ...prev, [field]: truncatedText }));
  };

  const getQuickDateTime = (daysFromNow: number, hour = 9, minute = 0): void => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    if (mode !== "date") {
      date.setHours(hour, minute, 0, 0);
    }
    onDateChange(date);
    setIsVisible(false);
  };

  if (!isVisible) {
    return (
      <TouchableOpacity 
        style={{
          backgroundColor: 'white',
          padding: 15,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#ddd',
          alignItems: 'center'
        }}
        onPress={() => setIsVisible(true)}
      >
        <Text style={{ fontSize: 16, color: '#333' }}>
          📅 {formatDateTime(value)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={defaultStyles.container}>
      <Text style={defaultStyles.title}>
        {mode === "date" ? "Seleccionar Fecha" : 
         mode === "time" ? "Seleccionar Hora" : 
         "Seleccionar Fecha y Hora"}
      </Text>

      {/* Botones rápidos */}
      {mode !== "time" && (
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          marginBottom: 20,
          flexWrap: 'wrap'
        }}>
          <TouchableOpacity 
            style={defaultStyles.quickButton}
            onPress={() => getQuickDateTime(0, 9, 0)}
          >
            <Text style={defaultStyles.quickButtonText}>Hoy 9:00</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={defaultStyles.quickButton}
            onPress={() => getQuickDateTime(1, 9, 0)}
          >
            <Text style={defaultStyles.quickButtonText}>Mañana 9:00</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={defaultStyles.quickButton}
            onPress={() => getQuickDateTime(7, 10, 0)}
          >
            <Text style={defaultStyles.quickButtonText}>+7 días 10:00</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={{ maxHeight: 200 }}>
        {/* Inputs de fecha */}
        {mode !== "time" && (
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: 20 
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Día</Text>
              <TextInput
                style={[defaultStyles.input, { width: 50 }]}
                value={tempDateTime.day}
                onChangeText={(text) => updateDateTime('day', text)}
                placeholder="DD"
                maxLength={2}
                keyboardType="numeric"
              />
            </View>

            <Text style={{ fontSize: 20, color: '#666', marginHorizontal: 10, fontWeight: 'bold' }}>
              /
            </Text>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Mes</Text>
              <TextInput
                style={[defaultStyles.input, { width: 50 }]}
                value={tempDateTime.month}
                onChangeText={(text) => updateDateTime('month', text)}
                placeholder="MM"
                maxLength={2}
                keyboardType="numeric"
              />
            </View>

            <Text style={{ fontSize: 20, color: '#666', marginHorizontal: 10, fontWeight: 'bold' }}>
              /
            </Text>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Año</Text>
              <TextInput
                style={[defaultStyles.input, { width: 70 }]}
                value={tempDateTime.year}
                onChangeText={(text) => updateDateTime('year', text)}
                placeholder="YYYY"
                maxLength={4}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}

        {/* Inputs de hora */}
        {mode !== "date" && (
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: 20 
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Hora</Text>
              <TextInput
                style={[defaultStyles.input, { width: 50 }]}
                value={tempDateTime.hour}
                onChangeText={(text) => updateDateTime('hour', text)}
                placeholder="HH"
                maxLength={2}
                keyboardType="numeric"
              />
            </View>

            <Text style={{ fontSize: 20, color: '#666', marginHorizontal: 10, fontWeight: 'bold' }}>
              :
            </Text>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Min</Text>
              <TextInput
                style={[defaultStyles.input, { width: 50 }]}
                value={tempDateTime.minute}
                onChangeText={(text) => updateDateTime('minute', text)}
                placeholder="MM"
                maxLength={2}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}

        {/* Selectores rápidos de hora */}
        {mode !== "date" && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 10, textAlign: 'center' }}>
              Horas comunes:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['09:00', '10:00', '14:00', '15:00', '16:00', '18:00', '20:00'].map(time => (
                <TouchableOpacity 
                  key={time}
                  style={{ 
                    backgroundColor: '#e8f4f8', 
                    paddingHorizontal: 10, 
                    paddingVertical: 6, 
                    borderRadius: 4, 
                    margin: 2 
                  }}
                  onPress={() => {
                    const [h, m] = time.split(':');
                    setTempDateTime(prev => ({ ...prev, hour: h, minute: m }));
                  }}
                >
                  <Text style={{ color: '#0066cc', fontSize: 12 }}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botones de acción */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <TouchableOpacity 
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: '#f5f5f5',
            marginHorizontal: 5,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#ddd'
          }}
          onPress={() => setIsVisible(false)}
        >
          <Text style={{ textAlign: 'center', color: '#666', fontWeight: '600' }}>
            Cancelar
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: '#007AFF',
            marginHorizontal: 5,
            borderRadius: 6
          }}
          onPress={validateAndSetDateTime}
        >
          <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>
            Confirmar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PureDateTimePicker;

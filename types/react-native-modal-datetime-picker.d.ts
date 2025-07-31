declare module 'react-native-modal-datetime-picker' {
  import { Component } from 'react';

  export interface DateTimePickerModalProps {
    isVisible: boolean;
    mode?: 'date' | 'time' | 'datetime';
    onConfirm: (date: Date) => void;
    onCancel: () => void;
    minimumDate?: Date;
    maximumDate?: Date;
    locale?: string;
    headerTextIOS?: string;
    confirmTextIOS?: string;
    cancelTextIOS?: string;
    date?: Date;
    is24Hour?: boolean;
    display?: 'default' | 'spinner' | 'calendar' | 'clock';
  }

  export default class DateTimePickerModal extends Component<DateTimePickerModalProps> {}
}

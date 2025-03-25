// src/types/common.ts

// Common utility types
export type Optional<T> = T | undefined | null;

export interface Dictionary<T> {
  [key: string]: T;
}

// Navigation params types
export interface NavigationParams {
  [key: string]: any;
}

// Common form input types
export interface FormInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
}

// Common button props
export interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
}
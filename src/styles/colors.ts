// src/styles/colors.ts

// Color palette for the app
export interface ColorPalette {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  text: string;
  textLight: string;
  background: string;
  backgroundLight: string;
  border: string;
  // Add any additional colors used in your app
  lightPrimary?: string;
  lightSuccess?: string;
  error?: string;
  white?: string;
  black?: string;
  grey100?: string;
  grey200?: string;
  grey300?: string;
  grey400?: string;
  grey500?: string;
  grey600?: string;
  grey700?: string;
  grey800?: string;
  grey900?: string;
  gold?: string;
  lightBlue?: string;
  lightGrey?: string;
}

export const COLORS: ColorPalette = {
  primary: '#4A80F0',
  secondary: '#6C63FF',
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  text: '#333333',
  textLight: '#888888',
  background: '#FFFFFF',
  backgroundLight: '#F8F8F8',
  border: '#EEEEEE',
  // Add values for any additional colors defined in the interface
  lightPrimary: '#E6EFFF',
  lightSuccess: '#E8F5E9',
  error: '#F44336', // Same as danger
  white: '#FFFFFF',
  black: '#000000',
  grey100: '#F5F5F5',
  grey200: '#EEEEEE',
  grey300: '#E0E0E0',
  grey400: '#BDBDBD',
  grey500: '#9E9E9E',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',
  gold: '#FFD700',
  lightBlue: '#E3F2FD',
  lightGrey: '#F5F5F5'
};
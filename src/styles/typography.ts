// src/styles/typography.ts
import { TextStyle } from 'react-native';

// Typography styles interface
export interface TypographyStyles {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  subtitle: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  button: TextStyle;
  // Add any additional typography styles used in your app
}

// Define the typography styles to be used across the app
const typography: TypographyStyles = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333', // Use COLORS.text
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333', // Use COLORS.text
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333', // Use COLORS.text
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333', // Use COLORS.text
  },
  body: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#333333', // Use COLORS.text
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#888888', // Use COLORS.textLight
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // Use COLORS.white
  },
};

export default typography;
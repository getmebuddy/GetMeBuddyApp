// src/styles/spacing.ts

// Spacing interface
export interface SpacingValues {
    xs: number;
    small: number;
    standard: number;
    large: number;
    extraLarge: number;
  }
  
  // Define standardized spacing values to be used across the app
  const spacing: SpacingValues = {
    xs: 4,
    small: 8,
    standard: 16,
    large: 24,
    extraLarge: 32,
  };
  
  export default spacing;
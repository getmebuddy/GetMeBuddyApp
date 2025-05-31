// src/styles/__mocks__/typography.ts
import { COLORS } from './colors'; // Mocked COLORS

// Define a base text style if needed, though components usually define their own fontFamily.
const baseText = {
  // fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // Example
  color: COLORS.text,
};

export const TYPOGRAPHY = {
  h1: { ...baseText, fontSize: 26, fontWeight: 'bold' },
  h2: { ...baseText, fontSize: 22, fontWeight: 'bold' },
  h3: { ...baseText, fontSize: 18, fontWeight: '600' },
  subtitle: { ...baseText, fontSize: 16, fontWeight: 'normal' },
  body: { ...baseText, fontSize: 14, lineHeight: 14 * 1.5 },
  caption: { ...baseText, fontSize: 12, color: COLORS.textSecondary },
  button: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  buttonSmall: { fontSize: 14, fontWeight: 'bold', color: COLORS.white },
  buttonLink: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  // Add any other typography styles used in the application
};

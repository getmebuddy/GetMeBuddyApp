// src/utils/locationUtils.ts

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  altitudeAccuracy?: number | null;
}

// In a real app, this would use react-native-geolocation-service or Expo's Location API
// For now, these are placeholders that can be used in tests if not globally mocked.

export const getLocation = jest.fn((): Promise<LocationCoords | null> => {
  console.log('[ACTUAL-MOCK] getLocation called - returning default mock location');
  return Promise.resolve({
    latitude: 37.7749, // Default mock location
    longitude: -122.4194,
    accuracy: 100,
  });
});

export const checkLocationPermission = jest.fn((): Promise<boolean> => {
  console.log('[ACTUAL-MOCK] checkLocationPermission called - returning true');
  return Promise.resolve(true);
});

export const requestLocationPermission = jest.fn((): Promise<boolean> => {
  console.log('[ACTUAL-MOCK] requestLocationPermission called - returning true');
  return Promise.resolve(true);
});

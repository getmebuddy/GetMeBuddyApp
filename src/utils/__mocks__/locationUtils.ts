// src/utils/__mocks__/locationUtils.ts

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  altitudeAccuracy?: number | null;
}

export const getLocation = jest.fn((): Promise<LocationCoords | null> => {
  console.log('[MOCK] getLocation called');
  return Promise.resolve({
    latitude: 37.7749, // Default mock location (e.g., San Francisco)
    longitude: -122.4194,
    accuracy: 100,
  });
});

export const checkLocationPermission = jest.fn(() => Promise.resolve(true));
export const requestLocationPermission = jest.fn(() => Promise.resolve(true));

// Add any other functions exported by the actual locationUtils module
// that are used by components under test.

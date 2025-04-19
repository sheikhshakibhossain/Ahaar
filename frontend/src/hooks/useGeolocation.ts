import { useState, useEffect } from 'react';

interface GeolocationState {
  location: {
    latitude: number;
    longitude: number;
  } | null;
  error: {
    message: string;
  } | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: { message: 'Geolocation is not supported by your browser' },
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
        });
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error: { message: error.message },
        }));
      }
    );
  }, []);

  return state;
}; 
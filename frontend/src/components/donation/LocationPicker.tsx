import React, { useState, useEffect } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';

interface Location {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  initialLocation 
}) => {
  const { location: userLocation, error: locationError } = useGeolocation();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );

  useEffect(() => {
    if (userLocation && !selectedLocation && !initialLocation) {
      const location = {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      };
      setSelectedLocation(location);
      onLocationSelect(location);
    }
  }, [userLocation, selectedLocation, initialLocation, onLocationSelect]);

  const handleLocationSelect = (lat: number, lng: number) => {
    const location = { lat, lng };
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  const defaultLocation = selectedLocation || 
    (userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : { lat: 0, lng: 0 });

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Pickup Location
      </label>
      <div className="border border-gray-300 rounded-md overflow-hidden">
        <div className="relative bg-gray-100 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">Current Location</p>
            <p className="text-sm text-gray-500">
              {defaultLocation.lat.toFixed(6)}, {defaultLocation.lng.toFixed(6)}
            </p>
          </div>
        </div>
        <div className="p-4 bg-white">
          <p className="text-sm font-medium mb-2">Adjust Location</p>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handleLocationSelect(defaultLocation.lat + 0.01, defaultLocation.lng)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm"
            >
              Move North
            </button>
            <button 
              onClick={() => handleLocationSelect(defaultLocation.lat - 0.01, defaultLocation.lng)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm"
            >
              Move South
            </button>
            <button 
              onClick={() => handleLocationSelect(defaultLocation.lat, defaultLocation.lng - 0.01)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm"
            >
              Move West
            </button>
            <button 
              onClick={() => handleLocationSelect(defaultLocation.lat, defaultLocation.lng + 0.01)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm"
            >
              Move East
            </button>
          </div>
        </div>
      </div>
      {locationError && (
        <p className="mt-2 text-sm text-red-600">
          Error getting location: {locationError.message}
        </p>
      )}
      {selectedLocation && (
        <p className="mt-2 text-sm text-gray-500">
          Selected location: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}; 
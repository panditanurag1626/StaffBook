"use client";

import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { FiMapPin, FiSearch } from 'react-icons/fi';
import { getCurrentLocation } from '../../lib/utils';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '0.5rem',
};

const defaultCenter = {
    lat: 28.6139,
    lng: 77.209,
};

interface LocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    initialLocation?: string;
    onLocationSelect: (data: {
        latitude: string;
        longitude: string;
        location: string;
    }) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
    initialLat,
    initialLng,
    initialLocation,
    onLocationSelect
}) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAYth6W-TTXAdXotw1ZlhjRLrsYjrSidYo',
        libraries,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>({
        lat: initialLat || defaultCenter.lat,
        lng: initialLng || defaultCenter.lng,
    });
    const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation || '');
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (!initialLat && !initialLng) {
            getCurrentLocation()
                .then(loc => {
                    setMarkerPosition(loc);
                    if (map) {
                        map.panTo(loc);
                        
                        try {
                            const geocoder = new google.maps.Geocoder();
                            geocoder.geocode({ location: loc })
                                .then(response => {
                                    if (response.results && response.results[0]) {
                                        const address = response.results[0].formatted_address;
                                        setSelectedLocation(address);
                                        onLocationSelect({
                                            latitude: loc.lat.toString(),
                                            longitude: loc.lng.toString(),
                                            location: address,
                                        });
                                    }
                                });
                        } catch (err) {
                            console.error("Auto geocoding failed", err);
                        }
                    }
                })
                .catch(err => {
                    console.error("Geolocation failed:", err);
                });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLat, initialLng, map]);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const onAutocompleteLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const newPosition = { lat, lng };

                setMarkerPosition(newPosition);
                setSelectedLocation(place.formatted_address || '');

                if (map) {
                    map.panTo(newPosition);
                    map.setZoom(15);
                }

                onLocationSelect({
                    latitude: lat.toString(),
                    longitude: lng.toString(),
                    location: place.formatted_address || '',
                });
            }
        }
    };

    const onMarkerDragEnd = async (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            const newPosition = { lat, lng };

            setMarkerPosition(newPosition);

            // Reverse geocode to get address
            try {
                const geocoder = new google.maps.Geocoder();
                const response = await geocoder.geocode({ location: newPosition });

                if (response.results[0]) {
                    const address = response.results[0].formatted_address;
                    setSelectedLocation(address);

                    onLocationSelect({
                        latitude: lat.toString(),
                        longitude: lng.toString(),
                        location: address,
                    });
                }
            } catch (error) {
                console.error('Geocoding error:', error);
            }
        }
    };

    const onMapClick = async (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            const newPosition = { lat, lng };

            setMarkerPosition(newPosition);

            // Reverse geocode to get address
            try {
                const geocoder = new google.maps.Geocoder();
                const response = await geocoder.geocode({ location: newPosition });

                if (response.results[0]) {
                    const address = response.results[0].formatted_address;
                    setSelectedLocation(address);

                    onLocationSelect({
                        latitude: lat.toString(),
                        longitude: lng.toString(),
                        location: address,
                    });
                }
            } catch (error) {
                console.error('Geocoding error:', error);
            }
        }
    };

    if (!isLoaded) {
        return (
            <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-gray-500">Loading map...</div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <style>{`
                .pac-container {
                    z-index: 99999 !important;
                }
            `}</style>
            {/* Search Box */}
            <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Autocomplete
                    onLoad={onAutocompleteLoad}
                    onPlaceChanged={onPlaceChanged}
                >
                    <input
                        ref={searchInputRef}
                        type="text"
                        defaultValue={selectedLocation}
                        placeholder="Search for a location..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </Autocomplete>
            </div>

            {/* Map */}
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={markerPosition}
                    zoom={13}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={onMapClick}
                    options={{
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: true,
                    }}
                >
                    <Marker
                        position={markerPosition}
                        draggable={true}
                        onDragEnd={onMarkerDragEnd}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: '#8b5cf6',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 3,
                        }}
                    />
                </GoogleMap>
            </div>

            {/* Selected Location Display */}
            {selectedLocation && (
                <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <FiMapPin className="text-purple-600 mt-0.5 flex-shrink-0" size={18} />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">Selected Location</p>
                        <p className="text-sm text-gray-700 break-words">{selectedLocation}</p>
                    </div>
                </div>
            )}

            <p className="text-xs text-gray-500 italic">
                💡 Click on the map or drag the marker to select your preferred location
            </p>
        </div>
    );
};

export default LocationPicker;

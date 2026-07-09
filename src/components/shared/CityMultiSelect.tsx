'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiCheck } from 'react-icons/fi';
import { commonService } from '@/lib/api/services/commonService';
import { THEME } from '@/styles/theme';

interface City {
  id: number;
  name: string;
  state_id?: number;
}

interface CityMultiSelectProps {
  selectedCities: string[];
  onChange: (cities: string[]) => void;
  label?: string;
  placeholder?: string;
}

const CityMultiSelect: React.FC<CityMultiSelectProps> = ({
  selectedCities,
  onChange,
  label = 'Preferred Locations',
  placeholder = 'Search cities...',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchCities = async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await commonService.searchCities(q);
      const cities = response.data?.city || response.data?.data?.city || [];
      setResults(cities);
    } catch (error) {
      console.error('Failed to search cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      searchCities(value);
    }, 500);
  };

  const toggleCity = (cityName: string) => {
    if (selectedCities.includes(cityName)) {
      onChange(selectedCities.filter(c => c !== cityName));
    } else {
      onChange([...selectedCities, cityName]);
    }
    setQuery('');
    setIsOpen(false);
  };

  const removeCity = (cityName: string) => {
    onChange(selectedCities.filter(c => c !== cityName));
  };

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      {/* Selected Cities Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedCities.map(city => (
          <span
            key={city}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100 animate-fadeIn"
          >
            {city}
            <button
              type="button"
              onClick={() => removeCity(city)}
              className="hover:text-purple-900 transition-colors"
            >
              <FiX size={14} />
            </button>
          </span>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <FiSearch size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="text-black w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition-all bg-gray-50"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute z-[100] mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto glass-purple-scrollbar animate-slideIn">
          {results.length > 0 ? (
            results.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => toggleCity(city.name)}
                className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center justify-between transition-colors group"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 group-hover:text-purple-700">{city.name}</span>
                  {/* {city.state_id && ( */}
                  {/* <span className="text-[10px] text-gray-500 uppercase tracking-wider">State ID: {city.state_id}</span> */}
                  {/* )} */}
                </div>
                {selectedCities.includes(city.name) && (
                  <FiCheck className="text-purple-600" />
                )}
              </button>
            ))
          ) : !loading && query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500 text-sm italic">
              No cities found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default CityMultiSelect;

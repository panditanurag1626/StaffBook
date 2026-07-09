'use client';

import React, { useState } from 'react';
import { Search, MapPin, ChevronDown, X } from 'lucide-react';
import { FilterOption } from '../../data/jobFilters';
import { THEME } from '@/styles/theme';

interface FilterPanelProps {
  filters: FilterOption[];
  onFilterChange: (filterValue: string, value: string | number) => void;
}

export default function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [filterValues, setFilterValues] = useState<Record<string, string | number>>({});

  const toggleDropdown = (filterValue: string) => {
    const newOpenDropdowns = new Set(openDropdowns);
    if (newOpenDropdowns.has(filterValue)) {
      newOpenDropdowns.delete(filterValue);
    } else {
      newOpenDropdowns.add(filterValue);
    }
    setOpenDropdowns(newOpenDropdowns);
  };

  const handleInputChange = (filterValue: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [filterValue]: value }));
    onFilterChange(filterValue, value);
  };

  const handleSliderChange = (filterValue: string, value: number) => {
    setFilterValues(prev => ({ ...prev, [filterValue]: value }));
    onFilterChange(filterValue, value);
  };

  const handleOptionSelect = (filterValue: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [filterValue]: value }));
    onFilterChange(filterValue, value);
    toggleDropdown(filterValue);
  };

  const renderFilterInput = (filter: FilterOption) => {
    switch (filter.type) {
      case 'input':
        return (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-700" />
            <input
              type="text"
              placeholder={filter.placeholder}
              value={filterValues[filter.value] || ''}
              onChange={(e) => handleInputChange(filter.value, e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-gray-700 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        );

      case 'dropdown':
        return (
          <div className="relative">
            <button
              onClick={() => toggleDropdown(filter.value)}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <span className="text-gray-700">
                {filterValues[filter.value] || filter.placeholder}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {openDropdowns.has(filter.value) && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {filter.options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect(filter.value, option.value)}
                    className="w-full px-4 py-2 text-gray-700 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'slider':
        const currentValue = filterValues[filter.value] || filter.min || 0;
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{filter.label}</span>
              <span className="text-sm font-medium text-gray-900">
                {filter.unit === '$' ? `${filter.unit}${currentValue}` : `${currentValue}${filter.unit}`}
              </span>
            </div>
            <input
              type="range"
              min={filter.min}
              max={filter.max}
              step={filter.step}
              value={currentValue}
              onChange={(e) => handleSliderChange(filter.value, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
              style={{
                // Convert currentValue to a percentage of the slider range (0-100)
                background: `linear-gradient(to right, ${THEME.colors.primary} ${((Number(currentValue) - (filter.min || 0)) / ((filter.max || 100) - (filter.min || 0)) * 100)}%, #e5e7eb ${((Number(currentValue) - (filter.min || 0)) / ((filter.max || 100) - (filter.min || 0)) * 100)}%)`
              }}                              
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>
      
      <div className="space-y-6">
        {filters.map((filter) => (
          <div key={filter.value}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filter.label}
            </label>
            {renderFilterInput(filter)}
          </div>
        ))}
      </div>
      
      {/* Clear Filters Button */}
      <button
        onClick={() => {
          setFilterValues({});
          setOpenDropdowns(new Set());
        }}
        className="w-full mt-6 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
} 
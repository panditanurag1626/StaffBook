'use client';

import React, { memo } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import type { ComparisonFeature } from '@/types/subscription';
import Card from '../shared/Card';
import { THEME } from '@/styles/theme';

interface ComparisonTableProps {
  features: readonly ComparisonFeature[];
}

export const ComparisonTable = memo<ComparisonTableProps>(({ features }) => {
  const renderCell = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <FiCheck 
            size={16} 
            className="text-green-600" 
            aria-label="Included"
          />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mx-auto">
          <FiX 
            size={16} 
            className="text-gray-400" 
            aria-label="Not included"
          />
        </div>
      );
    }
    return <span className={THEME.components.typography.body}>{value}</span>;
  };

  return (
    <Card 
      className="mb-16 overflow-hidden"
      aria-labelledby="comparison-title"
      noPadding
    >
      <div className="p-8 border-b border-gray-100 bg-gray-50/50">
        <h2 
          id="comparison-title"
          className={`${THEME.components.typography.sectionTitle} text-3xl text-center`}
        >
          Compare All Features
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Pricing plan comparison">
          <thead>
            <tr className="bg-white">
              <th 
                scope="col"
                className={`text-left py-6 px-6 ${THEME.components.typography.subheading} uppercase tracking-wider bg-gray-50/30`}
              >
                Features
              </th>
              <th 
                scope="col"
                className={`text-center py-6 px-6 ${THEME.components.typography.subheading} uppercase tracking-wider`}
              >
                Free
              </th>
              <th 
                scope="col"
                className={`text-center py-6 px-6 ${THEME.components.typography.subheading} uppercase tracking-wider text-primary`}
              >
                Professional
              </th>
              <th 
                scope="col"
                className={`text-center py-6 px-6 ${THEME.components.typography.subheading} uppercase tracking-wider`}
              >
                Enterprise
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {features.map((row, index) => (
              <tr 
                key={`feature-${index}`} 
                className="hover:bg-gray-50/50 transition-colors duration-200"
              >
                <td className={`py-4 px-6 ${THEME.components.typography.body} font-medium text-gray-900`}>
                  {row.feature}
                </td>
                <td className="py-4 px-6 text-center">
                  {renderCell(row.free)}
                </td>
                <td className="py-4 px-6 text-center bg-primary/5">
                  {renderCell(row.pro)}
                </td>
                <td className="py-4 px-6 text-center">
                  {renderCell(row.enterprise)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
});

ComparisonTable.displayName = 'ComparisonTable';

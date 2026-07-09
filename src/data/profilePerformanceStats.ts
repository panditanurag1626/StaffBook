import type { ProfilePerformanceStat } from '../types/profile';

export const profilePerformanceStats: Omit<ProfilePerformanceStat, 'icon'>[] = [
  { label: 'Profile Views', value: 128 },
  { label: 'Search Appearances', value: 65 },
  { label: 'Connections', value: 1670 },
  { label: 'Post Impressions', value: 843 },
];
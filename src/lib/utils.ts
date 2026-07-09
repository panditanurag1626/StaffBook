import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import imageCompression from 'browser-image-compression';

/**
 * Format salary to LPA (Lakhs Per Annum)
 */
export function formatSalaryLPA(salary: number | string | null | undefined): string {
  if (!salary) return 'Not Specified';
  
  // Extract numbers if it's a string
  const numStr = String(salary).replace(/[^0-9.]/g, '');
  const num = parseFloat(numStr);
  
  if (isNaN(num)) return String(salary);
  
  // If the salary is already small (e.g. 5, 8.5), assume it's already in LPA
  if (num > 0 && num < 100) return `₹ ${num.toFixed(1)} LPA`;
  
  // Otherwise convert to LPA
  const lpa = num / 100000;
  return `₹ ${lpa.toFixed(1)} LPA`;
}

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN')}`;
}

/**
 * Calculate savings percentage
 */
export function calculateSavingsPercentage(monthlyPrice: number, yearlyPrice: number): number {
  const annualMonthlyPrice = monthlyPrice * 12;
  const savings = ((annualMonthlyPrice - yearlyPrice) / annualMonthlyPrice) * 100;
  return Math.round(savings);
}

/**
 * Scroll to element with offset
 */
export function scrollToElement(elementId: string, offset: number = 80): void {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
}


export const isVideoFile = (url: string) => {
  const videoExtensions = ["mp4", "webm", "ogg", "mov"];
  const ext = url.split(".").pop()?.toLowerCase();
  return ext ? videoExtensions.includes(ext) : false;
};

/**
 * Format an ISO date string to DD-MM-YYYY hh:mm am/pm
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = hours.toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${day}-${month}-${year} ${strHours}:${minutes} ${ampm}`;
}

/**
 * Get current browser location with permission prompt
 */
export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Handle image compression to ensure max size and quality
 */
export async function compressImage(file: File, maxSizeMB: number = 1, maxWidthOrHeight: number = 1280): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  
  const options = {
    maxSizeMB: maxSizeMB,
    maxWidthOrHeight: maxWidthOrHeight,
    useWebWorker: true,
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    // Ensure we keep the original name and type
    return new File([compressedFile], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Image compression failed:', error);
    return file;
  }
}

/**
 * Get relative time from a date string or number (e.g. "2 hours ago")
 */
export function getRelativeTime(date: string | number | Date | null | undefined): string {
  if (!date) return 'Never';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}
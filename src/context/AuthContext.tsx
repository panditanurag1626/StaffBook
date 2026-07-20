'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUser, loginSocial, User, profileService } from '@/lib/api';
import { userService } from '@/lib/api/services/userService';
import { updatePresence } from '@/lib/presence';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; token?: string; user?: any }>;
  socialLogin: (data: any) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; data?: any; error?: string }>;
  logout: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  isEmployer: boolean;
  setIsEmployer: React.Dispatch<React.SetStateAction<boolean>>; // Kept for backwards compatibility but effectively a no-op now
  isInitialized: boolean;
  isOnline: boolean;
  setIsOnline: React.Dispatch<React.SetStateAction<boolean>>;
  profileLabel: string;
  setProfileLabel: React.Dispatch<React.SetStateAction<string>>;
  refreshUser: () => Promise<void>;
  completionPercentage: number;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  countryCode: string;
  user_type?: 'job_seeker' | 'employer';
  company_name?: string;
  designation?: string;
  professional_email?: string;
  gst_number?: string;
  document?: File;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [jobSeekerLabel, setJobSeekerLabel] = useState<string>('None');
  const [employerLabel, setEmployerLabel] = useState<string>('None');
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);

  // Derive isEmployer directly from user
  const isEmployer = user?.user_type === 'employer';
  const setIsEmployer = () => {}; // No-op now

  // Compute profileLabel based on mode
  const profileLabel = isEmployer ? employerLabel : jobSeekerLabel;

  const setProfileLabelAction = (labelOrFn: string | ((prev: string) => string)) => {
    if (typeof labelOrFn === 'function') {
      if (isEmployer) {
        setEmployerLabel(prev => labelOrFn(prev));
      } else {
        setJobSeekerLabel(prev => labelOrFn(prev));
      }
    } else {
      if (isEmployer) {
        setEmployerLabel(labelOrFn);
      } else {
        setJobSeekerLabel(labelOrFn);
      }
    }
  };

  const fetchCompletionProgress = async () => {
    try {
      const response = await userService.getProfileCompletionSuggestions();
      // Based on the response structure provided: data.data.completion_percentage
      if (response.data?.data?.completion_percentage !== undefined) {
        setCompletionPercentage(response.data.data.completion_percentage);
      } else if (response.data?.completion_percentage !== undefined) {
        // Fallback for flat structure
        setCompletionPercentage(response.data.completion_percentage);
      }
    } catch (error) {
      console.error('Failed to fetch profile completion progress:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await profileService.getProfile();
      if (response.data?.user) {
        setUser(response.data.user);
        // Also update localStorage
        localStorage.setItem('authUser', JSON.stringify(response.data.user));

        // Also fetch completion progress
        fetchCompletionProgress();
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  useEffect(() => {
    // Load user and employer status from localStorage on mount
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);

      // Refresh user data from API to get latest state (e.g. user_type)
      refreshUser();
      // Also fetch completion progress
      fetchCompletionProgress();
    }

    const savedIsOnline = localStorage.getItem('isOnline');
    if (savedIsOnline !== null) {
      setIsOnline(savedIsOnline === 'true');
    }

    const savedJobSeekerLabel = localStorage.getItem('jobSeekerLabel');
    if (savedJobSeekerLabel) setJobSeekerLabel(savedJobSeekerLabel);

    const savedEmployerLabel = localStorage.getItem('employerLabel');
    if (savedEmployerLabel) setEmployerLabel(savedEmployerLabel);

    setIsInitialized(true);
  }, []);

  // Persist isOnline whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('isOnline', isOnline.toString());
    }
  }, [isOnline, isInitialized]);

  // Firebase Presence Tracking
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    if (user?.id && isInitialized) {
      unsubscribe = updatePresence(user.id, isOnline);
    }

    return () => {
      unsubscribe();
    };
  }, [user?.id, isOnline, isInitialized]);

  // Persist labels whenever they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('jobSeekerLabel', jobSeekerLabel);
    }
  }, [jobSeekerLabel, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('employerLabel', employerLabel);
    }
  }, [employerLabel, isInitialized]);

  // Track if location has been updated in current session to avoid infinite loops
  const hasUpdatedLocation = React.useRef(false);

  // Global Geolocation Tracking
  useEffect(() => {
    // Only run if user is logged in, app is initialized, and we haven't updated in this session
    if (user?.id && isInitialized && !hasUpdatedLocation.current) {
      const fetchAndUpdateLocation = async () => {
        try {
          if (!navigator.geolocation) {
            console.error("Geolocation is not supported by this browser.");
            return;
          }

          hasUpdatedLocation.current = true; // Mark as updated immediately to prevent concurrent triggers

          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const latStr = latitude.toString();
              const lngStr = longitude.toString();
              try {
                // Get human-readable address from Geocoding API
                const geoResponse = await fetch(
                  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
                );
                const geoData = await geoResponse.json();
                const address = geoData.results?.[0]?.formatted_address || "Current Location";

                // Update location in backend
                await userService.updateLocation({
                  latitude: latStr,
                  longitude: lngStr,
                  location: address,
                });

                // Update local user state without spreading to avoid re-triggering if dependency was user
                // Actually since we use a ref and check user.id, it's safer now
                console.log("Location updated:", address);
              } catch (error) {
                console.error("Failed to reverse geocode or update location API:", error);
              }
            },
            async (error) => {
              console.warn("Browser geolocation failed, trying Google Geolocation API:", error.message);
              // Fallback to Google Geolocation API as requested
              try {
                const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                const googleGeoResponse = await fetch(
                  `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
                  { method: 'POST' }
                );
                const googleGeoData = await googleGeoResponse.json();

                if (googleGeoData.location) {
                  const { lat, lng } = googleGeoData.location;
                  const latStr = lat.toString();
                  const lngStr = lng.toString();

                  const revGeoResponse = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
                  );
                  const revGeoData = await revGeoResponse.json();
                  const address = revGeoData.results?.[0]?.formatted_address || "Current Location";

                  await userService.updateLocation({
                    latitude: latStr,
                    longitude: lngStr,
                    location: address,
                  });
                  console.log("Location updated via Google API:", address);
                }
              } catch (fallbackError) {
                console.error("Google Geolocation API fallback failed:", fallbackError);
              }
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        } catch (err) {
          console.error("Global location update error:", err);
          hasUpdatedLocation.current = false; // Reset on failure if needed
        }
      };

      fetchAndUpdateLocation();
    }
  }, [user?.id, isInitialized]); // Only depend on User ID and initialization

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginUser(email, password);

      if (response.status === 200 && response.data.user) {
        // Handle unverified GST for employer
        const gstVerified = (response as any).data?.gst_verified;
        const msg = (response as any).message?.toLowerCase() || (response as any).data?.message?.toLowerCase() || '';

        if (gstVerified === false || gstVerified === 0 || msg.includes('gst number is not verified')) {
          return {
            success: false,
            error: response.message || (response as any).data?.message || 'GST number is not verified',
            token: (response as any).token || (response as any).data?.token || (response.data as any).token,
            user: response.data.user
          };
        }

        setUser(response.data.user);

        // Fetch full profile data and completion percentage after login
        await refreshUser();

        return { success: true };
      }

      let errorMsg = response.message;
      if (response.data?.errors) {
        const errors = response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey && Array.isArray(errors[firstErrorKey])) {
          errorMsg = errors[firstErrorKey][0];
        }
      } else if ((response as any).errors) {
        // Handle format: { token: "...", errors: { message: ["..."] } }
        const errors = (response as any).errors;
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey && Array.isArray(errors[firstErrorKey])) {
          errorMsg = errors[firstErrorKey][0];
        }
      }

      const token = (response as any).token ||
        (response as any).data?.token ||
        (response as any).errors?.token ||
        (response as any).data?.data?.token;
      return { success: false, error: errorMsg || 'Login failed', token };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred during login. Please try again.',
        token: error?.token
      };
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await loginSocial(data);

      if (response.status === 200 && response.data.user) {
        setUser(response.data.user);

        // Fetch full profile data and completion percentage after social login
        await refreshUser();

        return { success: true };
      }

      return { success: false, error: response.message || 'Social login failed' };
    } catch (error: unknown) {
      console.error('Social login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred during social login.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    setIsLoading(true);
    try {
      const response = await registerUser({
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
        email: data.email,
        password: data.password,
        phone: data.phone,
        country_code: data.countryCode,
        user_type: data.user_type,
        company_name: data.company_name,
        designation: data.designation,
        professional_email: data.professional_email,
        gst_number: data.gst_number,
        document: data.document,
      });

      if (response.status === 200 && response.data.token) {
        return { success: true, data: response.data };
      }

      let errorMsg = response.message;
      if (response.data?.errors) {
        const errors = response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey && Array.isArray(errors[firstErrorKey])) {
          errorMsg = errors[firstErrorKey][0];
        }
      }

      return { success: false, error: errorMsg || 'Registration failed' };
    } catch (error: unknown) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred during registration. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (user?.id) {
      updatePresence(user.id, false);
    }
    setUser(null);
    setIsOnline(true);
    setJobSeekerLabel('None');
    setEmployerLabel('None');
    localStorage.removeItem('isEmployer');
    logoutUser();
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      socialLogin,
      signup,
      logout,
      isSidebarOpen,
      setIsSidebarOpen,
      isLoading,
      isEmployer,
      setIsEmployer,
      isInitialized,
      isOnline,
      setIsOnline,
      profileLabel,
      setProfileLabel: setProfileLabelAction as any,
      refreshUser,
      completionPercentage
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import TextInput from '../shared/TextInput';
import Button from '../shared/Button';
import { userService } from '@/lib/api/services/userService';
import { useAuth } from '@/context/AuthContext';
import {
  countries,
  getStatesForCountry,
  getCitiesForState,
  currencies,
  monthOptions,
} from '@/lib/data/locationData';
import toast from 'react-hot-toast';

interface BasicDetailsModalProps {
  open: boolean;
  onClose: () => void;
}

const BasicDetailsModal: React.FC<BasicDetailsModalProps> = ({ open, onClose }) => {
  const { user, refreshUser, isEmployer } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [availableStates, setAvailableStates] = useState<{ code: string; name: string }[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const [form, setForm] = useState({
    designation: '',
    // description: '',
    phone: '',
    country_code: '+91',
    city: '',
    state: '',
    country: '',
    address: '',
    dob: '',
    sex: '',
    website: '',
    linkedin_profile: '',
    github_url: '',
    portfolio_url: '',
    work_email: '',
    work_phone: '',
    total_experience_years: '',
    total_experience_months: '',
    current_salary: '',
    current_salary_currency: 'INR',
    notice_period_months: '',
  });

  // Populate form with user data when modal opens
  useEffect(() => {
    if (open && user) {
      const userData = {
        designation: user.designation || '',
        // description: user.description || '',
        phone: user.phone || '',
        country_code: user.country_code || '+91',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        address: (user as any).address || '',
        dob: user.dob || '',
        sex: user.sex ? user.sex.toString() : '',
        website: (user as any).website || '',
        linkedin_profile: (user as any).linkedin_profile || '',
        work_email: (user as any).work_email || '',
        work_phone: (user as any).work_phone || '',
        total_experience_years: (user as any).total_experience_years !== null && (user as any).total_experience_years !== undefined ? (user as any).total_experience_years.toString() : '',
        total_experience_months: (user as any).total_experience_months !== null && (user as any).total_experience_months !== undefined ? (user as any).total_experience_months.toString() : '',
        current_salary: (user as any).current_salary ? (user as any).current_salary.toString() : '',
        current_salary_currency: (user as any).current_salary_currency || 'INR',
        notice_period_months: (user as any).notice_period_months ? (user as any).notice_period_months.toString() : '',
        github_url: (user as any).github_url || '',
        portfolio_url: (user as any).portfolio_url || '',
      };

      setForm(userData);

      // Set initial country/state for dropdowns
      if (userData.country) {
        const country = countries.find(c => c.name === userData.country);
        if (country) {
          setSelectedCountryCode(country.code);
          const states = getStatesForCountry(country.code);
          setAvailableStates(states);

          if (userData.state) {
            const state = states.find(s => s.name === userData.state);
            if (state) {
              setSelectedStateCode(state.code);
              setAvailableCities(getCitiesForState(country.code, state.code));
            }
          }
        }
      }
    }
  }, [open, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    setSelectedCountryCode(countryCode);

    const country = countries.find(c => c.code === countryCode);
    setForm({ ...form, country: country?.name || '', state: '', city: '' });

    const states = getStatesForCountry(countryCode);
    setAvailableStates(states);
    setAvailableCities([]);
    setSelectedStateCode('');
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    setSelectedStateCode(stateCode);

    const state = availableStates.find(s => s.code === stateCode);
    setForm({ ...form, state: state?.name || '', city: '' });

    const cities = getCitiesForState(selectedCountryCode, stateCode);
    setAvailableCities(cities);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, city: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataToSubmit = { ...form };
      const urlFields = ['website', 'linkedin_profile', 'github_url', 'portfolio_url'] as const;
      urlFields.forEach(field => {
        let val = dataToSubmit[field];
        if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
          dataToSubmit[field] = 'https://' + val;
        }
      });

      await userService.editProfile(dataToSubmit);
      await new Promise(resolve => setTimeout(resolve, 800));
      await refreshUser();
      toast.success('Personal Information updated successfully!');
      onClose();
    } catch (error: any) {
      console.error('Failed to update profile:', error);

      let errorMessage = 'Failed to update profile';

      const responseData = error?.response?.data?.data;
      if (responseData?.errors) {
        const firstKey = Object.keys(responseData.errors)[0];
        if (firstKey && Array.isArray(responseData.errors[firstKey]) && responseData.errors[firstKey].length > 0) {
          errorMessage = responseData.errors[firstKey][0];
        }
      } else if (responseData?.message) {
        errorMessage = responseData.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
        <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Edit Personal Information</div>

        {/* Personal Details */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <TextInput id="designation" label="Designation" value={form.designation} onChange={handleChange} inputClassName="text-gray-900" />
            {/*             
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Detailed description of your experience and skills"
              />
            </div> */}

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                id="dob"
                value={form.dob}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                id="sex"
                value={form.sex}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Gender</option>
                <option value="1">Male</option>
                <option value="2">Female</option>
                <option value="3">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1">
                <TextInput id="country_code" label="Code" value={form.country_code} onChange={handleChange} inputClassName="text-gray-900" />
              </div>
              <div className="col-span-3">
                <TextInput required id="phone" label="Phone" value={form.phone} onChange={handleChange} inputClassName="text-gray-900" />
              </div>
            </div>
            {isEmployer && (
              <>
                <TextInput id="work_phone" label="Work Phone" value={form.work_phone} onChange={handleChange} inputClassName="text-gray-900" />
                <TextInput id="work_email" label="Work Email" value={form.work_email} onChange={handleChange} type="email" inputClassName="text-gray-900" />
              </>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="md:col-span-2">
              <TextInput id="address" label="Street Address" value={form.address} onChange={handleChange} inputClassName="text-gray-900" />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                id="country"
                value={selectedCountryCode}
                onChange={handleCountryChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                id="state"
                value={selectedStateCode}
                onChange={handleStateChange}
                disabled={!selectedCountryCode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select State</option>
                {availableStates.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                id="city"
                value={form.city}
                onChange={handleCityChange}
                disabled={!selectedStateCode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select City</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Salary & Experience */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Salary & Experience</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <TextInput id="current_salary" label="Current Salary" value={form.current_salary} onChange={handleChange} type="number" inputClassName="text-gray-900" />
              </div>
              <div className="col-span-1">
                <label htmlFor="current_salary_currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  id="current_salary_currency"
                  value={form.current_salary_currency}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="notice_period_months" className="block text-sm font-medium text-gray-700 mb-1">Notice Period (Months)</label>
              <select
                id="notice_period_months"
                value={form.notice_period_months}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select</option>
                {[0, 1, 2, 3, 4, 5, 6].map((m) => (
                  <option key={m} value={m}>
                    {m} Month{m !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            <TextInput id="total_experience_years" label="Experience (Years)" value={form.total_experience_years} onChange={handleChange} type="number" inputClassName="text-gray-900" />
            <div>
              <label htmlFor="total_experience_months" className="block text-sm font-medium text-gray-700 mb-1">Experience (Months)</label>
              <select
                id="total_experience_months"
                value={form.total_experience_months}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Months</option>
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Social & Professional Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <TextInput id="website" label="Website" value={form.website} onChange={handleChange} type="text" inputClassName="text-gray-900" />
            <TextInput id="linkedin_profile" label="LinkedIn Profile" value={form.linkedin_profile} onChange={handleChange} type="text" inputClassName="text-gray-900" />
            <TextInput id="github_url" label="GitHub URL" value={form.github_url} onChange={handleChange} type="text" inputClassName="text-gray-900" />
            <TextInput id="portfolio_url" label="Portfolio URL" value={form.portfolio_url} onChange={handleChange} type="text" inputClassName="text-gray-900" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BasicDetailsModal;
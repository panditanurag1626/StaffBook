import { Country, State, City } from 'country-state-city';

// Country, State, City data
// Dynamic data provided by 'country-state-city' package

export const countries = Country.getAllCountries().map(country => ({
    code: country.isoCode,
    name: country.name
}));

export const getStatesForCountry = (countryCode: string) => {
    return State.getStatesOfCountry(countryCode).map(state => ({
        code: state.isoCode,
        name: state.name
    })) || [];
};

export const getCitiesForState = (countryCode: string, stateCode: string) => {
    return City.getCitiesOfState(countryCode, stateCode).map(city => city.name) || [];
};

export const currencies = [
    { code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹' },
    { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
    { code: 'EUR', name: 'Euro (€)', symbol: '€' },
    { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
    { code: 'AUD', name: 'Australian Dollar (A$)', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar (C$)', symbol: 'C$' },
    { code: 'AED', name: 'UAE Dirham (AED)', symbol: 'AED' },
    { code: 'SGD', name: 'Singapore Dollar (S$)', symbol: 'S$' },
];

export const workStatusOptions = [
    'Open to work',
    'Not looking',
    'Actively looking',
];

export const jobTypeOptions = [
    'Permanent',
    'Contract',
    'Temporary',
];

export const shiftOptions = [
    'Day',
    'Night',
    'Rotational',
    'Flexible',
];

export const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: `${i} ${i === 1 ? 'Month' : 'Months'}`,
}));

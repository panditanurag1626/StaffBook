'use client';

import React, { useState } from 'react';
import GradientButton from '../shared/GradientButton';
import Button from '../shared/Button';

const JobFormSection: React.FC = () => {
  const [formData, setFormData] = useState({
    companyLogo: '',
    vacancyReel: '',
    jobTitle: '',
    employmentType: '',
    jobDescription: '',
    keySkills: '',
    departmentCategory: '',
    workExperienceFrom: '',
    workExperienceTo: '',
    workMode: '',
    locationPreference: '',
    noticePeriod: '',
    salaryFrom: '',
    salaryTo: '',
    question1: '',
    question2: '',
    enableGoogleMap: true,
    fullAddress: '',
    streetArea: '',
    city: '',
    pinCode: '',
    state: '',
    country: '',
    applicationVia: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: file.name
      }));
    }
  };

  const handleToggle = () => {
    setFormData(prev => ({
      ...prev,
      enableGoogleMap: !prev.enableGoogleMap
    }));
  };

  return (
    <>
    
    <div className="w-full max-w-[1098px] mx-auto  p-8">
      {/* Main Heading */}
      <h1 className="text-[32px] font-semibold text-gray-900 mb-8 text-start">
    Post a job vacancy
    </h1>

      <div className="space-y-5">
        {/* Upload Media Section */}
        <section className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-[24px] font-semibold bg-gradient-to-r from-primary to-gradient-end bg-clip-text text-transparent mb-6">
            Upload Media
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-16 font-medium text-gray-700 mb-2 block">
                Upload Company Logo <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'companyLogo')}
                  className="hidden"
                  id="companyLogo"
                />
                <label htmlFor="companyLogo" className="cursor-pointer">
                  <div className="text-14 text-gray-500 mb-2">
                    {formData.companyLogo || 'Click to upload company logo'}
                  </div>
                  <Button className="bg-[#CFBFE3] text-black px-4 py-2 rounded-lg text-14 hover:bg-[#c4b2db]">
                    Browse
                  </Button>
                </label>
              </div>
            </div>
            <div>
              <label className="text-16 font-medium text-gray-700 mb-2 block">
                Upload a Reel for vacancy
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'vacancyReel')}
                  className="hidden text-gray-500"
                  id="vacancyReel"
                />
                <label htmlFor="vacancyReel" className="cursor-pointer">
                  <div className="text-14 text-gray-500 mb-2">
                    {formData.vacancyReel || 'Click to upload vacancy reel'}
                  </div>
                  <Button className="bg-[#CFBFE3] text-black px-4 py-2 rounded-lg text-14 hover:bg-[#c4b2db]">
                    Browse
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Job Details Section */}
        <section className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-[24px]  font-semibold bg-gradient-to-r from-primary to-gradient-end bg-clip-text text-transparent mb-6">
            Job Details
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-16 font-medium text-gray-900 mb-2 block">
                  Job Title/ Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  placeholder="Enter clear specific title to get better responses"
                  className="w-full text-gray-500 px-4 py-3 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-16 font-medium text-gray-700 mb-2 block">
                  Employment type <span className="text-red-500">*</span>
                </label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  className="w-full text-gray-500 px-4 py-3 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Permanent/ Full Time/ Half Time</option>
                  <option value="permanent">Permanent</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-16 font-medium text-gray-700 mb-2 block">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                placeholder="Enter job description"
                rows={4}
                className="w-full text-gray-500 px-4 py-3 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-16 font-medium text-gray-700 mb-2 block">
                  Key Skills <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="keySkills"
                  value={formData.keySkills}
                  onChange={handleInputChange}
                  placeholder="Enter key skills required"
                  className="w-full text-gray-500 px-4 py-3 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-16 font-medium text-gray-700 mb-2 block">
                  Department & Role category <span className="text-red-500">*</span>
                </label>
                <select
                  name="departmentCategory"
                  value={formData.departmentCategory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-gray-500 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select department</option>
                  <option value="engineering">Engineering</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                  <option value="hr">Human Resources</option>
                  <option value="finance">Finance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-16 font-medium text-gray-700 mb-2 block">
                  Work Experience <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="workExperienceFrom"
                    value={formData.workExperienceFrom}
                    onChange={handleInputChange}
                    placeholder="Eg: 4"
                    className="w-20  text-gray-500 px-3 py-3 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-14 text-gray-600">yrs</span>
                  <span className="text-14 text-gray-600">To</span>
                  <input
                    type="number"
                    name="workExperienceTo"
                    value={formData.workExperienceTo}
                    onChange={handleInputChange}
                    placeholder="Eg: 6"
                    className="w-20 px-3 text-gray-500 py-3 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-14 text-gray-600">yrs</span>
                </div>
              </div>
              <div>
                <label className="text-16 font-medium text-gray-700 mb-2 block">
                  Work Mode <span className="text-red-500">*</span>
                </label>
                <select
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-gray-500 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Work from office</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-16 font-medium text-gray-700 mb-2 block">
                  Location Preference
                </label>
                <select
                  name="locationPreference"
                  value={formData.locationPreference}
                  onChange={handleInputChange}
                  className="w-full px-4 text-gray-500 py-3 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Delhi NCR</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="bangalore">Bangalore</option>
                  <option value="chennai">Chennai</option>
                  <option value="hyderabad">Hyderabad</option>
                </select>
              </div>
              <div>
                <label className="text-16 font-medium text-gray-700 mb-2 block">
                  Notice Period Preference <span className="text-red-500">*</span>
                </label>
                <select
                  name="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-gray-500 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Immediate Joiner">Immediate Joiner</option>
                  <option value="Serving Notice Period">Serving Notice Period</option>
                  <option value="Negotiable">Negotiable</option>
                  <option value="15 days">15 days</option>
                  <option value="30 days">30 days</option>
                  <option value="45 days">45 days</option>
                  <option value="60 days">60 days</option>
                  <option value="90 days">90 days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-16 font-medium text-gray-700 mb-2 block">
                Salary range <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="salaryFrom"
                  value={formData.salaryFrom}
                  onChange={handleInputChange}
                  placeholder="Eg: 4"
                  className="w-20 px-3 text-gray-500 py-3 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-14 text-gray-600">Lpa</span>
                <span className="text-14 text-gray-600">To</span>
                <input
                  type="number"
                  name="salaryTo"
                  value={formData.salaryTo}
                  onChange={handleInputChange}
                  placeholder="Eg: 6"
                  className="w-20 px-3 text-gray-500 py-3 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-14 text-gray-600">Lpa</span>
              </div>
            </div>
          </div>
        </section>

        {/* Application Questions Section */}
        <section className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-[24px]  font-semibold bg-gradient-to-r from-primary to-gradient-end bg-clip-text text-transparent mb-6">
            Application Questions
          </h2>
          <div className="space-y-4">
            <label className="text-16 font-medium text-gray-700 mb-2 block">
              Add screening Questions <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="question1"
              value={formData.question1}
              onChange={handleInputChange}
              placeholder="Add Question 1"
              className="w-full px-4 text-gray-500 py-3 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              name="question2"
              value={formData.question2}
              onChange={handleInputChange}
              placeholder="Add Question 2"
              className="w-full px-4 py-3 text-gray-500 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button className="bg-[#CFBFE3] text-black px-4 py-2 rounded-lg text-14 hover:bg-[#c4b2db] w-fit">
              Add More
            </Button>
          </div>
        </section>

        {/* Basic Details Section */}
        <section className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-[24px]  font-semibold bg-gradient-to-r from-primary to-gradient-end bg-clip-text text-transparent mb-6">
            Basic Details
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-16 font-medium text-gray-700">
                  Enable Google map
                </label>
                <button
                  onClick={handleToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.enableGoogleMap ? 'bg-[#CFBFE3] ' : 'text-black'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.enableGoogleMap ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {formData.enableGoogleMap && (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-14 text-gray-500">Google Map will be embedded here</div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-16 font-medium text-gray-700 mb-2 block">
                  Type Full Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullAddress"
                  value={formData.fullAddress}
                  onChange={handleInputChange}
                  placeholder="Type your address here"
                  className="w-full px-4 text-gray-500 py-3 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-12 text-gray-500 mt-1">Type full address if you can&apos;t find it on map</p>
              </div>
              <input
                type="text"
                name="streetArea"
                value={formData.streetArea}
                onChange={handleInputChange}
                placeholder="Street/area/locality here..."
                className="w-full px-4 text-gray-500 py-3 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-16 font-medium text-gray-700 mb-2 block">
                    City
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 text-gray-500 py-3 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select City</option>
                    <option value="delhi">Delhi</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="bangalore">Bangalore</option>
                  </select>
                </div>
                <div>
                  <label className="text-16 font-medium text-gray-700 mb-2 block">
                    Pin Code
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleInputChange}
                    placeholder="Enter pin code"
                    className="w-full text-gray-500 px-4 py-3 border text-gray-500 border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-16 font-medium text-gray-700 mb-2 block">
                    State
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border text-gray-500 border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select State</option>
                    <option value="delhi">Delhi</option>
                    <option value="maharashtra">Maharashtra</option>
                    <option value="karnataka">Karnataka</option>
                  </select>
                </div>
                <div>
                  <label className="text-16 font-medium text-gray-700 mb-2 block">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="India"
                    className="w-full px-4 py-3 text-gray-500 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Application Settings Section */}
        <section className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-[24px]  font-semibold bg-gradient-to-r from-primary to-gradient-end bg-clip-text text-transparent mb-6">
            Application Settings
          </h2>
          <div>
            <label className="text-16 font-medium text-gray-700 mb-2 block">
              I want to receive applications via <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="applicationVia"
              value={formData.applicationVia}
              onChange={handleInputChange}
              placeholder="E-Mail/Staff Book portal"
              className="w-full text-gray-500 px-4 py-3 border text-gray-500 border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <Button 
          variant="outline" 
          className="px-6 py-3 border border-gray-300 rounded-full text-16 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Preview
        </Button>
        <GradientButton className="px-6 py-3">
          Post
        </GradientButton>
      </div>
    </div>
    </>
  );
};

export default JobFormSection;

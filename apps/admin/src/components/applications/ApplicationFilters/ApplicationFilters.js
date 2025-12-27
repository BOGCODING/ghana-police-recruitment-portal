'use client';
import { useState } from 'react';

export default function ApplicationFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    category: '',
  });

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      <select 
        className="px-4 py-2 border rounded-lg bg-white text-sm"
        onChange={(e) => handleChange('status', e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="SUBMITTED">Submitted</option>
        <option value="UNDER_REVIEW">Under Review</option>
        <option value="DOCUMENTS_REQUIRED">Docs Required</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
        <option value="SHORTLISTED">Shortlisted</option>
      </select>

      <select 
        className="px-4 py-2 border rounded-lg bg-white text-sm"
        onChange={(e) => handleChange('category', e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="GENERAL_DUTY">General Duty</option>
        <option value="TRADESMEN">Tradesmen</option>
        <option value="GRADUATES">Graduates</option>
        <option value="MEDICAL_PROFESSIONALS">Medical Professionals</option>
        <option value="RELIGIOUS_AFFAIRS">Religious Affairs</option>
        <option value="SPORTSMEN">Sportsmen</option>
      </select>

      <select 
        className="px-4 py-2 border rounded-lg bg-white text-sm"
        onChange={(e) => handleChange('region', e.target.value)}
      >
        <option value="">All Regions</option>
        <option value="ASH">Ashanti</option>
        <option value="AHA">Ahafo</option>
        <option value="BOE">Bono East</option>
        <option value="BAR">Brong Ahafo</option>
        <option value="CEN">Central</option>
        <option value="EAS">Eastern</option>
        <option value="GAR">Greater Accra</option>
        <option value="NEA">North East</option>
        <option value="NOR">Northern</option>
        <option value="OTI">Oti</option>
        <option value="SAV">Savannah</option>
        <option value="UEA">Upper East</option>
        <option value="UWE">Upper West</option>
        <option value="VOL">Volta</option>
        <option value="WES">Western</option>
        <option value="WNO">Western North</option>
      </select>
    </div>
  );
}

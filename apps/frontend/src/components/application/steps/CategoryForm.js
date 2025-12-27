'use client';
import { useState, useEffect } from 'react';
import { useApplication } from '@/contexts/ApplicationContext';
import styles from './FormStep.module.css';

const CATEGORIES = [
  { id: 'GENERAL_DUTY', name: 'General Duty', description: 'Standard police officers', minAge: 18, maxAge: 30, minHeight: 173 },
  { id: 'TRADESMEN', name: 'Tradesmen', description: 'Technical and skilled trades', minAge: 18, maxAge: 35, minHeight: 173 },
  { id: 'GRADUATES', name: 'Graduates', description: 'Degree/HND/Diploma holders', minAge: 18, maxAge: 35, minHeight: 173 },
  { id: 'MEDICAL_PROFESSIONALS', name: 'Medical Professionals', description: 'Doctors, nurses, pharmacists', minAge: 18, maxAge: 35, minHeight: 163 },
  { id: 'RELIGIOUS_AFFAIRS', name: 'Religious Affairs', description: 'Chaplains and Imams', minAge: 18, maxAge: 40, minHeight: 163 },
  { id: 'SPORTSMEN', name: 'Sportsmen', description: 'Athletes with national achievements', minAge: 18, maxAge: 30, minHeight: 173 }
];

const TRADESMEN_SUBCATEGORIES = [
  { id: 'MOTOR_MECHANICS', name: 'Motor Mechanics' },
  { id: 'DRIVERS_RIDERS', name: 'Drivers & Riders' },
  { id: 'ELECTRICIANS', name: 'Electricians' },
  { id: 'PLUMBERS_MASONS', name: 'Plumbers & Masons' },
  { id: 'PAINTERS', name: 'Painters' },
  { id: 'TAILORS', name: 'Tailors' },
  { id: 'CARPENTERS', name: 'Carpenters' },
  { id: 'WELDERS', name: 'Welders' },
  { id: 'REFRIGERATION', name: 'Refrigeration' }
];

const MEDICAL_SUBCATEGORIES = [
  { id: 'DOCTORS', name: 'Doctors' },
  { id: 'SPECIALISTS', name: 'Specialists' },
  { id: 'PHARMACISTS', name: 'Pharmacists' },
  { id: 'NURSES', name: 'Nurses' },
  { id: 'SPECIALIZED_NURSES', name: 'Specialized Nurses' },
  { id: 'LABORATORY_SCIENTISTS', name: 'Laboratory Scientists' },
  { id: 'PHYSICIAN_ASSISTANTS', name: 'Physician Assistants' },
  { id: 'ANAESTHETISTS', name: 'Anaesthetists' },
  { id: 'HEALTH_INFORMATICS', name: 'Health Informatics' },
  { id: 'NUTRITIONISTS', name: 'Nutritionists' },
  { id: 'PHYSIOTHERAPISTS', name: 'Physiotherapists' },
  { id: 'PUBLIC_HEALTH', name: 'Public Health' },
  { id: 'HISTOPATHOLOGISTS', name: 'Histopathologists' },
  { id: 'PHARMACY_TECHNOLOGISTS', name: 'Pharmacy Technologists' },
  { id: 'SONOGRAPHERS', name: 'Sonographers' }
];

const GRADUATE_SUBCATEGORIES = [
  { id: 'DEGREE_HOLDERS', name: 'Degree Holders' },
  { id: 'HND_HOLDERS', name: 'HND Holders' },
  { id: 'DIPLOMA_HOLDERS', name: 'Diploma Holders' }
];

const RELIGIOUS_SUBCATEGORIES = [
  { id: 'CHAPLAIN', name: 'Chaplain (Christian)' },
  { id: 'IMAM', name: 'Imam (Muslim)' }
];

const REGIONS = [
  { code: 'ASH', name: 'Ashanti Region' },
  { code: 'AHA', name: 'Ahafo Region' },
  { code: 'BOE', name: 'Bono East Region' },
  { code: 'BAR', name: 'Brong Ahafo Region' },
  { code: 'CEN', name: 'Central Region' },
  { code: 'EAS', name: 'Eastern Region' },
  { code: 'GAR', name: 'Greater Accra Region' },
  { code: 'NEA', name: 'North East Region' },
  { code: 'NOR', name: 'Northern Region' },
  { code: 'OTI', name: 'Oti Region' },
  { code: 'SAV', name: 'Savannah Region' },
  { code: 'UEA', name: 'Upper East Region' },
  { code: 'UWE', name: 'Upper West Region' },
  { code: 'VOL', name: 'Volta Region' },
  { code: 'WES', name: 'Western Region' },
  { code: 'WNO', name: 'Western North Region' }
];

const SPORTS_DISCIPLINES = [
  'BOXING', 'FOOTBALL', 'HANDBALL', 'BASKETBALL', 'HOCKEY',
  'TENNIS', 'TABLE_TENNIS', 'VOLLEYBALL', 'ATHLETICS',
  'BADMINTON', 'ARM_WRESTLING', 'MARTIAL_ARTS'
];

export default function CategoryForm() {
  const { formData, nextStep, prevStep, updateStepData, saving } = useApplication();
  const [data, setData] = useState({
    category: '',
    subCategory: '',
    specialization: '',
    preferredRegion: '',
    alternateRegion: '',
    tradeQualification: '',
    tradeExperienceYears: '',
    hasDriversLicense: false,
    driversLicenseClass: '',
    driversLicenseNumber: '',
    driversLicenseExpiry: '',
    sportsDiscipline: '',
    sportsAchievements: '',
    professionalRegistrationNumber: '',
    professionalRegistrationBody: '',
    postQualificationExperience: '',
    ordinationDetails: '',
    religiousDenomination: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (formData.categoryDetails) {
      setData(prev => ({ ...prev, ...formData.categoryDetails }));
    }
  }, [formData.categoryDetails]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    setData(prev => {
      const newData = { ...prev, [name]: finalValue };
      // Reset subCategory if category changes
      if (name === 'category') {
        newData.subCategory = '';
        newData.specialization = '';
      }
      return newData;
    });
    
    setErrors(prev => ({ ...prev, [name]: null }));
    updateStepData('categoryDetails', { ...data, [name]: finalValue });
  };

  const validate = () => {
    const newErrors = {};
    if (!data.category) newErrors.category = 'Category is required';
    if (!data.preferredRegion) newErrors.preferredRegion = 'Preferred region is required';
    if (data.preferredRegion === data.alternateRegion) {
      newErrors.alternateRegion = 'Alternate region must be different';
    }

    if (data.category === 'TRADESMEN') {
      if (!data.subCategory) newErrors.subCategory = 'Please select a trade area';
      if (!data.tradeQualification) newErrors.tradeQualification = 'Trade qualification is required';
      if (!data.tradeExperienceYears) newErrors.tradeExperienceYears = 'Experience years required';
    }

    if (data.category === 'MEDICAL_PROFESSIONALS') {
      if (!data.subCategory) newErrors.subCategory = 'Please select a medical area';
      if (!data.professionalRegistrationNumber) newErrors.professionalRegistrationNumber = 'PIN/Registration number required';
    }

    if (data.category === 'SPORTSMEN') {
      if (!data.sportsDiscipline) newErrors.sportsDiscipline = 'Please select a sport';
    }

    if (data.hasDriversLicense) {
      if (!data.driversLicenseClass) newErrors.driversLicenseClass = 'License class is required';
      if (!data.driversLicenseNumber) newErrors.driversLicenseNumber = 'License number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await nextStep('categoryDetails', data);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <h2>Category Selection</h2>
        <p>Choose your recruitment category and preferred posting region</p>
      </div>

      {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}

      <div className={styles.field}>
        <label>Recruitment Category *</label>
        <div className={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <label
              key={cat.id}
              className={`${styles.categoryCard} ${data.category === cat.id ? styles.selected : ''}`}
            >
              <input
                type="radio"
                name="category"
                value={cat.id}
                checked={data.category === cat.id}
                onChange={handleChange}
              />
              <div className={styles.categoryInfo}>
                <strong>{cat.name}</strong>
                <p>{cat.description}</p>
                <div className={styles.requirements}>
                  <span>Age: {cat.minAge}-{cat.maxAge}</span>
                  <span>Min Height: {cat.minHeight}cm</span>
                </div>
              </div>
            </label>
          ))}
        </div>
        {errors.category && <span className={styles.errorText}>{errors.category}</span>}
      </div>

      {/* Sub-Category Selection */}
      {data.category === 'TRADESMEN' && (
        <div className={styles.row2}>
          <div className={styles.field}>
            <label>Trade Area *</label>
            <select name="subCategory" value={data.subCategory} onChange={handleChange}>
              <option value="">Select Trade Area</option>
              {TRADESMEN_SUBCATEGORIES.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label>Qualification *</label>
            <input 
              type="text" 
              name="tradeQualification" 
              value={data.tradeQualification} 
              onChange={handleChange}
              placeholder="e.g. NVTI Certificate"
            />
          </div>
        </div>
      )}

      {data.category === 'MEDICAL_PROFESSIONALS' && (
        <div className={styles.row2}>
          <div className={styles.field}>
            <label>Professional Area *</label>
            <select name="subCategory" value={data.subCategory} onChange={handleChange}>
              <option value="">Select Professional Area</option>
              {MEDICAL_SUBCATEGORIES.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label>Registration Number (PIN) *</label>
            <input 
              type="text" 
              name="professionalRegistrationNumber" 
              value={data.professionalRegistrationNumber} 
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      {data.category === 'GRADUATES' && (
        <div className={styles.field}>
          <label>Qualification Level *</label>
          <select name="subCategory" value={data.subCategory} onChange={handleChange}>
            <option value="">Select Level</option>
            {GRADUATE_SUBCATEGORIES.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
          </select>
        </div>
      )}

      {data.category === 'RELIGIOUS_AFFAIRS' && (
        <div className={styles.row2}>
          <div className={styles.field}>
            <label>Religious Group *</label>
            <select name="subCategory" value={data.subCategory} onChange={handleChange}>
              <option value="">Select Group</option>
              {RELIGIOUS_SUBCATEGORIES.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label>Ordination Details *</label>
            <input 
              type="text" 
              name="ordinationDetails" 
              value={data.ordinationDetails} 
              onChange={handleChange}
              placeholder="e.g. Ordained by Methodist Church Ghana"
            />
          </div>
        </div>
      )}

      {data.category === 'SPORTSMEN' && (
        <div className={styles.field}>
          <label>Sporting Discipline *</label>
          <select name="sportsDiscipline" value={data.sportsDiscipline} onChange={handleChange}>
            <option value="">Select Discipline</option>
            {SPORTS_DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      )}

      {/* Drivers License Section (Common for several categories) */}
      <div className={styles.checkboxField}>
        <label>
          <input 
            type="checkbox" 
            name="hasDriversLicense" 
            checked={data.hasDriversLicense} 
            onChange={handleChange} 
          />
          I have a valid Ghanaian Driver&apos;s License
        </label>
      </div>

      {data.hasDriversLicense && (
        <div className={styles.row3}>
          <div className={styles.field}>
            <label>License Class *</label>
            <select name="driversLicenseClass" value={data.driversLicenseClass} onChange={handleChange}>
              <option value="">Select Class</option>
              {['B', 'C', 'D', 'E', 'F'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label>License Number *</label>
            <input 
              type="text" 
              name="driversLicenseNumber" 
              value={data.driversLicenseNumber} 
              onChange={handleChange}
            />
          </div>
          <div className={styles.field}>
            <label>Expiry Date *</label>
            <input 
              type="date" 
              name="driversLicenseExpiry" 
              value={data.driversLicenseExpiry} 
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      <hr className={styles.divider} />

      <h3 className={styles.sectionTitle}>Preferred Posting Regions</h3>
      <p className={styles.sectionDesc}>Select your first and second choices for screening and potential posting</p>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label>First Choice *</label>
          <select
            name="preferredRegion"
            value={data.preferredRegion}
            onChange={handleChange}
            className={errors.preferredRegion ? styles.error : ''}
          >
            <option value="">Select Region</option>
            {REGIONS.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
          </select>
          {errors.preferredRegion && <span className={styles.errorText}>{errors.preferredRegion}</span>}
        </div>
        <div className={styles.field}>
          <label>Second Choice</label>
          <select
            name="alternateRegion"
            value={data.alternateRegion}
            onChange={handleChange}
            className={errors.alternateRegion ? styles.error : ''}
          >
            <option value="">Select Region</option>
            {REGIONS.filter(r => r.code !== data.preferredRegion).map(r => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
          {errors.alternateRegion && <span className={styles.errorText}>{errors.alternateRegion}</span>}
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={prevStep} className={styles.prevBtn}>← Back</button>
        <button type="submit" className={styles.nextBtn} disabled={saving}>
          {saving ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </form>
  );
}

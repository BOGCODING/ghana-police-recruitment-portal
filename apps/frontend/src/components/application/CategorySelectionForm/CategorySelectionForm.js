'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApplication } from '@/contexts/ApplicationContext';
import WizardNavigation from '../WizardNavigation';
import AutoSave from '../AutoSave/AutoSave';
import Input from '../../common/Input/Input';
import Select from '../../common/Input/Select';
import styles from './CategorySelectionForm.module.css';

const CATEGORIES = [
  { id: 'GENERAL_DUTY', name: 'General Duty', description: 'Standard police officers', minAge: 18, maxAge: 30, minHeight: 173 },
  { id: 'TRADESMEN', name: 'Tradesmen', description: 'Technical and skilled trades', minAge: 18, maxAge: 35, minHeight: 173 },
  { id: 'GRADUATES', name: 'Graduates', description: 'Degree/HND/Diploma holders', minAge: 18, maxAge: 35, minHeight: 173 },
  { id: 'MEDICAL_PROFESSIONALS', name: 'Medical Professionals', description: 'Doctors, nurses, pharmacists', minAge: 18, maxAge: 35, minHeight: 163 },
  { id: 'RELIGIOUS_AFFAIRS', name: 'Religious Affairs', description: 'Chaplains and Imams', minAge: 18, maxAge: 40, minHeight: 163 },
  { id: 'SPORTSMEN', name: 'Sportsmen', description: 'Athletes with national achievements', minAge: 18, maxAge: 30, minHeight: 173 }
];

const TRADESMEN_SUBCATEGORIES = [
  { value: 'MOTOR_MECHANICS', label: 'Motor Mechanics' },
  { value: 'DRIVERS_RIDERS', label: 'Drivers & Riders' },
  { value: 'ELECTRICIANS', label: 'Electricians' },
  { value: 'PLUMBERS_MASONS', label: 'Plumbers & Masons' },
  { value: 'PAINTERS', label: 'Painters' },
  { value: 'TAILORS', label: 'Tailors' },
  { value: 'CARPENTERS', label: 'Carpenters' },
  { value: 'WELDERS', label: 'Welders' },
  { value: 'REFRIGERATION', label: 'Refrigeration' }
];

const MEDICAL_SUBCATEGORIES = [
  { value: 'DOCTORS', label: 'Doctors' },
  { value: 'SPECIALISTS', label: 'Specialists' },
  { value: 'PHARMACISTS', label: 'Pharmacists' },
  { value: 'NURSES', label: 'Nurses' },
  { value: 'SPECIALIZED_NURSES', label: 'Specialized Nurses' },
  { value: 'LABORATORY_SCIENTISTS', label: 'Laboratory Scientists' },
  { value: 'PHYSICIAN_ASSISTANTS', label: 'Physician Assistants' },
  { value: 'ANAESTHETISTS', label: 'Anaesthetists' },
  { value: 'HEALTH_INFORMATICS', label: 'Health Informatics' },
  { value: 'NUTRITIONISTS', label: 'Nutritionists' },
  { value: 'PHYSIOTHERAPISTS', label: 'Physiotherapists' },
  { value: 'PUBLIC_HEALTH', label: 'Public Health' },
  { value: 'HISTOPATHOLOGISTS', label: 'Histopathologists' },
  { value: 'PHARMACY_TECHNOLOGISTS', label: 'Pharmacy Technologists' },
  { value: 'SONOGRAPHERS', label: 'Sonographers' }
];

const MEDICAL_QUALIFICATIONS = [
  // Medical & Dental
  { value: 'SPECIALIST', label: 'Specialist (Fellowship)' },
  { value: 'MEDICAL_OFFICER', label: 'Medical Officer (MBChB)' },
  { value: 'DENTAL_SURGEON', label: 'Dental Surgeon (BDS)' },
  
  // Pharmacy
  { value: 'DOCTOR_OF_PHARMACY', label: 'Doctor of Pharmacy (PharmD)' },
  { value: 'BACHELOR_OF_PHARMACY', label: 'Bachelor of Pharmacy (BPharm)' },
  { value: 'PHARMACY_TECHNICIAN', label: 'Pharmacy Technician (HND)' },
  
  // Nursing & Midwifery
  { value: 'BSC_NURSING', label: 'BSc Nursing' },
  { value: 'BSC_MIDWIFERY', label: 'BSc Midwifery' },
  { value: 'REGISTERED_GENERAL_NURSING', label: 'Registered General Nursing (Diploma)' },
  { value: 'REGISTERED_MIDWIFERY', label: 'Registered Midwifery (Diploma)' },
  { value: 'REGISTERED_MENTAL_HEALTH_NURSING', label: 'Registered Mental Health Nursing' },
  { value: 'COMMUNITY_HEALTH_NURSING', label: 'Community Health Nursing' },
  { value: 'NURSE_ASSISTANT_CLINICAL', label: 'Nurse Assistant Clinical (NAC)' },
  { value: 'NURSE_ASSISTANT_PREVENTIVE', label: 'Nurse Assistant Preventive (NAP)' },
  { value: 'CRITICAL_CARE_NURSING', label: 'Critical Care Nursing' },
  { value: 'PERIOPERATIVE_NURSING', label: 'Perioperative Nursing' },
  { value: 'PUBLIC_HEALTH_NURSING', label: 'Public Health Nursing' },
  
  // Allied Health Sciences
  { value: 'BSC_MEDICAL_LABORATORY_SCIENCE', label: 'BSc Medical Laboratory Science' },
  { value: 'BSC_PHYSIOTHERAPY', label: 'BSc Physiotherapy' },
  { value: 'BSC_RADIOGRAPHY', label: 'BSc Radiography' },
  { value: 'BSC_DIETETICS', label: 'BSc Dietetics' },
  { value: 'BSC_SONOGRAPHY', label: 'BSc Sonography' },
  { value: 'BSC_HEALTH_INFORMATION', label: 'BSc Health Information Management' },
  { value: 'BSC_AUDIOLOGY', label: 'BSc Audiology' },
  { value: 'BSC_OCCUPATIONAL_THERAPY', label: 'BSc Occupational Therapy' },
  { value: 'BSC_RESPIRATORY_THERAPY', label: 'BSc Respiratory Therapy' },
  { value: 'DOCTOR_OF_OPTOMETRY', label: 'Doctor of Optometry' },
  
  // Physician Assistantship
  { value: 'BSC_PHYSICIAN_ASSISTANT_MEDICAL', label: 'BSc Physician Assistant (Medical)' },
  { value: 'BSC_PHYSICIAN_ASSISTANT_DENTAL', label: 'BSc Physician Assistant (Dental)' },
  { value: 'BSC_ANAESTHESIA', label: 'BSc Anaesthesia' },
  
  // Allied Health Diplomas
  { value: 'DIPLOMA_MEDICAL_LABORATORY_TECHNOLOGY', label: 'Diploma Medical Laboratory Technology' },
  { value: 'DIPLOMA_PHYSIOTHERAPY', label: 'Diploma Physiotherapy' },
  { value: 'DIPLOMA_RADIOGRAPHY', label: 'Diploma Radiography' },
  { value: 'DIPLOMA_NUTRITION', label: 'Diploma Nutrition' },
  { value: 'DIPLOMA_HEALTH_INFORMATION', label: 'Diploma Health Information Management' },
  { value: 'DIPLOMA_PROSTHETICS_ORTHOTICS', label: 'Diploma Prosthetics & Orthotics' },
  { value: 'DIPLOMA_OPTICAL_TECHNOLOGY', label: 'Diploma Optical Technology' },
  
  // Other Certificates
  { value: 'CERTIFICATE_LABORATORY_ASSISTANT', label: 'Certificate Laboratory Assistant' },
  { value: 'CERTIFICATE_DISEASE_CONTROL', label: 'Certificate Disease Control' },
  { value: 'CERTIFICATE_NUTRITION', label: 'Certificate Nutrition' },
  
  // Advanced Practice
  { value: 'CERTIFIED_REGISTERED_ANAESTHETIST', label: 'Certified Registered Anaesthetist' },
  { value: 'OTHER', label: 'Other' }
];

const GRADUATE_SUBCATEGORIES = [
  { value: 'DEGREE_HOLDERS', label: 'Degree Holders' },
  { value: 'HND_HOLDERS', label: 'HND Holders' },
  { value: 'DIPLOMA_HOLDERS', label: 'Diploma Holders' }
];

const SPECIALIZATIONS = [
  // Technology & Computing
  { value: 'COMPUTER_SCIENCE', label: 'Computer Science' },
  { value: 'INFORMATION_TECHNOLOGY', label: 'Information Technology' },
  { value: 'SOFTWARE_ENGINEERING', label: 'Software Engineering' },
  { value: 'COMPUTER_ENGINEERING', label: 'Computer Engineering' },
  { value: 'DATA_SCIENCE', label: 'Data Science' },
  { value: 'CYBERSECURITY', label: 'Cybersecurity' },
  { value: 'INFORMATION_SYSTEMS', label: 'Information Systems' },
  
  // Engineering
  { value: 'CIVIL_ENGINEERING', label: 'Civil Engineering' },
  { value: 'MECHANICAL_ENGINEERING', label: 'Mechanical Engineering' },
  { value: 'ELECTRICAL_ENGINEERING', label: 'Electrical Engineering' },
  { value: 'CHEMICAL_ENGINEERING', label: 'Chemical Engineering' },
  { value: 'PETROLEUM_ENGINEERING', label: 'Petroleum Engineering' },
  { value: 'AGRICULTURAL_ENGINEERING', label: 'Agricultural Engineering' },
  { value: 'BIOMEDICAL_ENGINEERING', label: 'Biomedical Engineering' },
  { value: 'ENVIRONMENTAL_ENGINEERING', label: 'Environmental Engineering' },
  { value: 'INDUSTRIAL_ENGINEERING', label: 'Industrial Engineering' },
  { value: 'TELECOMMUNICATIONS_ENGINEERING', label: 'Telecommunications Engineering' },
  
  // Business & Management
  { value: 'BUSINESS_ADMINISTRATION', label: 'Business Administration' },
  { value: 'ACCOUNTING', label: 'Accounting' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'ECONOMICS', label: 'Economics' },
  { value: 'BANKING_FINANCE', label: 'Banking & Finance' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'HUMAN_RESOURCE_MANAGEMENT', label: 'Human Resource Management' },
  { value: 'PROJECT_MANAGEMENT', label: 'Project Management' },
  { value: 'OPERATIONS_MANAGEMENT', label: 'Operations Management' },
  { value: 'SUPPLY_CHAIN_MANAGEMENT', label: 'Supply Chain Management' },
  { value: 'ENTREPRENEURSHIP', label: 'Entrepreneurship' },
  
  // Law & Public Service
  { value: 'LAW', label: 'Law' },
  { value: 'PUBLIC_ADMINISTRATION', label: 'Public Administration' },
  { value: 'PUBLIC_POLICY', label: 'Public Policy' },
  { value: 'INTERNATIONAL_RELATIONS', label: 'International Relations' },
  { value: 'DIPLOMACY', label: 'Diplomacy' },
  { value: 'GOVERNANCE', label: 'Governance' },
  
  // Medical & Health Sciences
  { value: 'NURSING', label: 'Nursing' },
  { value: 'MEDICINE', label: 'Medicine' },
  { value: 'PHARMACY', label: 'Pharmacy' },
  { value: 'PUBLIC_HEALTH', label: 'Public Health' },
  { value: 'HEALTH_ADMINISTRATION', label: 'Health Administration' },
  { value: 'MEDICAL_LABORATORY_SCIENCE', label: 'Medical Laboratory Science' },
  { value: 'RADIOGRAPHY', label: 'Radiography' },
  { value: 'PHYSIOTHERAPY', label: 'Physiotherapy' },
  { value: 'NUTRITION_DIETETICS', label: 'Nutrition & Dietetics' },
  
  // Social Sciences
  { value: 'PSYCHOLOGY', label: 'Psychology' },
  { value: 'SOCIOLOGY', label: 'Sociology' },
  { value: 'POLITICAL_SCIENCE', label: 'Political Science' },
  { value: 'SOCIAL_WORK', label: 'Social Work' },
  { value: 'CRIMINOLOGY', label: 'Criminology' },
  { value: 'SECURITY_STUDIES', label: 'Security Studies' },
  { value: 'ANTHROPOLOGY', label: 'Anthropology' },
  { value: 'DEVELOPMENT_STUDIES', label: 'Development Studies' },
  
  // Natural Sciences
  { value: 'BIOLOGY', label: 'Biology' },
  { value: 'CHEMISTRY', label: 'Chemistry' },
  { value: 'PHYSICS', label: 'Physics' },
  { value: 'BIOCHEMISTRY', label: 'Biochemistry' },
  { value: 'MICROBIOLOGY', label: 'Microbiology' },
  { value: 'BIOTECHNOLOGY', label: 'Biotechnology' },
  { value: 'MATHEMATICS', label: 'Mathematics' },
  { value: 'STATISTICS', label: 'Statistics' },
  { value: 'ACTUARIAL_SCIENCE', label: 'Actuarial Science' },
  
  // Agriculture & Environment
  { value: 'AGRICULTURE', label: 'Agriculture' },
  { value: 'AGRIBUSINESS', label: 'Agribusiness' },
  { value: 'ANIMAL_SCIENCE', label: 'Animal Science' },
  { value: 'CROP_SCIENCE', label: 'Crop Science' },
  { value: 'FORESTRY', label: 'Forestry' },
  { value: 'ENVIRONMENTAL_SCIENCE', label: 'Environmental Science' },
  { value: 'ENVIRONMENTAL_MANAGEMENT', label: 'Environmental Management' },
  { value: 'FISHERIES', label: 'Fisheries' },
  
  // Education
  { value: 'EDUCATION', label: 'Education' },
  { value: 'EARLY_CHILDHOOD_EDUCATION', label: 'Early Childhood Education' },
  { value: 'GUIDANCE_COUNSELING', label: 'Guidance & Counseling' },
  
  // Arts & Humanities
  { value: 'ENGLISH', label: 'English' },
  { value: 'HISTORY', label: 'History' },
  { value: 'GEOGRAPHY', label: 'Geography' },
  { value: 'PHILOSOPHY', label: 'Philosophy' },
  { value: 'RELIGIOUS_STUDIES', label: 'Religious Studies' },
  { value: 'LINGUISTICS', label: 'Linguistics' },
  { value: 'FRENCH', label: 'French' },
  { value: 'SPANISH', label: 'Spanish' },
  { value: 'PERFORMING_ARTS', label: 'Performing Arts' },
  { value: 'FINE_ARTS', label: 'Fine Arts' },
  { value: 'MUSIC', label: 'Music' },
  
  // Communication & Media
  { value: 'COMMUNICATION_STUDIES', label: 'Communication Studies' },
  { value: 'MASS_COMMUNICATION', label: 'Mass Communication' },
  { value: 'JOURNALISM', label: 'Journalism' },
  { value: 'PUBLIC_RELATIONS', label: 'Public Relations' },
  { value: 'MEDIA_STUDIES', label: 'Media Studies' },
  
  // Architecture & Design
  { value: 'ARCHITECTURE', label: 'Architecture' },
  { value: 'URBAN_PLANNING', label: 'Urban Planning' },
  { value: 'GRAPHIC_DESIGN', label: 'Graphic Design' },
  { value: 'INDUSTRIAL_DESIGN', label: 'Industrial Design' },
  
  // Other
  { value: 'LIBRARY_SCIENCE', label: 'Library Science' },
  { value: 'HOSPITALITY_MANAGEMENT', label: 'Hospitality Management' },
  { value: 'TOURISM_MANAGEMENT', label: 'Tourism Management' },
  { value: 'SPORTS_SCIENCE', label: 'Sports Science' },
  { value: 'OTHER', label: 'Other' }
];

const DIPLOMA_SPECIALIZATIONS = [
  // Technical & Computing
  { value: 'COMPUTER_SCIENCE', label: 'Computer Science' },
  { value: 'INFORMATION_TECHNOLOGY', label: 'Information Technology' },
  { value: 'SOFTWARE_DEVELOPMENT', label: 'Software Development' },
  { value: 'COMPUTER_NETWORKING', label: 'Computer Networking' },
  { value: 'WEB_DEVELOPMENT', label: 'Web Development' },
  { value: 'DATABASE_ADMINISTRATION', label: 'Database Administration' },
  
  // Engineering & Technical
  { value: 'CIVIL_ENGINEERING', label: 'Civil Engineering' },
  { value: 'ELECTRICAL_ENGINEERING', label: 'Electrical Engineering' },
  { value: 'MECHANICAL_ENGINEERING', label: 'Mechanical Engineering' },
  { value: 'AUTOMOTIVE_ENGINEERING', label: 'Automotive Engineering' },
  { value: 'BUILDING_TECHNOLOGY', label: 'Building Technology' },
  { value: 'QUANTITY_SURVEYING', label: 'Quantity Surveying' },
  { value: 'LAND_SURVEYING', label: 'Land Surveying' },
  { value: 'ARCHITECTURAL_DRAFTING', label: 'Architectural Drafting' },
  
  // Business & Management
  { value: 'BUSINESS_ADMINISTRATION', label: 'Business Administration' },
  { value: 'ACCOUNTING', label: 'Accounting' },
  { value: 'SECRETARIAL_STUDIES', label: 'Secretarial Studies' },
  { value: 'OFFICE_MANAGEMENT', label: 'Office Management' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'PURCHASING_SUPPLY', label: 'Purchasing & Supply' },
  { value: 'HUMAN_RESOURCE_MANAGEMENT', label: 'Human Resource Management' },
  { value: 'BANKING_FINANCE', label: 'Banking & Finance' },
  { value: 'INSURANCE', label: 'Insurance' },
  
  // Health Sciences
  { value: 'NURSING', label: 'Nursing' },
  { value: 'MIDWIFERY', label: 'Midwifery' },
  { value: 'COMMUNITY_HEALTH_NURSING', label: 'Community Health Nursing' },
  { value: 'MEDICAL_LABORATORY_TECHNOLOGY', label: 'Medical Laboratory Technology' },
  { value: 'PHARMACY_TECHNOLOGY', label: 'Pharmacy Technology' },
  { value: 'HEALTH_INFORMATION_MANAGEMENT', label: 'Health Information Management' },
  { value: 'DENTAL_TECHNOLOGY', label: 'Dental Technology' },
  { value: 'ENVIRONMENTAL_HEALTH', label: 'Environmental Health' },
  { value: 'NUTRITION_DIETETICS', label: 'Nutrition & Dietetics' },
  
  // Agriculture
  { value: 'AGRICULTURE', label: 'Agriculture' },
  { value: 'AGRIBUSINESS', label: 'Agribusiness' },
  { value: 'ANIMAL_HEALTH', label: 'Animal Health' },
  { value: 'CROP_PRODUCTION', label: 'Crop Production' },
  { value: 'ANIMAL_PRODUCTION', label: 'Animal Production' },
  
  // Arts & Communication
  { value: 'MASS_COMMUNICATION', label: 'Mass Communication' },
  { value: 'JOURNALISM', label: 'Journalism' },
  { value: 'PUBLIC_RELATIONS', label: 'Public Relations' },
  { value: 'GRAPHIC_DESIGN', label: 'Graphic Design' },
  { value: 'PHOTOGRAPHY', label: 'Photography' },
  { value: 'FASHION_DESIGN', label: 'Fashion Design' },
  
  // Education
  { value: 'EARLY_CHILDHOOD_EDUCATION', label: 'Early Childhood Education' },
  { value: 'BASIC_EDUCATION', label: 'Basic Education' },
  
  // Hospitality & Tourism
  { value: 'HOTEL_MANAGEMENT', label: 'Hotel Management' },
  { value: 'CATERING_MANAGEMENT', label: 'Catering Management' },
  { value: 'TOURISM_MANAGEMENT', label: 'Tourism Management' },
  { value: 'TRAVEL_TOURISM', label: 'Travel & Tourism' },
  
  // Other Professional
  { value: 'LEGAL_STUDIES', label: 'Legal Studies' },
  { value: 'SOCIAL_WORK', label: 'Social Work' },
  { value: 'LIBRARY_STUDIES', label: 'Library Studies' },
  { value: 'SECURITY_ADMINISTRATION', label: 'Security Administration' },
  { value: 'LOGISTICS_TRANSPORT', label: 'Logistics & Transport' },
  { value: 'OTHER', label: 'Other' }
];

const HND_SPECIALIZATIONS = [
  // Technology & Computing
  { value: 'COMPUTER_SCIENCE', label: 'Computer Science' },
  { value: 'INFORMATION_TECHNOLOGY', label: 'Information Technology' },
  { value: 'SOFTWARE_ENGINEERING', label: 'Software Engineering' },
  { value: 'COMPUTER_NETWORKING', label: 'Computer Networking & Security' },
  { value: 'WEB_TECHNOLOGIES', label: 'Web Technologies' },
  { value: 'MULTIMEDIA_TECHNOLOGY', label: 'Multimedia Technology' },
  { value: 'INFORMATION_SYSTEMS', label: 'Information Systems Management' },
  
  // Engineering
  { value: 'CIVIL_ENGINEERING', label: 'Civil Engineering' },
  { value: 'MECHANICAL_ENGINEERING', label: 'Mechanical Engineering' },
  { value: 'ELECTRICAL_ENGINEERING', label: 'Electrical & Electronic Engineering' },
  { value: 'CHEMICAL_ENGINEERING', label: 'Chemical Engineering' },
  { value: 'PETROLEUM_ENGINEERING', label: 'Petroleum Engineering' },
  { value: 'AUTOMOTIVE_ENGINEERING', label: 'Automotive Engineering' },
  { value: 'BUILDING_TECHNOLOGY', label: 'Building Technology' },
  { value: 'QUANTITY_SURVEYING', label: 'Quantity Surveying' },
  { value: 'LAND_SURVEYING', label: 'Land Surveying & Geoinformatics' },
  { value: 'ARCHITECTURAL_TECHNOLOGY', label: 'Architectural Technology' },
  { value: 'TELECOMMUNICATION_ENGINEERING', label: 'Telecommunication Engineering' },
  { value: 'BIOMEDICAL_ENGINEERING', label: 'Biomedical Engineering' },
  
  // Business & Management
  { value: 'BUSINESS_ADMINISTRATION', label: 'Business Administration' },
  { value: 'ACCOUNTANCY', label: 'Accountancy' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'HUMAN_RESOURCE_MANAGEMENT', label: 'Human Resource Management' },
  { value: 'BANKING_FINANCE', label: 'Banking & Finance' },
  { value: 'PURCHASING_SUPPLY', label: 'Purchasing & Supply' },
  { value: 'SECRETARIAL_MANAGEMENT', label: 'Secretarial & Management Studies' },
  { value: 'BUSINESS_COMPUTING', label: 'Business Computing' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'LOGISTICS_SUPPLY_CHAIN', label: 'Logistics & Supply Chain Management' },
  
  // Health Sciences
  { value: 'NURSING', label: 'Nursing' },
  { value: 'MIDWIFERY', label: 'Midwifery' },
  { value: 'MEDICAL_LABORATORY_SCIENCE', label: 'Medical Laboratory Science' },
  { value: 'HEALTH_INFORMATION_MANAGEMENT', label: 'Health Information Management' },
  { value: 'ENVIRONMENTAL_HEALTH_SANITATION', label: 'Environmental Health & Sanitation' },
  { value: 'COMMUNITY_HEALTH', label: 'Community Health' },
  { value: 'NUTRITION_DIETETICS', label: 'Nutrition & Dietetics' },
  { value: 'DENTAL_TECHNOLOGY', label: 'Dental Technology' },
  
  // Agriculture & Natural Resources
  { value: 'AGRICULTURE', label: 'Agriculture' },
  { value: 'AGRIBUSINESS_MANAGEMENT', label: 'Agribusiness Management' },
  { value: 'CROP_PRODUCTION', label: 'Crop Production Technology' },
  { value: 'ANIMAL_SCIENCE', label: 'Animal Science' },
  { value: 'AGRICULTURAL_ENGINEERING', label: 'Agricultural Engineering' },
  { value: 'HORTICULTURE', label: 'Horticulture' },
  { value: 'FORESTRY', label: 'Forestry & Wildlife Management' },
  { value: 'FISHERIES', label: 'Fisheries & Aquaculture' },
  
  // Applied Sciences
  { value: 'STATISTICS', label: 'Statistics' },
  { value: 'LABORATORY_TECHNOLOGY', label: 'Laboratory Technology' },
  { value: 'INDUSTRIAL_CHEMISTRY', label: 'Industrial Chemistry' },
  { value: 'ENVIRONMENTAL_SCIENCE', label: 'Environmental Science & Technology' },
  { value: 'FOOD_SCIENCE', label: 'Food Science & Technology' },
  
  // Communication & Media
  { value: 'MASS_COMMUNICATION', label: 'Mass Communication' },
  { value: 'JOURNALISM', label: 'Journalism' },
  { value: 'PUBLIC_RELATIONS', label: 'Public Relations' },
  { value: 'GRAPHIC_DESIGN', label: 'Graphic Design & Multimedia' },
  { value: 'PHOTOGRAPHY', label: 'Photography' },
  { value: 'FILM_PRODUCTION', label: 'Film & Video Production' },
  
  // Hospitality & Tourism
  { value: 'HOTEL_CATERING', label: 'Hotel & Catering Management' },
  { value: 'HOSPITALITY_MANAGEMENT', label: 'Hospitality Management' },
  { value: 'TOURISM_MANAGEMENT', label: 'Tourism Management' },
  
  // Arts & Design
  { value: 'FASHION_DESIGN', label: 'Fashion Design & Textiles' },
  { value: 'INTERIOR_DESIGN', label: 'Interior Design' },
  { value: 'INDUSTRIAL_ART', label: 'Industrial Art' },
  
  // Other Professional
  { value: 'ESTATE_MANAGEMENT', label: 'Estate Management' },
  { value: 'NAUTICAL_SCIENCE', label: 'Nautical Science' },
  { value: 'PORT_SHIPPING', label: 'Port & Shipping Administration' },
  { value: 'PROCUREMENT_MANAGEMENT', label: 'Procurement Management' },
  { value: 'SECURITY_MANAGEMENT', label: 'Security Management' },
  { value: 'OTHER', label: 'Other' }
];

const RELIGIOUS_SUBCATEGORIES = [
  { value: 'CHAPLAIN', label: 'Chaplain (Christian)' },
  { value: 'IMAM', label: 'Imam (Muslim)' }
];

const CHRISTIAN_QUALIFICATIONS = [
  { value: 'PHD_THEOLOGY', label: 'PhD in Theology/Religious Studies' },
  { value: 'MASTER_DIVINITY', label: 'Master of Divinity (MDiv)' },
  { value: 'MASTER_THEOLOGY', label: 'Master of Theology (ThM)' },
  { value: 'BACHELOR_THEOLOGY', label: 'Bachelor of Theology (BTh)' },
  { value: 'BACHELOR_RELIGIOUS_STUDIES', label: 'Bachelor of Religious Studies' },
  { value: 'DIPLOMA_THEOLOGY', label: 'Diploma in Theology' },
  { value: 'DIPLOMA_RELIGIOUS_STUDIES', label: 'Diploma in Religious Studies' },
  { value: 'CERTIFICATE_MINISTRY', label: 'Certificate in Ministry' },
  { value: 'OTHER', label: 'Other' }
];

const ISLAMIC_QUALIFICATIONS = [
  { value: 'PHD_ISLAMIC_STUDIES', label: 'PhD in Islamic Studies/Shariah' },
  { value: 'MASTER_ISLAMIC_STUDIES', label: 'Master in Islamic Studies/Shariah' },
  { value: 'BACHELOR_ISLAMIC_STUDIES', label: 'Bachelor in Islamic Studies/Shariah' },
  { value: 'BACHELOR_ARABIC_ISLAMIC', label: 'Bachelor in Arabic & Islamic Sciences' },
  { value: 'DIPLOMA_ISLAMIC_STUDIES', label: 'Diploma in Islamic Studies' },
  { value: 'DIPLOMA_ARABIC_EDUCATION', label: 'Diploma in Arabic Education' },
  { value: 'CERTIFICATE_ISLAMIC_THEOLOGY', label: 'Certificate in Islamic Theology' },
  { value: 'SHAHADA_ALIYYA', label: 'Shahada Aliyya (Higher Certificate)' },
  { value: 'SHAHADA_THANAWIYYA', label: 'Shahada Thanawiyya (Secondary Certificate)' },
  { value: 'HAFIZ_QURAN', label: 'Hafiz of Quran' },
  { value: 'OTHER', label: 'Other' }
];

const SCREENING_CENTERS = [
  { value: 'ASH', label: 'Ashanti Region' },
  { value: 'BAR', label: 'Brong Ahafo Region' },
  { value: 'CEN', label: 'Central Region' },
  { value: 'EAS', label: 'Eastern Region' },
  { value: 'GAR', label: 'Greater Accra Region' },
  { value: 'NOR', label: 'Northern Region' },
  { value: 'SAV', label: 'Savannah Region' },
  { value: 'UEA', label: 'Upper East Region' },
  { value: 'UWE', label: 'Upper West Region' },
  { value: 'VOL', label: 'Volta Region' },
  { value: 'WES', label: 'Western Region' },
  { value: 'WNO', label: 'Western North Region' },
  { value: 'OTI', label: 'Oti Region' },
  { value: 'NEA', label: 'North East Region' },
  { value: 'BOE', label: 'Bono East Region' },
  { value: 'AHA', label: 'Ahafo Region' }
];

const SPORTS_DISCIPLINES = [
  { value: 'BOXING', label: 'Boxing' },
  { value: 'FOOTBALL', label: 'Football' },
  { value: 'HANDBALL', label: 'Handball' },
  { value: 'BASKETBALL', label: 'Basketball' },
  { value: 'HOCKEY', label: 'Hockey' },
  { value: 'TENNIS', label: 'Tennis' },
  { value: 'TABLE_TENNIS', label: 'Table Tennis' },
  { value: 'VOLLEYBALL', label: 'Volleyball' },
  { value: 'ATHLETICS', label: 'Athletics' },
  { value: 'BADMINTON', label: 'Badminton' },
  { value: 'ARM_WRESTLING', label: 'Arm Wrestling' },
  { value: 'MARTIAL_ARTS', label: 'Martial Arts' }
];

const LICENSE_CLASSES = [
  { value: 'B', label: 'Class B' },
  { value: 'C', label: 'Class C' },
  { value: 'D', label: 'Class D' },
  { value: 'E', label: 'Class E' },
  { value: 'F', label: 'Class F' }
];

const TRADE_QUALIFICATIONS = [
  { value: 'NVTI_GRADE_1', label: 'NVTI Grade I' },
  { value: 'NVTI_GRADE_2', label: 'NVTI Grade II' },
  { value: 'NVTI_GRADE_3', label: 'NVTI Grade III' },
  { value: 'CITY_AND_GUILDS', label: 'City & Guilds' },
  { value: 'CRAFT_CERTIFICATE', label: 'Craft Certificate' },
  { value: 'ADVANCED_CRAFT_CERTIFICATE', label: 'Advanced Craft Certificate' },
  { value: 'TECHNICIAN_CERTIFICATE', label: 'Technician Certificate' },
  { value: 'TRADE_TEST_CERTIFICATE', label: 'Trade Test Certificate' },
  { value: 'OTHER', label: 'Other Professional Certificate' }
];

const categorySchema = z.object({
  category: z.string().min(1, 'Please select a recruitment category'),
  subCategory: z.string().optional(),
  specialization: z.string().optional(),
  screeningCenter: z.string().min(1, 'Screening center is required'),
  
  // Tradesmen fields
  tradeQualification: z.string().optional(),
  tradeExperienceYears: z.number().optional(),
  
  // Medical fields
  professionalRegistrationNumber: z.string().optional(),
  medicalQualification: z.string().optional(),
  
  // Religious fields
  ordinationDetails: z.string().optional(),
  religiousQualification: z.string().optional(),
  
  // Sports fields
  sportsDiscipline: z.string().optional(),
  sportsAchievements: z.string().optional(),
  
  // Drivers License
  hasDriversLicense: z.boolean().default(false),
  driversLicenseClass: z.string().optional(),
  driversLicenseNumber: z.string().optional(),
  driversLicenseExpiry: z.string().optional(),
}).refine((data) => {
  if (data.category === 'TRADESMEN') {
    return !!data.subCategory && !!data.tradeQualification && !!data.tradeExperienceYears;
  }
  return true;
  // eslint-disable-next-line
}, {
  message: 'Trade area, qualification and experience are required for Tradesmen',
  path: ['subCategory'],
}).refine((data) => {
  if (data.category === 'MEDICAL_PROFESSIONALS') {
    return !!data.subCategory && !!data.professionalRegistrationNumber && !!data.medicalQualification;
  }
  return true;
}, {
  message: 'Medical area, qualification and PIN/Registration number are required',
  path: ['subCategory'],
}).refine((data) => {
  if (data.category === 'GRADUATES') {
    return !!data.subCategory;
  }
  return true;
}, {
  message: 'Qualification level is required for Graduates',
  path: ['subCategory'],
}).refine((data) => {
  if (data.category === 'RELIGIOUS_AFFAIRS') {
    return !!data.subCategory && !!data.religiousQualification && !!data.ordinationDetails;
  }
  return true;
}, {
  message: 'Religious group, qualification and ordination details are required',
  path: ['subCategory'],
}).refine((data) => {
  // Only require driver's license fields if subCategory is DRIVERS_RIDERS and checkbox is checked
  if (data.subCategory === 'DRIVERS_RIDERS' && data.hasDriversLicense) {
    return !!data.driversLicenseClass && !!data.driversLicenseNumber && !!data.driversLicenseExpiry;
  }
  return true;
}, {
  message: 'License class, number and expiry are required',
  path: ['driversLicenseClass'],
});


export default function CategorySelectionForm() {
  const { formData, nextStep, dataLoaded } = useApplication();
  const [serverError, setServerError] = useState(null);
  const hasInitializedRef = useRef(false);

  // Normalize snake_case data from backend to camelCase for form state
  const getNormalizedDefaultValues = useCallback(() => {
    const data = formData.categoryDetails || {};
    return {
      category: data.category || formData.category || '',
      subCategory: data.subCategory || formData.subCategory || '',
      specialization: data.specialization || formData.specialization || '',
      screeningCenter: data.preferredRegion || formData.preferredRegion || '',
      
      // Tradesmen
      tradeQualification: data.tradeQualification || '',
      tradeExperienceYears: data.tradeExperienceYears || undefined,
      
      // Medical
      professionalRegistrationNumber: data.professionalRegistrationNumber || '',
      medicalQualification: data.medicalQualification || '',
      
      // Religious
      ordinationDetails: data.ordinationDetails || '',
      religiousQualification: data.religiousQualification || '',
      
      // Sports
      sportsDiscipline: data.sportsDiscipline || '',
      sportsAchievements: data.sportsAchievements || '',
      
      // Drivers License
      hasDriversLicense: data.hasDriversLicense ?? false,
      driversLicenseClass: data.driversLicenseClass || '',
      driversLicenseNumber: data.driversLicenseNumber || '',
      driversLicenseExpiry: data.driversLicenseExpiry ? new Date(data.driversLicenseExpiry).toISOString().split('T')[0] : ''
    };
  }, [formData.categoryDetails, formData.category, formData.subCategory, formData.specialization, formData.preferredRegion]);

  const methods = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: getNormalizedDefaultValues(),
    mode: 'onChange'
  });

  const { handleSubmit, register, formState: { errors }, watch, reset } = methods;

  // Re-initialize form when data is loaded from context
  useEffect(() => {
    if (dataLoaded && !hasInitializedRef.current) {
      reset(getNormalizedDefaultValues());
      hasInitializedRef.current = true;
    }
  }, [dataLoaded, reset, getNormalizedDefaultValues]);

  const onSubmit = async (data) => {
    setServerError(null);
    
    // Create a sanitized copy of the data to remove fields not relevant to the selected category
    const sanitizedData = { ...data };
    
    // Map screeningCenter to preferredRegion to match backend schema
    sanitizedData.preferredRegion = data.screeningCenter;
    delete sanitizedData.screeningCenter;
    
    // Clear TRADESMEN fields
    if (data.category !== 'TRADESMEN') {
      delete sanitizedData.tradeQualification;
      delete sanitizedData.tradeExperienceYears;
    }
    
    // Clear MEDICAL_PROFESSIONALS fields
    if (data.category !== 'MEDICAL_PROFESSIONALS') {
      delete sanitizedData.professionalRegistrationNumber;
      delete sanitizedData.medicalQualification;
    }
    
    // Clear RELIGIOUS_AFFAIRS fields
    if (data.category !== 'RELIGIOUS_AFFAIRS') {
      delete sanitizedData.ordinationDetails;
      delete sanitizedData.religiousQualification;
    }
    
    // Clear SPORTSMEN fields
    if (data.category !== 'SPORTSMEN') {
      delete sanitizedData.sportsDiscipline;
      delete sanitizedData.sportsAchievements;
    }

    // Clear Driver's License fields
    // Only keep if subCategory is DRIVERS_RIDERS (if applicable) or if specifically enabled
    // Note: The schema logic implies drivers license details are only for DRIVERS_RIDERS subcat
    const isDriverWithError = data.subCategory === 'DRIVERS_RIDERS';
    if (!isDriverWithError && !data.hasDriversLicense) {
       // If not explicitly a driver flow or unchecked, we might want to clear details
       // But hasDriversLicense might be valid for others? The schema check:
       // if (data.subCategory === 'DRIVERS_RIDERS' && data.hasDriversLicense) ...
    }
    
    // Safer approach matching usage:
    if (data.subCategory !== 'DRIVERS_RIDERS' || !data.hasDriversLicense) {
       delete sanitizedData.driversLicenseClass;
       delete sanitizedData.driversLicenseNumber;
       delete sanitizedData.driversLicenseExpiry;
    }
    
    // If not drivers/riders, maybe we shouldn't even send hasDriversLicense? 
    // Schema default says false.
    if (data.subCategory !== 'DRIVERS_RIDERS') {
       sanitizedData.hasDriversLicense = false;
    }

    console.log('Submitting sanitized category data:', JSON.stringify(sanitizedData, null, 2));
    try {
      await nextStep('categoryDetails', sanitizedData);
    } catch (error) {
      console.error('Failed to save category selection:', error);
      if (error.data) {
        console.error('Server error data:', error.data);
      }
      
      let message = error.data?.message || error.message || 'Failed to save category selection';
      
      // If there are detailed validation errors, append them
      if (error.data?.errors && Array.isArray(error.data.errors)) {
        const details = error.data.errors.map(err => `${err.field}: ${err.message}`).join(', ');
        message = `${message} - ${details}`;
      }
      
      setServerError(message);
    }
  };

  const selectedCategory = watch('category');
  const selectedSubCategory = watch('subCategory');
  const hasDriversLicense = watch('hasDriversLicense');
  
  // Only show driver's license section for Drivers & Riders
  const showDriversLicense = selectedCategory === 'TRADESMEN' && selectedSubCategory === 'DRIVERS_RIDERS';

  return (
    <div className={styles.container}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AutoSave stepKey="categoryDetails" />
          
          <div className={styles.header}>
            <h2>Category Selection</h2>
            <p>Choose your recruitment category and preferred screening region.</p>
          </div>

          {serverError && (
            <div className={styles.serverError}>
              {typeof serverError === 'string' ? serverError : JSON.stringify(serverError)}
            </div>
          )}

          <div className={styles.formSection}>
            <div className={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <label
                  key={cat.id}
                  className={`${styles.categoryCard} ${selectedCategory === cat.id ? styles.selected : ''}`}
                >
                  <input
                    type="radio"
                    value={cat.id}
                    className={styles.hiddenInput}
                    {...register('category')}
                  />
                  <div className={styles.categoryBadge}>{cat.id.replace('_', ' ')}</div>
                  <div className={styles.categoryInfo}>
                    <strong>{cat.name}</strong>
                    <p>{cat.description}</p>
                    <div className={styles.requirements}>
                      <span>Age: {cat.minAge}-{cat.maxAge}</span>
                      <span>Min: {cat.minHeight}cm</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.category && <span className={styles.errorMessage}>{errors.category.message}</span>}

            <div className={styles.conditionalFields}>
              {selectedCategory === 'TRADESMEN' && (
                <div className={styles.row}>
                  <Select
                    label="Trade Area"
                    options={TRADESMEN_SUBCATEGORIES}
                    {...register('subCategory')}
                    error={errors.subCategory?.message} />
                  <Select
                    label="Trade Qualification"
                    options={TRADE_QUALIFICATIONS}
                    {...register('tradeQualification')}
                    error={errors.tradeQualification?.message} />
                  <Input
                    label="Years of Experience"
                    type="number"
                    {...register('tradeExperienceYears', { valueAsNumber: true })}
                    error={errors.tradeExperienceYears?.message}
                    placeholder="e.g. 3" 
                  />
                </div>
              )}

              {selectedCategory === 'MEDICAL_PROFESSIONALS' && (
                <div className={styles.row}>
                  <Select
                    label="Medical Area"
                    options={MEDICAL_SUBCATEGORIES}
                    {...register('subCategory')}
                    error={errors.subCategory?.message}
                  />
                  <Select
                    label="Qualification"
                    options={MEDICAL_QUALIFICATIONS}
                    {...register('medicalQualification')}
                    error={errors.medicalQualification?.message}
                  />
                  <Input 
                    label="PIN/Registration Number" 
                    {...register('professionalRegistrationNumber')} 
                    error={errors.professionalRegistrationNumber?.message} 
                  />
                </div>
              )}

              {selectedCategory === 'GRADUATES' && (
                <div className={styles.row}>
                  <Select
                    label="Qualification Level"
                    options={GRADUATE_SUBCATEGORIES}
                    {...register('subCategory')}
                    error={errors.subCategory?.message}
                  />
                  <Select 
                    label="Specialization" 
                    options={
                      selectedSubCategory === 'DIPLOMA_HOLDERS' 
                        ? DIPLOMA_SPECIALIZATIONS 
                        : selectedSubCategory === 'HND_HOLDERS'
                        ? HND_SPECIALIZATIONS
                        : SPECIALIZATIONS
                    }
                    {...register('specialization')} 
                    error={errors.specialization?.message}
                  />
                </div>
              )}

              {selectedCategory === 'RELIGIOUS_AFFAIRS' && (
                <div className={styles.row}>
                  <Select
                    label="Religious Group"
                    options={RELIGIOUS_SUBCATEGORIES}
                    {...register('subCategory')}
                    error={errors.subCategory?.message}
                  />
                  <Select
                    label="Qualification"
                    options={selectedSubCategory === 'IMAM' ? ISLAMIC_QUALIFICATIONS : CHRISTIAN_QUALIFICATIONS}
                    {...register('religiousQualification')}
                    error={errors.religiousQualification?.message}
                  />
                  <Input 
                    label="Ordination Details" 
                    {...register('ordinationDetails')} 
                    error={errors.ordinationDetails?.message} 
                  />
                </div>
              )}

              {selectedCategory === 'SPORTSMEN' && (
                <div className={styles.row}>
                  <Select
                    label="Sporting Discipline"
                    options={SPORTS_DISCIPLINES}
                    {...register('sportsDiscipline')}
                    error={errors.sportsDiscipline?.message}
                  />
                  <div className={styles.fullWidth}>
                    <Input 
                      label="Achievements" 
                      {...register('sportsAchievements')} 
                      error={errors.sportsAchievements?.message} 
                      placeholder="List major national or international achievements..."
                    />
                  </div>
                </div>
              )}
            </div>

            {showDriversLicense && (
              <div className={styles.licenseSection}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    {...register('hasDriversLicense')} 
                  />
                  <span>I have a valid Ghanaian Driver&apos;s License</span>
                </label>

                {hasDriversLicense && (
                  <div className={styles.licenseDetails}>
                    <Select
                      label="License Class"
                      options={LICENSE_CLASSES}
                      {...register('driversLicenseClass')}
                      error={errors.driversLicenseClass?.message}
                    />
                    <Input 
                      label="License Number" 
                      {...register('driversLicenseNumber')} 
                      error={errors.driversLicenseNumber?.message} 
                    />
                    <Input 
                      label="Expiry Date" 
                      type="date"
                      {...register('driversLicenseExpiry')} 
                      error={errors.driversLicenseExpiry?.message} 
                    />
                  </div>
                )}
              </div>
            )}

            <div className={styles.regionSection}>
              <h3>Screening Center</h3>
              <p>Select your preferred screening center.</p>
              <div className={styles.row}>
                <Select
                  label="Screening Center"
                  options={SCREENING_CENTERS}
                  {...register('screeningCenter')}
                  error={errors.screeningCenter?.message}
                />
              </div>
            </div>
          </div>

          <WizardNavigation />
        </form>
      </FormProvider>
    </div>
  );
}

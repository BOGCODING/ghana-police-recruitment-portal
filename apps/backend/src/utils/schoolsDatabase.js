/**
 * Ghana Senior High Schools Database
 * Common schools for auto-suggestion
 */

const GHANA_SHS_SCHOOLS = [
  // Greater Accra
  { name: 'ACHIMOTA SCHOOL', region: 'GAR', town: 'ACHIMOTA' },
  { name: 'ACCRA ACADEMY', region: 'GAR', town: 'ACCRA' },
  { name: 'WESLEY GIRLS HIGH SCHOOL', region: 'GAR', town: 'ACCRA' },
  { name: 'ST. THOMAS AQUINAS SHS', region: 'GAR', town: 'ACCRA' },
  { name: 'ACCRA GIRLS SHS', region: 'GAR', town: 'ACCRA' },
  { name: 'PRESEC LEGON', region: 'GAR', town: 'LEGON' },
  { name: 'LABONE SHS', region: 'GAR', town: 'ACCRA' },
  { name: 'O\'REILLY SHS', region: 'GAR', town: 'ACCRA' },
  { name: 'TEMA SHS', region: 'GAR', town: 'TEMA' },
  { name: 'TEMA METHODIST DAY SHS', region: 'GAR', town: 'TEMA' },
  
  // Ashanti
  { name: 'PREMPEH COLLEGE', region: 'ASH', town: 'KUMASI' },
  { name: 'OPOKU WARE SCHOOL', region: 'ASH', town: 'KUMASI' },
  { name: 'ST. LOUIS SHS', region: 'ASH', town: 'KUMASI' },
  { name: 'YAAASANTEWAA GIRLS SHS', region: 'ASH', town: 'KUMASI' },
  { name: 'KUMASI ACADEMY', region: 'ASH', town: 'KUMASI' },
  { name: 'KUMASI HIGH SCHOOL', region: 'ASH', town: 'KUMASI' },
  { name: 'T.I. AHMADIYYA SHS', region: 'ASH', town: 'KUMASI' },
  { name: 'OSEI TUTU SHS', region: 'ASH', town: 'KUMASI' },
  { name: 'ARMED FORCES SHS', region: 'ASH', town: 'KUMASI' },
  
  // Western
  { name: 'ST. AUGUSTINE\'S COLLEGE', region: 'WES', town: 'CAPE COAST' },
  { name: 'MFANTSIPIM SCHOOL', region: 'CEN', town: 'CAPE COAST' },
  { name: 'HOLY CHILD SCHOOL', region: 'CEN', town: 'CAPE COAST' },
  { name: 'ADISADEL COLLEGE', region: 'CEN', town: 'CAPE COAST' },
  { name: 'GHANA NATIONAL COLLEGE', region: 'CEN', town: 'CAPE COAST' },
  { name: 'FIJAI SHS', region: 'WES', town: 'SEKONDI' },
  { name: 'SEKONDI COLLEGE', region: 'WES', town: 'SEKONDI' },
  
  // Eastern
  { name: 'ABURI GIRLS SHS', region: 'EAS', town: 'ABURI' },
  { name: 'KOFORIDUA SHS', region: 'EAS', town: 'KOFORIDUA' },
  { name: 'POPE JOHN SHS', region: 'EAS', town: 'KOFORIDUA' },
  { name: 'NEW JUABEN SHS', region: 'EAS', town: 'KOFORIDUA' },
  { name: 'OKUAPEMMAN SCHOOL', region: 'EAS', town: 'AKROPONG' },
  
  // Volta
  { name: 'MAWULI SCHOOL', region: 'VOL', town: 'HO' },
  { name: 'OLA GIRLS SHS', region: 'VOL', town: 'HO' },
  { name: 'BISHOP HERMAN COLLEGE', region: 'VOL', town: 'KPANDO' },
  { name: 'SOKODE SHS', region: 'VOL', town: 'HO' },
  
  // Central
  { name: 'MFANTSIPIM SCHOOL', region: 'CEN', town: 'CAPE COAST' },
  { name: 'WESLEY GIRLS HIGH SCHOOL', region: 'CEN', town: 'CAPE COAST' },
  { name: 'AGGREY MEMORIAL SHS', region: 'CEN', town: 'CAPE COAST' },
  { name: 'SWEDRU SHS', region: 'CEN', town: 'SWEDRU' },
  
  // Northern
  { name: 'TAMALE SHS', region: 'NOR', town: 'TAMALE' },
  { name: 'GHANA SHS', region: 'NOR', town: 'TAMALE' },
  { name: 'BUSINESS SHS TAMALE', region: 'NOR', town: 'TAMALE' },
  { name: 'NORTHERN SCHOOL OF BUSINESS', region: 'NOR', town: 'TAMALE' },
  
  // Upper East
  { name: 'BOLGATANGA SHS', region: 'UPE', town: 'BOLGATANGA' },
  { name: 'ZUARUNGU SHS', region: 'UPE', town: 'ZUARUNGU' },
  { name: 'NAVRONGO SHS', region: 'UPE', town: 'NAVRONGO' },
  
  // Upper West
  { name: 'WA SHS', region: 'UPW', town: 'WA' },
  { name: 'QUEEN OF PEACE SHS', region: 'UPW', town: 'WA' },
  { name: 'NANDOM SHS', region: 'UPW', town: 'NANDOM' }
];

/**
 * Search schools by name
 */
const searchSchools = (query, limit = 10) => {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toUpperCase().trim();
  
  return GHANA_SHS_SCHOOLS
    .filter(school => 
      school.name.includes(normalizedQuery) || 
      school.town.includes(normalizedQuery)
    )
    .slice(0, limit)
    .map(s => ({
      name: s.name,
      region: s.region,
      town: s.town,
      displayName: `${s.name}, ${s.town}`
    }));
};

/**
 * Get schools by region
 */
const getSchoolsByRegion = (regionCode) => {
  return GHANA_SHS_SCHOOLS
    .filter(school => school.region === regionCode)
    .map(s => ({
      name: s.name,
      town: s.town,
      displayName: `${s.name}, ${s.town}`
    }));
};

/**
 * Validate school name
 */
const validateSchoolName = (schoolName) => {
  if (!schoolName) {
    return { isValid: false, error: 'School name is required' };
  }
  
  const normalized = schoolName.toUpperCase().trim();
  
  if (normalized.length < 3) {
    return { isValid: false, error: 'School name too short' };
  }
  
  // Check if it's a known school
  const knownSchool = GHANA_SHS_SCHOOLS.find(s => s.name === normalized);
  
  return {
    isValid: true,
    normalized,
    isKnownSchool: !!knownSchool,
    schoolInfo: knownSchool || null
  };
};

/**
 * Get all schools
 */
const getAllSchools = () => {
  return GHANA_SHS_SCHOOLS.map(s => ({
    name: s.name,
    region: s.region,
    town: s.town
  }));
};

module.exports = {
  GHANA_SHS_SCHOOLS,
  searchSchools,
  getSchoolsByRegion,
  validateSchoolName,
  getAllSchools
};

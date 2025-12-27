-- 020b_rename_columns_to_camelcase.sql
-- Safe column renaming: only rename if source exists AND target does NOT exist

DO $$
DECLARE
    safe_rename CONSTANT TEXT := 'SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2';
BEGIN
    -- Users table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='passwordHash') THEN
        ALTER TABLE users RENAME COLUMN password_hash TO "passwordHash";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='user_type') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='userType') THEN
        ALTER TABLE users RENAME COLUMN user_type TO "userType";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='lastLogin') THEN
        ALTER TABLE users RENAME COLUMN last_login TO "lastLogin";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_active') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='isActive') THEN
        ALTER TABLE users RENAME COLUMN is_active TO "isActive";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='createdAt') THEN
        ALTER TABLE users RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='updated_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='updatedAt') THEN
        ALTER TABLE users RENAME COLUMN updated_at TO "updatedAt";
    END IF;

    -- Admins table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='password_hash') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='passwordHash') THEN
        ALTER TABLE admins RENAME COLUMN password_hash TO "passwordHash";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='first_name') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='firstName') THEN
        ALTER TABLE admins RENAME COLUMN first_name TO "firstName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='last_name') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='lastName') THEN
        ALTER TABLE admins RENAME COLUMN last_name TO "lastName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='is_active') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='isActive') THEN
        ALTER TABLE admins RENAME COLUMN is_active TO "isActive";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='last_login') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='lastLogin') THEN
        ALTER TABLE admins RENAME COLUMN last_login TO "lastLogin";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='assigned_regions') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='assignedRegions') THEN
        ALTER TABLE admins RENAME COLUMN assigned_regions TO "assignedRegions";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='createdAt') THEN
        ALTER TABLE admins RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='updated_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='updatedAt') THEN
        ALTER TABLE admins RENAME COLUMN updated_at TO "updatedAt";
    END IF;

    -- Applicants table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='serial_number') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='serialNumber') THEN
        ALTER TABLE applicants RENAME COLUMN serial_number TO "serialNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='phone_number') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='phoneNumber') THEN
        ALTER TABLE applicants RENAME COLUMN phone_number TO "phoneNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='password_hash') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='passwordHash') THEN
        ALTER TABLE applicants RENAME COLUMN password_hash TO "passwordHash";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='email_verified') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='emailVerified') THEN
        ALTER TABLE applicants RENAME COLUMN email_verified TO "emailVerified";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='email_verification_token') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='emailVerificationToken') THEN
        ALTER TABLE applicants RENAME COLUMN email_verification_token TO "emailVerificationToken";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='reset_token') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='resetToken') THEN
        ALTER TABLE applicants RENAME COLUMN reset_token TO "resetToken";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='reset_token_expires') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='resetTokenExpires') THEN
        ALTER TABLE applicants RENAME COLUMN reset_token_expires TO "resetTokenExpires";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='last_login') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='lastLogin') THEN
        ALTER TABLE applicants RENAME COLUMN last_login TO "lastLogin";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='createdAt') THEN
        ALTER TABLE applicants RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='updated_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applicants' AND column_name='updatedAt') THEN
        ALTER TABLE applicants RENAME COLUMN updated_at TO "updatedAt";
    END IF;

    -- Applications table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='applicant_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='applicantId') THEN
        ALTER TABLE applications RENAME COLUMN applicant_id TO "applicantId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='application_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='applicationId') THEN
        ALTER TABLE applications RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='current_step') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='currentStep') THEN
        ALTER TABLE applications RENAME COLUMN current_step TO "currentStep";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='sub_category') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='subCategory') THEN
        ALTER TABLE applications RENAME COLUMN sub_category TO "subCategory";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='preferred_region') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='preferredRegion') THEN
        ALTER TABLE applications RENAME COLUMN preferred_region TO "preferredRegion";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='alternate_region') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='alternateRegion') THEN
        ALTER TABLE applications RENAME COLUMN alternate_region TO "alternateRegion";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='category_details') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='categoryDetails') THEN
        ALTER TABLE applications RENAME COLUMN category_details TO "categoryDetails";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='declaration_date') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='declarationDate') THEN
        ALTER TABLE applications RENAME COLUMN declaration_date TO "declarationDate";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='reviewed_by') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='reviewedBy') THEN
        ALTER TABLE applications RENAME COLUMN reviewed_by TO "reviewedBy";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='reviewed_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='reviewedAt') THEN
        ALTER TABLE applications RENAME COLUMN reviewed_at TO "reviewedAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='review_comments') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='reviewComments') THEN
        ALTER TABLE applications RENAME COLUMN review_comments TO "reviewComments";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='rejection_reason') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='rejectionReason') THEN
        ALTER TABLE applications RENAME COLUMN rejection_reason TO "rejectionReason";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='required_documents') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='requiredDocuments') THEN
        ALTER TABLE applications RENAME COLUMN required_documents TO "requiredDocuments";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='document_request_message') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='documentRequestMessage') THEN
        ALTER TABLE applications RENAME COLUMN document_request_message TO "documentRequestMessage";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='submitted_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='submittedAt') THEN
        ALTER TABLE applications RENAME COLUMN submitted_at TO "submittedAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='createdAt') THEN
        ALTER TABLE applications RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='updated_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='updatedAt') THEN
        ALTER TABLE applications RENAME COLUMN updated_at TO "updatedAt";
    END IF;

    -- Personal Info table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='application_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='applicationId') THEN
        ALTER TABLE personal_info RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='first_name') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='firstName') THEN
        ALTER TABLE personal_info RENAME COLUMN first_name TO "firstName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='last_name') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='lastName') THEN
        ALTER TABLE personal_info RENAME COLUMN last_name TO "lastName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='middle_name') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='middleName') THEN
        ALTER TABLE personal_info RENAME COLUMN middle_name TO "middleName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='date_of_birth') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='dateOfBirth') THEN
        ALTER TABLE personal_info RENAME COLUMN date_of_birth TO "dateOfBirth";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='place_of_birth') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='placeOfBirth') THEN
        ALTER TABLE personal_info RENAME COLUMN place_of_birth TO "placeOfBirth";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='region_of_origin') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='regionOfOrigin') THEN
        ALTER TABLE personal_info RENAME COLUMN region_of_origin TO "regionOfOrigin";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='residential_address') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='residentialAddress') THEN
        ALTER TABLE personal_info RENAME COLUMN residential_address TO "residentialAddress";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='digital_address') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='digitalAddress') THEN
        ALTER TABLE personal_info RENAME COLUMN digital_address TO "digitalAddress";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='marital_status') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='maritalStatus') THEN
        ALTER TABLE personal_info RENAME COLUMN marital_status TO "maritalStatus";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='ghana_card_number') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='ghanaCardNumber') THEN
        ALTER TABLE personal_info RENAME COLUMN ghana_card_number TO "ghanaCardNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='screening_center') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='screeningCenter') THEN
        ALTER TABLE personal_info RENAME COLUMN screening_center TO "screeningCenter";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='createdAt') THEN
        ALTER TABLE personal_info RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='updated_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='personal_info' AND column_name='updatedAt') THEN
        ALTER TABLE personal_info RENAME COLUMN updated_at TO "updatedAt";
    END IF;

    -- Contact Info table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='application_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='applicationId') THEN
        ALTER TABLE contact_info RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='phone_number') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='phoneNumber') THEN
        ALTER TABLE contact_info RENAME COLUMN phone_number TO "phoneNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='alternate_phone') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='alternatePhone') THEN
        ALTER TABLE contact_info RENAME COLUMN alternate_phone TO "alternatePhone";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='alt_phone_number') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='altPhoneNumber') THEN
        ALTER TABLE contact_info RENAME COLUMN alt_phone_number TO "altPhoneNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='residential_address') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='residentialAddress') THEN
        ALTER TABLE contact_info RENAME COLUMN residential_address TO "residentialAddress";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='postal_address') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='postalAddress') THEN
        ALTER TABLE contact_info RENAME COLUMN postal_address TO "postalAddress";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='digital_address') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='digitalAddress') THEN
        ALTER TABLE contact_info RENAME COLUMN digital_address TO "digitalAddress";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='emergency_contact_name') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='emergencyContactName') THEN
        ALTER TABLE contact_info RENAME COLUMN emergency_contact_name TO "emergencyContactName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='emergency_contact_phone') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='emergencyContactPhone') THEN
        ALTER TABLE contact_info RENAME COLUMN emergency_contact_phone TO "emergencyContactPhone";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='emergency_contact_relation') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='emergencyContactRelation') THEN
        ALTER TABLE contact_info RENAME COLUMN emergency_contact_relation TO "emergencyContactRelation";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='createdAt') THEN
        ALTER TABLE contact_info RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='updated_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contact_info' AND column_name='updatedAt') THEN
        ALTER TABLE contact_info RENAME COLUMN updated_at TO "updatedAt";
    END IF;

    -- Physical Attributes table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='application_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='applicationId') THEN
        ALTER TABLE physical_attributes RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='height_cm') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='heightCm') THEN
        ALTER TABLE physical_attributes RENAME COLUMN height_cm TO "heightCm";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='weight_kg') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='weightKg') THEN
        ALTER TABLE physical_attributes RENAME COLUMN weight_kg TO "weightKg";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='eye_color') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='eyeColor') THEN
        ALTER TABLE physical_attributes RENAME COLUMN eye_color TO "eyeColor";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='hair_color') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='hairColor') THEN
        ALTER TABLE physical_attributes RENAME COLUMN hair_color TO "hairColor";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='body_marks') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='bodyMarks') THEN
        ALTER TABLE physical_attributes RENAME COLUMN body_marks TO "bodyMarks";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='blood_group') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='bloodGroup') THEN
        ALTER TABLE physical_attributes RENAME COLUMN blood_group TO "bloodGroup";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='has_disability') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='hasDisability') THEN
        ALTER TABLE physical_attributes RENAME COLUMN has_disability TO "hasDisability";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='disability_details') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='disabilityDetails') THEN
        ALTER TABLE physical_attributes RENAME COLUMN disability_details TO "disabilityDetails";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='createdAt') THEN
        ALTER TABLE physical_attributes RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='updated_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='physical_attributes' AND column_name='updatedAt') THEN
        ALTER TABLE physical_attributes RENAME COLUMN updated_at TO "updatedAt";
    END IF;

    -- Education table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='application_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='applicationId') THEN
        ALTER TABLE education RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='has_wassce') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='hasWassce') THEN
        ALTER TABLE education RENAME COLUMN has_wassce TO "hasWassce";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='has_novdec') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='hasNovDec') THEN
        ALTER TABLE education RENAME COLUMN has_novdec TO "hasNovDec";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='has_tertiary') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='hasTertiary') THEN
        ALTER TABLE education RENAME COLUMN has_tertiary TO "hasTertiary";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='has_professional_cert') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='hasProfessionalCert') THEN
        ALTER TABLE education RENAME COLUMN has_professional_cert TO "hasProfessionalCert";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='has_completed_national_service') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='hasCompletedNationalService') THEN
        ALTER TABLE education RENAME COLUMN has_completed_national_service TO "hasCompletedNationalService";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='createdAt') THEN
        ALTER TABLE education RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='updated_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='education' AND column_name='updatedAt') THEN
        ALTER TABLE education RENAME COLUMN updated_at TO "updatedAt";
    END IF;

    -- BECE Results
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bece_results' AND column_name='application_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bece_results' AND column_name='applicationId') THEN
        ALTER TABLE bece_results RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bece_results' AND column_name='school_name') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bece_results' AND column_name='schoolName') THEN
        ALTER TABLE bece_results RENAME COLUMN school_name TO "schoolName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bece_results' AND column_name='completion_year') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bece_results' AND column_name='completionYear') THEN
        ALTER TABLE bece_results RENAME COLUMN completion_year TO "completionYear";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bece_results' AND column_name='index_number') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bece_results' AND column_name='indexNumber') THEN
        ALTER TABLE bece_results RENAME COLUMN index_number TO "indexNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bece_results' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bece_results' AND column_name='createdAt') THEN
        ALTER TABLE bece_results RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bece_results' AND column_name='updated_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bece_results' AND column_name='updatedAt') THEN
        ALTER TABLE bece_results RENAME COLUMN updated_at TO "updatedAt";
    END IF;

    -- WASSCE Results
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wassce_results' AND column_name='application_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wassce_results' AND column_name='applicationId') THEN
        ALTER TABLE wassce_results RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wassce_results' AND column_name='is_novdec') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wassce_results' AND column_name='isNovdec') THEN
        ALTER TABLE wassce_results RENAME COLUMN is_novdec TO "isNovdec";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wassce_results' AND column_name='school_name') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wassce_results' AND column_name='schoolName') THEN
        ALTER TABLE wassce_results RENAME COLUMN school_name TO "schoolName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wassce_results' AND column_name='completion_year') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wassce_results' AND column_name='completionYear') THEN
        ALTER TABLE wassce_results RENAME COLUMN completion_year TO "completionYear";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wassce_results' AND column_name='index_number') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wassce_results' AND column_name='indexNumber') THEN
        ALTER TABLE wassce_results RENAME COLUMN index_number TO "indexNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wassce_results' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wassce_results' AND column_name='createdAt') THEN
        ALTER TABLE wassce_results RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wassce_results' AND column_name='updated_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wassce_results' AND column_name='updatedAt') THEN
        ALTER TABLE wassce_results RENAME COLUMN updated_at TO "updatedAt";
    END IF;

    -- Tertiary Education
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='application_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='applicationId') THEN
        ALTER TABLE tertiary_education RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='institution_name') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='institutionName') THEN
        ALTER TABLE tertiary_education RENAME COLUMN institution_name TO "institutionName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='course_of_study') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='courseOfStudy') THEN
        ALTER TABLE tertiary_education RENAME COLUMN course_of_study TO "courseOfStudy";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='class_obtained') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='classObtained') THEN
        ALTER TABLE tertiary_education RENAME COLUMN class_obtained TO "classObtained";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='completion_year') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='completionYear') THEN
        ALTER TABLE tertiary_education RENAME COLUMN completion_year TO "completionYear";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='certificate_number') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='certificateNumber') THEN
        ALTER TABLE tertiary_education RENAME COLUMN certificate_number TO "certificateNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='national_service_year') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='nationalServiceYear') THEN
        ALTER TABLE tertiary_education RENAME COLUMN national_service_year TO "nationalServiceYear";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='national_service_number') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='nationalServiceNumber') THEN
        ALTER TABLE tertiary_education RENAME COLUMN national_service_number TO "nationalServiceNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='createdAt') THEN
        ALTER TABLE tertiary_education RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='updated_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tertiary_education' AND column_name='updatedAt') THEN
        ALTER TABLE tertiary_education RENAME COLUMN updated_at TO "updatedAt";
    END IF;

    -- Employment History
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='application_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='applicationId') THEN
        ALTER TABLE employment_history RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='employer_name') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='employerName') THEN
        ALTER TABLE employment_history RENAME COLUMN employer_name TO "employerName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='position_held') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='positionHeld') THEN
        ALTER TABLE employment_history RENAME COLUMN position_held TO "positionHeld";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='date_from') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='dateFrom') THEN
        ALTER TABLE employment_history RENAME COLUMN date_from TO "dateFrom";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='date_to') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='dateTo') THEN
        ALTER TABLE employment_history RENAME COLUMN date_to TO "dateTo";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='reason_for_leaving') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='reasonForLeaving') THEN
        ALTER TABLE employment_history RENAME COLUMN reason_for_leaving TO "reasonForLeaving";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='createdAt') THEN
        ALTER TABLE employment_history RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='updated_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employment_history' AND column_name='updatedAt') THEN
        ALTER TABLE employment_history RENAME COLUMN updated_at TO "updatedAt";
    END IF;

    -- Documents
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='application_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='applicationId') THEN
        ALTER TABLE documents RENAME COLUMN application_id TO "applicationId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='document_type') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='documentType') THEN
        ALTER TABLE documents RENAME COLUMN document_type TO "documentType";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='original_name') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='originalName') THEN
        ALTER TABLE documents RENAME COLUMN original_name TO "originalName";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='file_path') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='filePath') THEN
        ALTER TABLE documents RENAME COLUMN file_path TO "filePath";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='verification_status') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='verificationStatus') THEN
        ALTER TABLE documents RENAME COLUMN verification_status TO "verificationStatus";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='mime_type') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='mimeType') THEN
        ALTER TABLE documents RENAME COLUMN mime_type TO "mimeType";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='file_size') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='fileSize') THEN
        ALTER TABLE documents RENAME COLUMN file_size TO "fileSize";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='verified_by') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='verifiedBy') THEN
        ALTER TABLE documents RENAME COLUMN verified_by TO "verifiedBy";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='verified_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='verifiedAt') THEN
        ALTER TABLE documents RENAME COLUMN verified_at TO "verifiedAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='createdAt') THEN
        ALTER TABLE documents RENAME COLUMN created_at TO "createdAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='updated_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='updatedAt') THEN
        ALTER TABLE documents RENAME COLUMN updated_at TO "updatedAt";
    END IF;

    -- Vouchers
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='phone_number') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='phoneNumber') THEN
        ALTER TABLE vouchers RENAME COLUMN phone_number TO "phoneNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='serial_number') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='serialNumber') THEN
        ALTER TABLE vouchers RENAME COLUMN serial_number TO "serialNumber";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='pin_code') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='pinCode') THEN
        ALTER TABLE vouchers RENAME COLUMN pin_code TO "pinCode";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='is_used') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='isUsed') THEN
        ALTER TABLE vouchers RENAME COLUMN is_used TO "isUsed";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='used_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='usedAt') THEN
        ALTER TABLE vouchers RENAME COLUMN used_at TO "usedAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='validated_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='validatedAt') THEN
        ALTER TABLE vouchers RENAME COLUMN validated_at TO "validatedAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='expires_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='expiresAt') THEN
        ALTER TABLE vouchers RENAME COLUMN expires_at TO "expiresAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='applicant_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='applicantId') THEN
        ALTER TABLE vouchers RENAME COLUMN applicant_id TO "applicantId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='generated_by') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='generatedBy') THEN
        ALTER TABLE vouchers RENAME COLUMN generated_by TO "generatedBy";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='deactivated_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='deactivatedAt') THEN
        ALTER TABLE vouchers RENAME COLUMN deactivated_at TO "deactivatedAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='deactivated_by') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='deactivatedBy') THEN
        ALTER TABLE vouchers RENAME COLUMN deactivated_by TO "deactivatedBy";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vouchers' AND column_name='createdAt') THEN
        ALTER TABLE vouchers RENAME COLUMN created_at TO "createdAt";
    END IF;

    -- Notifications
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='user_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='userId') THEN
        ALTER TABLE notifications RENAME COLUMN user_id TO "userId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='user_type') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='userType') THEN
        ALTER TABLE notifications RENAME COLUMN user_type TO "userType";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='is_read') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='isRead') THEN
        ALTER TABLE notifications RENAME COLUMN is_read TO "isRead";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='read_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='readAt') THEN
        ALTER TABLE notifications RENAME COLUMN read_at TO "readAt";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='createdAt') THEN
        ALTER TABLE notifications RENAME COLUMN created_at TO "createdAt";
    END IF;

    -- Audit Logs
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='entity_type') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='entityType') THEN
        ALTER TABLE audit_logs RENAME COLUMN entity_type TO "entityType";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='entity_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='entityId') THEN
        ALTER TABLE audit_logs RENAME COLUMN entity_id TO "entityId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='user_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='userId') THEN
        ALTER TABLE audit_logs RENAME COLUMN user_id TO "userId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='user_type') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='userType') THEN
        ALTER TABLE audit_logs RENAME COLUMN user_type TO "userType";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='ip_address') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='ipAddress') THEN
        ALTER TABLE audit_logs RENAME COLUMN ip_address TO "ipAddress";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='user_agent') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='userAgent') THEN
        ALTER TABLE audit_logs RENAME COLUMN user_agent TO "userAgent";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='createdAt') THEN
        ALTER TABLE audit_logs RENAME COLUMN created_at TO "createdAt";
    END IF;

    -- Regional Centers
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='regional_centers' AND column_name='region_code') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='regional_centers' AND column_name='regionCode') THEN
        ALTER TABLE regional_centers RENAME COLUMN region_code TO "regionCode";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='regional_centers' AND column_name='contact_info') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='regional_centers' AND column_name='contactInfo') THEN
        ALTER TABLE regional_centers RENAME COLUMN contact_info TO "contactInfo";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='regional_centers' AND column_name='is_active') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='regional_centers' AND column_name='isActive') THEN
        ALTER TABLE regional_centers RENAME COLUMN is_active TO "isActive";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='regional_centers' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='regional_centers' AND column_name='createdAt') THEN
        ALTER TABLE regional_centers RENAME COLUMN created_at TO "createdAt";
    END IF;

    -- Roles
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='roles' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='roles' AND column_name='createdAt') THEN
        ALTER TABLE roles RENAME COLUMN created_at TO "createdAt";
    END IF;

    -- Permissions
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='permissions' AND column_name='created_at') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='permissions' AND column_name='createdAt') THEN
        ALTER TABLE permissions RENAME COLUMN created_at TO "createdAt";
    END IF;

    -- Role Permissions
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='role_permissions' AND column_name='role_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='role_permissions' AND column_name='roleId') THEN
        ALTER TABLE role_permissions RENAME COLUMN role_id TO "roleId";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='role_permissions' AND column_name='permission_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='role_permissions' AND column_name='permissionId') THEN
        ALTER TABLE role_permissions RENAME COLUMN permission_id TO "permissionId";
    END IF;

END $$;

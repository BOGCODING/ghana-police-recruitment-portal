-- Migration to standardize document types to uppercase
UPDATE documents SET "documentType" = 'PASSPORT_PHOTO' WHERE "documentType" = 'passportPhoto';
UPDATE documents SET "documentType" = 'BIRTH_CERTIFICATE' WHERE "documentType" = 'birthCertificate';
UPDATE documents SET "documentType" = 'WASSCE_CERTIFICATE' WHERE "documentType" = 'wassceCertificate';
UPDATE documents SET "documentType" = 'GHANA_CARD' WHERE "documentType" = 'ghanaCard';
UPDATE documents SET "documentType" = 'TERTIARY_CERTIFICATE' WHERE "documentType" = 'tertiaryCertificate';
UPDATE documents SET "documentType" = 'PROFESSIONAL_CERT' WHERE "documentType" = 'professionalCert';
UPDATE documents SET "documentType" = 'NATIONAL_SERVICE' WHERE "documentType" = 'nationalService';

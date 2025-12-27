'use client';
import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useApplication } from '@/contexts/ApplicationContext';
import styles from './FormStep.module.css';

const REQUIRED_DOCUMENTS = [
  { key: 'passportPhoto', label: 'Passport Photo', accept: 'image/*', required: true },
  { key: 'birthCertificate', label: 'Birth Certificate', accept: 'image/*,application/pdf', required: true },
  { key: 'wassceCertificate', label: 'WASSCE Certificate', accept: 'image/*,application/pdf', required: true },
  { key: 'ghanaCard', label: 'Ghana Card (Front & Back)', accept: 'image/*,application/pdf', required: true },
];

const OPTIONAL_DOCUMENTS = [
  { key: 'tertiaryCertificate', label: 'Tertiary Certificate', accept: 'image/*,application/pdf' },
  { key: 'professionalCert', label: 'Professional Certificate', accept: 'image/*,application/pdf' },
  { key: 'nationalService', label: 'National Service Certificate', accept: 'image/*,application/pdf' },
];

export default function DocumentsForm() {
  const { formData, nextStep, prevStep, updateStepData, saving } = useApplication();
  const [documents, setDocuments] = useState({});
  const [uploading, setUploading] = useState({});
  const [errors, setErrors] = useState({});

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (formData.documents && Array.isArray(formData.documents)) {
      const docMap = {};
      formData.documents.forEach(doc => {
        docMap[doc.documentType] = doc;
      });
      setDocuments(docMap);
    }
  }, [formData.documents]);

  const getToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];
  };

  const uploadFile = async (file, documentType) => {
    setUploading(prev => ({ ...prev, [documentType]: true }));
    setErrors(prev => ({ ...prev, [documentType]: null }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
        credentials: 'include'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await res.json();
      const uploadedDoc = data.data;
      
      // Normalize snake_case response to camelCase for consistent state
      const normalizedDoc = {
        id: uploadedDoc.id,
        documentType: documentType,
        filename: uploadedDoc.filename,
        originalName: uploadedDoc.original_name || uploadedDoc.originalName,
        filePath: uploadedDoc.file_path || uploadedDoc.filePath,
        mimeType: uploadedDoc.mime_type || uploadedDoc.mimeType,
        fileSize: uploadedDoc.file_size || uploadedDoc.fileSize,
        url: uploadedDoc.url
      };

      setDocuments(prev => ({
        ...prev,
        [documentType]: normalizedDoc
      }));

      updateStepData('documents', Object.values({ ...documents, [documentType]: normalizedDoc }));
    } catch (error) {
      setErrors(prev => ({ ...prev, [documentType]: error.message }));
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const DocumentUploader = ({ docConfig }) => {
    const onDrop = useCallback((acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadFile(acceptedFiles[0], docConfig.key);
      }
    }, [docConfig.key]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: docConfig.accept.split(',').reduce((acc, type) => {
        if (type.includes('image')) acc['image/*'] = [];
        if (type.includes('pdf')) acc['application/pdf'] = [];
        return acc;
      }, {}),
      maxFiles: 1,
      maxSize: 5 * 1024 * 1024 // 5MB
    });

    const doc = documents[docConfig.key];
    const isUploading = uploading[docConfig.key];
    const error = errors[docConfig.key];

    return (
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.5rem', display: 'block' }}>
          {docConfig.label} {docConfig.required && '*'}
        </label>
        
        {doc ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            background: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '8px'
          }}>
            <span style={{ color: '#065f46', fontSize: '0.875rem' }}>
              ✓ {doc.originalName || doc.filename}
            </span>
            <button
              type="button"
              onClick={() => {
                const newDocs = { ...documents };
                delete newDocs[docConfig.key];
                setDocuments(newDocs);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            style={{
              padding: '1.5rem',
              border: `2px dashed ${isDragActive ? '#006B3F' : error ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragActive ? 'rgba(0, 107, 63, 0.05)' : '#fafafa',
              transition: 'all 0.2s'
            }}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <span style={{ color: '#6b7280' }}>Uploading...</span>
            ) : (
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {isDragActive ? 'Drop file here' : 'Click or drag file to upload'}
              </span>
            )}
          </div>
        )}
        
        {error && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{error}</span>}
      </div>
    );
  };

  const validate = () => {
    const newErrors = {};
    REQUIRED_DOCUMENTS.forEach(doc => {
      if (!documents[doc.key]) {
        newErrors[doc.key] = `${doc.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await nextStep('documents', Object.values(documents));
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <h2>Document Upload</h2>
        <p>Upload required documents (Max 5MB each, JPG/PNG/PDF)</p>
      </div>

      {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}

      <h3 style={{ fontSize: '1rem', color: 'var(--gray-700)', marginBottom: '1rem' }}>
        Required Documents
      </h3>
      {REQUIRED_DOCUMENTS.map(doc => (
        <DocumentUploader key={doc.key} docConfig={doc} />
      ))}

      <h3 style={{ fontSize: '1rem', color: 'var(--gray-700)', marginTop: '1.5rem', marginBottom: '1rem' }}>
        Optional Documents
      </h3>
      {OPTIONAL_DOCUMENTS.map(doc => (
        <DocumentUploader key={doc.key} docConfig={doc} />
      ))}

      <div className={styles.actions}>
        <button type="button" onClick={prevStep} className={styles.prevBtn}>← Back</button>
        <button type="submit" className={styles.nextBtn} disabled={saving}>
          {saving ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </form>
  );
}

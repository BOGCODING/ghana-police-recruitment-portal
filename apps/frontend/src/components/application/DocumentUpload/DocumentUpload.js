'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { useApplication } from '@/contexts/ApplicationContext';
import { useAuth } from '@/contexts/AuthContext';
import { getRequiredDocuments, getOptionalDocuments } from '@/config/categoryRequirements';
import styles from './DocumentUpload.module.css';
import { api } from '../../../utils/api';

export default function DocumentUpload() {
  const { formData, updateStepData } = useApplication();
  const { refetch } = useAuth();
  const [documents, setDocuments] = useState({});
  const [uploading, setUploading] = useState({});
  const [errors, setErrors] = useState({});

  // Get the selected category from form data
  const selectedCategory = formData.categoryDetails?.category || formData.category || '';
  const selectedSubCategory = formData.categoryDetails?.subCategory || formData.subCategory || '';

  // Compute required and optional documents based on category
  const requiredDocuments = useMemo(() => {
    return getRequiredDocuments(selectedCategory, selectedSubCategory);
  }, [selectedCategory, selectedSubCategory]);

  const optionalDocuments = useMemo(() => {
    return getOptionalDocuments(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    if (formData.documents && Array.isArray(formData.documents)) {
      const docMap = {};
      formData.documents.forEach(doc => {
        // Normalize PASSPORT_PHOTO (backend name) to passportPhoto (frontend config key)
        const type = (doc.documentType === 'PASSPORT_PHOTO' || doc.documentType === 'passportPhoto') 
          ? 'passportPhoto' 
          : doc.documentType;
        docMap[type] = {
          ...doc,
          documentType: type
        };
      });
      setDocuments(docMap);
    }
  }, [formData.documents]);


  const uploadFile = async (file, documentType) => {
    setUploading(prev => ({ ...prev, [documentType]: true }));
    setErrors(prev => ({ ...prev, [documentType]: null }));

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('documentType', documentType);

      const data = await api('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

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

      const updatedDocs = { ...documents, [documentType]: normalizedDoc };
      setDocuments(updatedDocs);
      updateStepData('documents', Object.values(updatedDocs));

      // Trigger user refetch if this is a passport photo
      if (documentType === 'PASSPORT_PHOTO' || documentType === 'passportPhoto') {
        await refetch();
      }
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
      <div className={styles.uploaderWrapper}>
        <label className={styles.label}>
          {docConfig.label} {docConfig.required && '*'}
        </label>
        
        {doc ? (
          <div className={styles.uploadSuccess}>
            <span className={styles.fileName}>
              ✓ {doc.originalName || doc.filename}
            </span>
            <button
              type="button"
              onClick={() => {
                const newDocs = { ...documents };
                delete newDocs[docConfig.key];
                setDocuments(newDocs);
                updateStepData('documents', Object.values(newDocs));
              }}
              className={styles.removeBtn}
            >
              Remove
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''} ${error ? styles.error : ''}`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <span className={styles.placeholder}>Uploading...</span>
            ) : (
              <span className={styles.placeholder}>
                {isDragActive ? 'Drop file here' : 'Click or drag file to upload'}
              </span>
            )}
          </div>
        )}
        
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Show category-specific notice if category is selected */}
      {selectedCategory && (
        <div className={styles.categoryNotice}>
          <p>📋 Showing document requirements for: <strong>{selectedCategory.replace(/_/g, ' ')}</strong></p>
        </div>
      )}
      
      <h3 className={styles.sectionTitle}>Required Documents</h3>
      <div className={styles.grid}>
        {requiredDocuments.map(doc => (
          <DocumentUploader key={doc.key} docConfig={doc} />
        ))}
      </div>

      {optionalDocuments.length > 0 && (
        <>
          <h3 className={styles.sectionTitle}>Optional Documents</h3>
          <div className={styles.grid}>
            {optionalDocuments.map(doc => (
              <DocumentUploader key={doc.key} docConfig={doc} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

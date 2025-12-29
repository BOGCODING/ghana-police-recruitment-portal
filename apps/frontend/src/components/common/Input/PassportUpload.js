'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import Image from 'next/image';
import { useApplication } from '@/contexts/ApplicationContext';
import styles from './PassportUpload.module.css';
import { api } from '../../../utils/api';
import getCroppedImg from '../../../utils/cropImage';

export default function PassportUpload({ onChange, value, error }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value?.url || value?.filePath || null);
  const [localError, setLocalError] = useState(null);
  
  // Cropping State
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { updateStepData, formData } = useApplication();

  useEffect(() => {
    // Check if passport exists in documents
    if (!preview && formData.documents) {
        const passport = formData.documents.find(d => d.documentType === 'PASSPORT_PHOTO' || d.documentType === 'passportPhoto');
        if (passport) {
            setPreview(passport.url);
            if (onChange) onChange(passport);
        }
    }
  }, [formData.documents, preview, onChange]);


  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create object URL for cropping
    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);
    setShowModal(true);
    setLocalError(null);
  }, []);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      setUploading(true);
      setShowModal(false);

      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'passport_photo.jpg', { type: 'image/jpeg' });

      const uploadData = new FormData();
      uploadData.append('file', croppedFile);
      uploadData.append('documentType', 'PASSPORT_PHOTO');
      
      // Update preview immediately
      const objectUrl = URL.createObjectURL(croppedBlob);
      setPreview(objectUrl);

      const data = await api('/api/upload', {
        method: 'POST',
        body: uploadData
      });

      const uploadedDoc = data.data;

       // Normalize snake_case response to camelCase for consistent state
       const normalizedDoc = {
        id: uploadedDoc.id,
        documentType: 'PASSPORT_PHOTO',
        filename: uploadedDoc.filename,
        originalName: uploadedDoc.original_name || uploadedDoc.originalName,
        filePath: uploadedDoc.file_path || uploadedDoc.filePath,
        mimeType: uploadedDoc.mime_type || uploadedDoc.mimeType,
        fileSize: uploadedDoc.file_size || uploadedDoc.fileSize,
        url: uploadedDoc.url
      };

      // Update global documents state
      const existingDocs = formData.documents || [];
      const otherDocs = existingDocs.filter(d => d.documentType !== 'PASSPORT_PHOTO' && d.documentType !== 'passportPhoto');
      updateStepData('documents', [...otherDocs, normalizedDoc]);

      if (onChange) {
        onChange(normalizedDoc);
      }

    } catch (err) {
      console.error(err);
      setLocalError('Failed to upload image. Please try again.');
      setPreview(null);
    } finally {
      setUploading(false);
      // Clean up object URL to avoid memory leaks
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
        setImageSrc(null);
      }
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setImageSrc(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className={styles.container}>
      <label className={styles.label}>Passport Picture *</label>
      
      {/* Upload Box */}
      <div 
        {...getRootProps()} 
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${error || localError ? styles.error : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className={styles.loading}>Uploading...</div>
        ) : preview ? (
          <div className={styles.previewContainer}>
            <Image 
              src={preview} 
              alt="Passport Preview" 
              width={150} 
              height={150} 
              className={styles.previewImage}
              unoptimized
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.overlay}>
              <span>Click to change</span>
            </div>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.icon}>📷</div>
            <p>Click or drag to upload</p>
            <span className={styles.hint}>JPG, PNG up to 5MB</span>
          </div>
        )}
      </div>
      {(error || localError) && <span className={styles.errorMessage}>{error || localError}</span>}

      {/* Cropping Modal */}
      {showModal && imageSrc && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>Adjust Photo</div>
            
            <div className={styles.cropContainer}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className={styles.controls}>
              <label className={styles.sliderLabel}>Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className={styles.zoomRange}
              />
            </div>

            <div className={styles.buttonGroup}>
              <button onClick={handleCancel} className={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={handleCropSave} className={styles.saveButton}>
                Save & Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

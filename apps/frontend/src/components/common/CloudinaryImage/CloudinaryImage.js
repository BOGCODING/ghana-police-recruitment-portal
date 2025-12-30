import React from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { AdvancedImage, placeholder, lazyload } from '@cloudinary/react';
import styles from './CloudinaryImage.module.css';

// Initialize Cloudinary instance
// We try to get cloud name from env, but handle case where it's missing gracefully
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ghana-police-recruitment'; // fallback or undefined

const cld = new Cloudinary({
  cloud: {
    cloudName
  }
});

/**
 * CloudinaryImage Component
 * 
 * Renders an optimized image using Cloudinary SDK if possible, 
 * otherwise falls back to a standard <img> tag.
 * 
 * @param {string} src - Cloudinary Public ID or regular URL
 * @param {string} alt - Alt text
 * @param {number} width - Desired width
 * @param {number} height - Desired height
 * @param {string} className - CSS Class
 * @param {object} style - Inline styles
 * @param {boolean} priority - If true, disables lazy loading
 */
const CloudinaryImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  style,
  priority = false,
  ...props 
}) => {
  // 1. If no source, render nothing or placeholder
  if (!src) return <div className={`${styles.placeholder} ${className}`} style={{ width, height, ...style }} />;

  // 2. Check if it's a Cloudinary ID or a full URL
  const isUrl = src.startsWith('http') || src.startsWith('/') || src.startsWith('blob:') || src.startsWith('data:');
  
  // 3. Check if we have a cloud name configured
  const hasCloudConfig = !!cloudName;

  // CASE A: It's a regular URL (local upload or external) OR we don't have cloud config
  if (isUrl || !hasCloudConfig) {
    return (
      <img 
        src={src} 
        alt={alt} 
        width={width} 
        height={height}
        className={`${styles.image} ${className}`}
        loading={priority ? 'eager' : 'lazy'}
        style={style}
        {...props}
      />
    );
  }

  // CASE B: It's a Cloudinary Public ID - OPTIMIZE IT!
  const myImage = cld.image(src);

  // Apply transformations
  if (width) {
    myImage.resize(auto().width(width));
  } else {
    myImage.resize(auto());
  }
  
  // Always optimize format and quality
  myImage.format('auto').quality('auto');

  // Plugins
  const plugins = [];
  if (!priority) {
    plugins.push(lazyload());
    plugins.push(placeholder({ mode: 'blur' }));
  }
  // plugins.push(responsive({ steps: 200 })); // Optional: responsive sizing

  return (
    <div className={`${styles.wrapper} ${className}`} style={{ width: width || '100%', height: height || 'auto', ...style }}>
      <AdvancedImage 
        cldImg={myImage} 
        plugins={plugins}
        alt={alt}
        className={styles.advancedImage}
        {...props}
      />
    </div>
  );
};

export default CloudinaryImage;

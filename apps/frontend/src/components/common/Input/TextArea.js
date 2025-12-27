import { forwardRef } from 'react';
import styles from './Input.module.css';

const TextArea = forwardRef(({ label, error, ...props }, ref) => {
  const handleInputChange = (e) => {
    if (typeof e.target.value === 'string') {
      e.target.value = e.target.value.toUpperCase();
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea 
        ref={ref}
        className={`${styles.input} ${styles.textarea} ${error ? styles.error : ''}`} 
        {...props} 
        onChange={handleInputChange}
        style={{ 
          textTransform: 'uppercase',
          ...props.style 
        }}
      />
      {error && (
        <span className={styles.errorMessage}>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </span>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;

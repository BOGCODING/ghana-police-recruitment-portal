import { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(({ label, error, ...props }, ref) => {
  const isTextType = !['email', 'password', 'number', 'date', 'tel'].includes(props.type);
  
  const handleInputChange = (e) => {
    if (isTextType && typeof e.target.value === 'string') {
      e.target.value = e.target.value.toUpperCase();
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <input 
        ref={ref}
        className={`${styles.input} ${error ? styles.error : ''}`} 
        {...props} 
        onChange={handleInputChange}
        style={{ 
          textTransform: isTextType ? 'uppercase' : 'none',
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

Input.displayName = 'Input';

export default Input;

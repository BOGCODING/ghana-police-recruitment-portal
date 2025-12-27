import { forwardRef } from 'react';
import styles from './Input.module.css';

const DatePicker = forwardRef(({ label, error, ...props }, ref) => {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <input 
        ref={ref}
        type="date"
        className={`${styles.input} ${error ? styles.error : ''}`} 
        {...props} 
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;

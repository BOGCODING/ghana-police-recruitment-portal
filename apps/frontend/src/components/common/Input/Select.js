import { forwardRef } from 'react';
import styles from './Input.module.css';

const Select = forwardRef(({ label, error, options = [], ...props }, ref) => {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <select 
        ref={ref}
        className={`${styles.input} ${error ? styles.error : ''}`} 
        {...props}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className={styles.errorMessage}>
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;

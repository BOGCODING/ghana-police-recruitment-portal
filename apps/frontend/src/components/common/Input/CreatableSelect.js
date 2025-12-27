import { Controller, useFormContext } from 'react-hook-form';
import CreatableSelect from 'react-select/creatable';
import styles from './Input.module.css';

const CustomCreatableSelect = ({ name, label, options, placeholder, rules }) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: error ? '#ef4444' : state.isFocused ? '#1d4ed8' : '#e2e8f0', // red-500, blue-700, slate-200
      borderRadius: '0.375rem', // rounded-md
      padding: '2px',
      boxShadow: state.isFocused ? '0 0 0 1px #1d4ed8' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#1d4ed8' : '#cbd5e1', // slate-300
      }
    }),
    input: (provided) => ({
      ...provided,
      color: '#1e293b', // slate-800
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#1d4ed8' : state.isFocused ? '#eff6ff' : 'white', // blue-700, blue-50
      color: state.isSelected ? 'white' : '#1e293b',
      cursor: 'pointer',
      ':active': {
        backgroundColor: '#1d4ed8', // blue-700
      }
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#94a3b8', // slate-400
    }),
  };

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, value, ref, onBlur } }) => {
          // Handle initial value which might be a string from backend
          const selectedOption = value ? { label: value, value: value } : null;

          return (
            <CreatableSelect
              inputRef={ref}
              options={options}
              value={selectedOption}
              onChange={(newValue) => {
                if (newValue) {
                  // If it's a created option (string) or selected option (object)
                  onChange(newValue.value || newValue);
                } else {
                  onChange('');
                }
              }}
              onBlur={onBlur}
              placeholder={placeholder} // Use the prop passed down or default
              isClearable
              styles={customStyles}
              formatCreateLabel={(inputValue) => `Use "${inputValue}"`}
              className={styles.reactSelectContainer}
              classNamePrefix="react-select"
            />
          );
        }}
      />
      {error && (
        <span className={styles.errorMessage}>
          {error.message}
        </span>
      )}
    </div>
  );
};

export default CustomCreatableSelect;

import styles from './SearchBar.module.css';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>🔍</span>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

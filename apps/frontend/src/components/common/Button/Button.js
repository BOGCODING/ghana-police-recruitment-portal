import styles from './Button.module.css';

export default function Button({ children, variant = 'primary', size = 'medium', ...props }) {
  return (
    <button className={`${styles.button} ${styles[variant]} ${styles[size]}`} {...props}>
      {children}
    </button>
  );
}

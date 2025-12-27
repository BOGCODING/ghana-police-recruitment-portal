import styles from './Badge.module.css';

export default function Badge({ children, variant = 'primary', ...props }) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`} {...props}>
      {children}
    </span>
  );
}

import styles from './Loader.module.css';

export default function Loader({ size = 'medium', color = 'primary' }) {
  return (
    <div className={`${styles.loader} ${styles[size]} ${styles[color]}`}>
      <div className={styles.spinner}></div>
    </div>
  );
}

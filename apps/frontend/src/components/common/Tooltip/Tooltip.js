import styles from './Tooltip.module.css';

export default function Tooltip({ text, children }) {
  return (
    <div className={styles.container}>
      {children}
      <span className={styles.tooltip}>{text}</span>
    </div>
  );
}

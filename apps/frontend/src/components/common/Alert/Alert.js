import styles from './Alert.module.css';
import { useState } from 'react';

export default function Alert({ type = 'info', message, dismissible = false }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className={`${styles.alert} ${styles[type]}`}>
      <span>{message}</span>
      {dismissible && (
        <button className={styles.closeBtn} onClick={() => setVisible(false)}>
          &times;
        </button>
      )}
    </div>
  );
}

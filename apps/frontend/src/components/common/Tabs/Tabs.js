import styles from './Tabs.module.css';
import { useState } from 'react';

export default function Tabs({ tabs = [], defaultActive = 0 }) {
  const [active, setActive] = useState(defaultActive);

  return (
    <div className={styles.tabs}>
      <div className={styles.list}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`${styles.tab} ${active === index ? styles.active : ''}`}
            onClick={() => setActive(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.panel}>
        {tabs[active] && tabs[active].content}
      </div>
    </div>
  );
}

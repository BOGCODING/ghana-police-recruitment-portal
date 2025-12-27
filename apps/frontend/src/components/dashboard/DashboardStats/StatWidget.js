import styles from './DashboardStats.module.css';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

function CountUp({ value }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

export default function StatWidget({ title, value, icon, status }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'warning': return styles.warning;
      case 'active': return styles.active;
      case 'completed': return styles.completed;
      case 'neutral': return styles.neutral;
      case 'REJECTED': return styles.rejected;
      case 'APPROVED': return styles.approved;
      case 'SUBMITTED': return styles.submitted;
      default: return '';
    }
  };

  const isNumber = typeof value === 'number';

  return (
    <motion.div 
      className={`${styles.widget} ${getStatusClass(status)}`}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div 
        className={styles.icon}
        initial={{ rotate: -10, scale: 0.8 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {icon}
      </motion.div>
      <div className={styles.content}>
        <h3>
          {isNumber ? <CountUp value={value} /> : value}
        </h3>
        <p>{title}</p>
      </div>
    </motion.div>
  );
}

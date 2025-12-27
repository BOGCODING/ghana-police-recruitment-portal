import styles from './Card.module.css';

export function Card({ children, className = '' }) {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
}

export function CardHeader({ children }) {
  return <div className={styles.header}>{children}</div>;
}

export function CardBody({ children }) {
  return <div className={styles.body}>{children}</div>;
}

export function CardFooter({ children }) {
  return <div className={styles.footer}>{children}</div>;
}

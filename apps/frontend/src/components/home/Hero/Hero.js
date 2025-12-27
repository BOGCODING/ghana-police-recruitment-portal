import styles from './Hero.module.css';
import Link from 'next/link';
import Button from '../../common/Button/Button';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1>Join the Ghana Police Service</h1>
        <p>Service with Integrity. Apply now to serve your country.</p>
        <div className={styles.actions}>
          <Link href="/requirements">
            <Button size="large">Check Requirements</Button>
          </Link>
          <Link href="/voucher/purchase">
            <Button variant="secondary" size="large">Buy Voucher</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

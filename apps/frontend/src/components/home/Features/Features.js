import styles from './Features.module.css';

export default function Features() {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <h2>Why Join Us?</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Professional Growth</h3>
            <p>Access to world-class training and career development.</p>
          </div>
          <div className={styles.card}>
            <h3>Serve Your Country</h3>
            <p>Be a pillar of safety and integrity in your community.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

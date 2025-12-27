import styles from './ActivityFeed.module.css';

export default function ActivityFeed({ activities }) {
  if (!activities) return null;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Recent Activity</h3>
      <div className={styles.feed}>
        {activities.map((activity) => (
          <div key={activity.id} className={styles.item}>
            <div className={styles.iconWrapper}>
               <span className={styles.dot}></span>
               <div className={styles.line}></div>
            </div>
            <div className={styles.content}>
              <p className={styles.message}>
                <span className={styles.user}>{activity.user}</span> {activity.action} <span className={styles.target}>{activity.target}</span>
              </p>
              <span className={styles.time}>{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

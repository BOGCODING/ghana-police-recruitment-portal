import Link from 'next/link';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiExternalLink } from 'react-icons/fi';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandColumn}>
            <div className={styles.logoAlt}>
              <h3>Ghana Police Service</h3>
            </div>
            <p className={styles.tagline}>Service with Integrity, Excellence and Professionalism.</p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialIcon} aria-label="Facebook"><FiFacebook /></a>
              <a href="#" className={styles.socialIcon} aria-label="Twitter"><FiTwitter /></a>
              <a href="#" className={styles.socialIcon} aria-label="Instagram"><FiInstagram /></a>
              <a href="#" className={styles.socialIcon} aria-label="YouTube"><FiYoutube /></a>
            </div>
          </div>
          
          <div className={styles.linkColumn}>
            <h4>Quick Links</h4>
            <Link href="/about">About GPS</Link>
            <Link href="/requirements">Recruitment Requirements</Link>
            <Link href="/regional-centers">Regional Centers</Link>
            <Link href="/faq">Frequently Asked Questions</Link>
          </div>

          <div className={styles.linkColumn}>
            <h4>Support</h4>
            <Link href="/contact">Contact Support</Link>
            <Link href="/voucher/purchase">Buy Recruitment Voucher</Link>
            <a href="https://boglogodwin10@gmail.com" target="_blank" rel="noopener noreferrer" className={styles.extLink}>
              GPS Official Website <FiExternalLink size={14} />
            </a>
          </div>

          <div className={styles.linkColumn}>
            <h4>Legal</h4>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.copy}>
            &copy; {new Date().getFullYear()} Ghana Police Service. All rights reserved.
          </div>
          <div className={styles.securitySeal}>
            Secure Portal &bull; Encrypted Communication
          </div>
        </div>
      </div>
    </footer>
  );
}

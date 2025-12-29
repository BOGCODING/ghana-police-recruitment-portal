import Header from '@/components/common/Header/Header';
import Footer from '@/components/common/Footer/Footer';
import PageTransition from '@/components/animations/PageTransition';
import styles from './layout.module.css';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://recruitment.police.gov.gh'),
  // ... existing metadata ...
  title: {
    template: '%s | Ghana Police Recruitment',
    default: 'Ghana Police Service Recruitment Portal',
  },
  description: 'Apply for the Ghana Police Service recruitment. Join the service with integrity and professionalism.',
  openGraph: {
    title: 'Ghana Police Recruitment Portal',
    description: 'Official recruitment portal for the Ghana Police Service.',
    url: 'https://recruitment.police.gov.gh',
    siteName: 'Ghana Police Service',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_GH',
    type: 'website',
  },
};

export default function PublicLayout({ children }) {
  return (
    <div className={styles.publicLayout}>
      <Header />
      <main className={styles.mainContent}>
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}

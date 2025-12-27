'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import { applicationService } from '@/services/applicationService';

export default function PrintApplication() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const data = await applicationService.getOne(id);
        if (data.success) {
          setApp(data.data);
          // Auto-print after a short delay to allow images to load
          setTimeout(() => {
            window.print();
          }, 1500);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id, API_URL]);

  if (loading) return <div className={styles.loading}>Preparing document...</div>;
  if (!app) return <div className={styles.error}>Application not found.</div>;

  return (
    <div className={styles.printContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <Image src="/images/logo.png" alt="Logo" width={60} height={60} className={styles.logo} />
          <div className={styles.titleSection}>
            <h1>Ghana Police Service</h1>
            <h2>Recruitment Application Summary</h2>
          </div>
        </div>
        <div className={styles.metaSection}>
          <div className={styles.metaItem}>
            <span>Application ID:</span>
            <strong>{app.applicationId}</strong>
          </div>
          <div className={styles.metaItem}>
            <span>Date:</span>
            <strong>{new Date().toLocaleDateString()}</strong>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Applicant Profile */}
        <section className={styles.profileSection}>
          <div className={styles.photoContainer}>
            {app.passportPhoto ? (
              <Image 
                src={`${API_URL}/uploads/${app.passportPhoto.filePath}`} 
                alt="Passport Photo" 
                width={150} 
                height={150} 
                className={styles.passportPhoto}
              />
            ) : (
              <div className={styles.noPhoto}>No Photo</div>
            )}
            <div className={styles.statusBox}>
              <span className={styles.statusLabel}>Current Status</span>
              <span className={styles.statusValue}>{app.status.replace(/_/g, ' ')}</span>
            </div>
          </div>
          
          <div className={styles.personalDetails}>
            <h3>Personal Information</h3>
            <div className={styles.grid}>
              <div className={styles.item}>
                <label>Full Name:</label>
                <span>{app.personalInfo?.firstName} {app.personalInfo?.middleName} {app.personalInfo?.lastName}</span>
              </div>
              <div className={styles.item}>
                <label>Date of Birth:</label>
                <span>{app.personalInfo?.dateOfBirth ? new Date(app.personalInfo.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className={styles.item}>
                <label>Gender:</label>
                <span>{app.personalInfo?.gender}</span>
              </div>
              <div className={styles.item}>
                <label>Nationality:</label>
                <span>{app.personalInfo?.nationality}</span>
              </div>
              <div className={styles.item}>
                <label>Region of Origin:</label>
                <span>{app.personalInfo?.region}</span>
              </div>
              <div className={styles.item}>
                <label>Height (cm):</label>
                <span>{app.personalInfo?.heightCm || 'N/A'}</span>
              </div>
              <div className={styles.item}>
                <label>Weight (kg):</label>
                <span>{app.personalInfo?.weightKg || 'N/A'}</span>
              </div>

              <div className={styles.item}>
                <label>Category:</label>
                <span>{app.category?.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <h3>Contact Details</h3>
            <div className={styles.grid}>
              <div className={styles.item}>
                <label>Email:</label>
                <span>{app.contactInfo?.email}</span>
              </div>
              <div className={styles.item}>
                <label>Phone:</label>
                <span>{app.contactInfo?.phoneNumber}</span>
              </div>
              <div className={styles.item}>
                <label>Address:</label>
                <span>{app.contactInfo?.residentialAddress}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Education */}
        <section className={styles.section}>
          <h3>Educational Background</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Level</th>
                <th>Institution</th>
                <th>Year</th>
                <th>Qualification/Index</th>
              </tr>
            </thead>
            <tbody>
              {app.education?.bece && (
                <tr>
                  <td>BECE</td>
                  <td>{app.education.bece.schoolName}</td>
                  <td>{app.education.bece.completionYear}</td>
                  <td>{app.education.bece.indexNumber}</td>
                </tr>
              )}
              {app.education?.wassce && app.education.wassce.map((w, i) => (
                <tr key={i}>
                  <td>WASSCE</td>
                  <td>{w.schoolName}</td>
                  <td>{w.completionYear}</td>
                  <td>{w.indexNumber}</td>
                </tr>
              ))}
              {app.education?.tertiary && app.education.tertiary.map((t, i) => (
                <tr key={i}>
                  <td>Tertiary</td>
                  <td>{t.institutionName}</td>
                  <td>{t.completionYear}</td>
                  <td>{t.qualification} ({t.courseOfStudy})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>


        {/* Official Use */}
        <section className={styles.officialSection}>
          <h3>For Official Use Only</h3>
          <div className={styles.officialGrid}>
            <div className={styles.officialBox}>
              <label>Screening Officer</label>
              <div className={styles.signatureLine}></div>
              <span>Name & Signature</span>
            </div>
            <div className={styles.officialBox}>
              <label>Date</label>
              <div className={styles.signatureLine}></div>
              <span>DD / MM / YYYY</span>
            </div>
            <div className={styles.officialBox}>
              <label>Remarks</label>
              <div className={styles.remarksLine}></div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>This document is generated from the Ghana Police Recruitment Portal.</p>
        <p>Generated on {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
}

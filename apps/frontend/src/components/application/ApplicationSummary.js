'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image'; // Kept for QR code logic which is likely base64/local
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { format } from 'date-fns';
import { FiDownload, FiPrinter, FiCheckCircle } from 'react-icons/fi';
import { api } from '@/utils/api';
import styles from './ApplicationSummary.module.css';


export default function ApplicationSummary() {
  const [data, setData] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, qrData] = await Promise.all([
          api('/api/applications/summary'),
          api('/api/applications/qr-code')
        ]);

        if (summaryData.success) setData(summaryData.data);
        if (qrData.success) setQrCode(qrData.data.qrCode);
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { API_URL } = api; // Or manually get the constructed URL
      const token = localStorage.getItem('accessToken');
      
      const res = await fetch(`${API_URL}/api/applications/download-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GPS-Application-${data.application.applicationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading summary...</div>;
  if (!data) return <div className={styles.error}>Could not load application data.</div>;

  const { application, personalInfo, contactInfo, education, passportPhoto } = data;

  return (
    <div className={styles.summaryCard}>
      <div className={styles.successHeader}>
        <FiCheckCircle className={styles.successIcon} />
        <h2>Application Submitted Successfully!</h2>
        <p>Please download or print your application summary for your records.</p>
      </div>

      <div className={styles.actions}>
        <button onClick={handleDownload} disabled={downloading} className={styles.downloadBtn}>
          <FiDownload /> {downloading ? 'Generating PDF...' : 'Download PDF'}
        </button>
        <button onClick={() => window.print()} className={styles.printBtn}>
          <FiPrinter /> Print Summary
        </button>
      </div>

      <div className={styles.printableArea}>
        <header className={styles.gpsHeader}>
          <div className={styles.gpsLogoPlaceholder}>GHANA POLICE SERVICE</div>
          <h3>RECRUITMENT PORTAL - APPLICATION SUMMARY</h3>
        </header>

        <div className={styles.mainGrid}>
          <div className={styles.detailsColumn}>
            <section className={styles.section}>
              <h4>Basic Information</h4>
              <div className={styles.infoRow}>
                <span className={styles.label}>Application ID:</span>
                <span className={styles.value}>{application.applicationId}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Status:</span>
                <span className={styles.value}>{application.status}</span>
              </div>
              {application.category !== 'GENERAL_DUTY' && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Category:</span>
                  <span className={styles.value}>{application.category}</span>
                </div>
              )}
              <div className={styles.infoRow}>
                <span className={styles.label}>Date Submitted:</span>
                <span className={styles.value}>{application.submittedAt ? format(new Date(application.submittedAt), 'PPP') : 'N/A'}</span>
              </div>
            </section>

            <section className={styles.section}>
              <h4>Personal Details</h4>
              <div className={styles.infoRow}>
                <span className={styles.label}>Full Name:</span>
                <span className={styles.value}>{`${personalInfo?.firstName} ${personalInfo?.lastName}`}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Gender:</span>
                <span className={styles.value}>{personalInfo?.gender}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>DOB:</span>
                <span className={styles.value}>{personalInfo?.dateOfBirth ? format(new Date(personalInfo.dateOfBirth), 'PPP') : 'N/A'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Region:</span>
                <span className={styles.value}>{personalInfo?.region}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Height(cm):</span>
                <span className={styles.value}>{personalInfo?.heightCm || 'N/A'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Weight(kg):</span>
                <span className={styles.value}>{personalInfo?.weightKg || 'N/A'}</span>
              </div>
            </section>

          </div>

          <div className={styles.photoColumn}>
            <div className={styles.photoBox}>
              {passportPhoto ? (
                <CloudinaryImage 
                  src={passportPhoto.url} 
                  alt="Passport" 
                  width={100} 
                  height={100} 
                  className={styles.passportImage}
                />
              ) : (
                <div className={styles.noPhoto}>Photo N/A</div>
              )}
            </div>
            {qrCode && (
              <div className={styles.qrBox}>
                <Image 
                  src={qrCode} 
                  alt="Application QR" 
                  width={120} 
                  height={120} 
                />
                <span>{application.application_id}</span>
              </div>
            )}
          </div>
        </div>

        <section className={styles.section}>
          <h4>Contact Information</h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{contactInfo?.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Phone:</span>
              <span className={styles.value}>{contactInfo?.phoneNumber}</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h4>Education (WASSCE)</h4>
          <div className={styles.infoRow}>
            <span className={styles.label}>School:</span>
            <span className={styles.value}>{education?.wassce?.schoolName || education?.wassceSchool}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Year:</span>
            <span className={styles.value}>{education?.wassce?.completionYear || education?.wassceYear}</span>
          </div>
        </section>

        {education?.tertiary && education.tertiary.length > 0 && (
          <section className={styles.section}>
            <h4>Tertiary Education</h4>
            <div className={styles.infoRow}>
              <span className={styles.label}>Institution:</span>
              <span className={styles.value}>{education.tertiary[0].institution_name || education.tertiary[0].institutionName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Qualification:</span>
              <span className={styles.value}>{education.tertiary[0].qualification} - {education.tertiary[0].course_of_study || education.tertiary[0].courseOfStudy}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Class:</span>
              <span className={styles.value}>{education.tertiary[0].class_obtained || education.tertiary[0].classObtained}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Certificate #:</span>
              <span className={styles.value}>{education.tertiary[0].certificate_number || education.tertiary[0].certificateNumber}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>National Service:</span>
              <span className={styles.value}>{education.tertiary[0].national_service_number || education.tertiary[0].nationalServiceNumber} ({education.tertiary[0].national_service_year || education.tertiary[0].nationalServiceYear})</span>
            </div>
          </section>
        )}

        {data.eligibilityReport && (
          <div className={styles.eligibilitySection}>
            <h4>Eligibility Pre-screening Report</h4>
            <div className={styles.eligibilityGrid}>
              {data.eligibilityReport.checks.map((check, index) => (
                <div key={index} className={styles.eligibilityItem}>
                  <div className={styles.checkHeader}>
                    <span className={styles.checkName}>{check.name}</span>
                    <span className={`${styles.checkStatus} ${check.status === 'passed' ? styles.statusPassed : styles.statusFailed}`}>
                      {check.status}
                    </span>
                  </div>
                  <span className={styles.checkMetadata}>{check.value}</span>
                  <p className={styles.checkMessage}>{check.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className={styles.declaration}>
          <p><strong>Declaration:</strong> I hereby declare that all information provided is true and correct.</p>
          <div className={styles.signatureRow}>
            <div className={styles.signatureBox}>
              <div className={styles.line}></div>
              <span>Applicant Signature</span>
            </div>
            <div className={styles.dateBox}>
              <div className={styles.line}></div>
              <span>Date</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

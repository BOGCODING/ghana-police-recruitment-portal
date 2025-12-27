'use client';
import { useState, useEffect } from 'react';
import { FiSend, FiUsers, FiMail, FiMessageSquare, FiInfo, FiCheckCircle } from 'react-icons/fi';
import api from '@/lib/axios';
import styles from './page.module.css';

export default function CommunicationHub() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    region: '',
    category: ''
  });
  const [notification, setNotification] = useState({
    type: 'EMAIL',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await api.get('/admin/notifications/templates');
        if (data.success) setTemplates(data.data);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateSelect = (e) => {
    const template = templates.find(t => t.id === parseInt(e.target.value));
    if (template) {
      setNotification({
        ...notification,
        subject: template.subject,
        message: template.body
      });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setSuccess(null);
    try {
      const { data } = await api.post('/admin/notifications/send-bulk', {
        filters,
        notification
      });
      if (data.success) {
        setSuccess(data.message);
        setNotification({ type: 'EMAIL', subject: '', message: '' });
      }
    } catch (err) {
      console.error('Failed to send:', err);
      alert('Failed to send notifications. Check console for details.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Communication Hub</h1>
          <p>Send bulk notifications to filtered applicants</p>
        </div>
      </header>

      {success && (
        <div className={styles.successAlert}>
          <FiCheckCircle />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <div className={styles.grid}>
        <form onSubmit={handleSend} className={styles.mainForm}>
          <section className={styles.section}>
            <h3>1. Target Audience</h3>
            <div className={styles.filters}>
              <div className={styles.field}>
                <label>Application Status</label>
                <select 
                  value={filters.status} 
                  onChange={e => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">All Statuses</option>
                  <option value="SUBMITTED">Submitted / Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="DRAFT">Draft Holders</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Region</label>
                <select 
                  value={filters.region} 
                  onChange={e => setFilters({...filters, region: e.target.value})}
                >
                  <option value="">All Regions</option>
                  <option value="Ahafo">Ahafo</option>
                  <option value="Ashanti">Ashanti</option>
                  <option value="Bono">Bono</option>
                  <option value="Bono East">Bono East</option>
                  <option value="Central">Central</option>
                  <option value="Eastern">Eastern</option>
                  <option value="Greater Accra">Greater Accra</option>
                  <option value="North East">North East</option>
                  <option value="Northern">Northern</option>
                  <option value="Oti">Oti</option>
                  <option value="Savannah">Savannah</option>
                  <option value="Upper East">Upper East</option>
                  <option value="Upper West">Upper West</option>
                  <option value="Volta">Volta</option>
                  <option value="Western">Western</option>
                  <option value="Western North">Western North</option>
                </select>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>2. Compose Message</h3>
            <div className={styles.composerHeader}>
              <div className={styles.typeToggle}>
                <button 
                  type="button"
                  className={notification.type === 'EMAIL' ? styles.active : ''}
                  onClick={() => setNotification({...notification, type: 'EMAIL'})}
                >
                  <FiMail /> Email
                </button>
                <button 
                  type="button"
                  className={notification.type === 'SMS' ? styles.active : ''}
                  onClick={() => setNotification({...notification, type: 'SMS'})}
                >
                  <FiMessageSquare /> SMS
                </button>
                <button 
                  type="button"
                  className={notification.type === 'DASHBOARD' ? styles.active : ''}
                  onClick={() => setNotification({...notification, type: 'DASHBOARD'})}
                >
                  <FiInfo /> Dashboard
                </button>
              </div>
              <select onChange={handleTemplateSelect} className={styles.templateSelect}>
                <option value="">Load Template...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>Subject Line</label>
              <input 
                type="text" 
                value={notification.subject}
                onChange={e => setNotification({...notification, subject: e.target.value})}
                placeholder="e.g. Schedule for Screening"
                required={notification.type === 'EMAIL'}
              />
            </div>

            <div className={styles.field}>
              <label>Message Content</label>
              <textarea 
                value={notification.message}
                onChange={e => setNotification({...notification, message: e.target.value})}
                rows={8}
                placeholder="Type your message here... Use {name} for personalization."
                required
              />
              <p className={styles.hint}>TIP: Use <code>{'{name}'}</code> to automatically insert the applicant&apos;s first name.</p>
            </div>
          </section>

          <div className={styles.formFooter}>
            <button type="submit" className={styles.sendBtn} disabled={sending}>
              <FiSend /> {sending ? 'Sending...' : 'Send Bulk Notification'}
            </button>
          </div>
        </form>

        <aside className={styles.sidebar}>
          <div className={styles.summaryCard}>
            <h3>Outreach Summary</h3>
            <div className={styles.summaryItem}>
              <FiUsers />
              <span>Targeting <strong>Matching</strong> applicants</span>
            </div>
            <div className={styles.summaryItem}>
              <FiInfo />
              <span>Job will run in <strong>Background</strong></span>
            </div>
          </div>

          <div className={styles.recentHistory}>
            <h3>Recent Outreach</h3>
            <div className={styles.historyItem}>
              <div className={styles.hInfo}>
                <span className={styles.hTitle}>Interview Invite</span>
                <span className={styles.hMeta}>Dec 26, 2025 • 450 sent</span>
              </div>
              <span className={styles.hStatus}>Completed</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

'use client';
import { FiTool } from 'react-icons/fi';

export default function MaintenancePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '2rem',
      background: '#f8fafc'
    }}>
      <FiTool size={64} color="#006b3f" style={{ marginBottom: '1.5rem' }} />
      <h1 style={{ color: '#1e293b', marginBottom: '1rem' }}>Under Maintenance</h1>
      <p style={{ color: '#64748b', maxWidth: '500px', lineHeight: '1.6' }}>
        The Ghana Police Service Recruitment Portal is currently undergoing scheduled maintenance. 
        We apologize for the inconvenience. Please check back later.
      </p>
    </div>
  );
}

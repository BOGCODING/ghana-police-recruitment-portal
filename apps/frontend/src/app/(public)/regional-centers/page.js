import Link from 'next/link';
import Image from 'next/image';

export default function RegionalCenters() {
  const centers = [
    { name: 'Accra Region', center: 'National Police Training School', img: '/images/regional-centers/accra-center.jpg', location: 'Tesano, Accra' },
    { name: 'Ashanti Region', center: 'Police Training School, Kumasi', img: '/images/regional-centers/kumasi-center.jpg', location: 'Kumasi' },
    { name: 'Western Region', center: 'Regional Police Headquarters', img: '/images/regional-centers/takoradi-center.jpg', location: 'Takoradi' },
    { name: 'Northern Region', center: 'Police Training School, Tamale', img: '/images/regional-centers/tamale-center.jpg', location: 'Tamale' },
  ];

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#001F3F' }}>Regional Recruitment Centers</h1>
        <p style={{ color: '#6B7280', fontSize: '1.2rem' }}>Official designated centers for physical screening and documentation</p>
      </header>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '2rem' 
      }}>
        {centers.map((center, idx) => (
          <div key={idx} style={{ 
            borderRadius: '16px', 
            overflow: 'hidden', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            background: 'white',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ position: 'relative', height: '200px' }}>
              <Image 
                src={center.img} 
                alt={center.name} 
                fill 
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#001F3F' }}>{center.name}</h3>
              <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: '#006B3F' }}>{center.center}</p>
              <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>📍 {center.location}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <Link href="/" style={{ 
          color: '#006B3F', 
          fontWeight: '600', 
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}


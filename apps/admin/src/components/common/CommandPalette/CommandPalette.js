'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiFileText, FiLayout, FiSettings, FiActivity, FiUsers, FiX } from 'react-icons/fi';
import { applicationService } from '@/services/applicationService';
import styles from './CommandPalette.module.css';

const COMMANDS = [
  { id: 'dash', title: 'Dashboard', icon: <FiLayout />, path: '/dashboard' },
  { id: 'apps', title: 'Applications', icon: <FiFileText />, path: '/dashboard/applications' },
  { id: 'analytics', title: 'Analytics', icon: <FiActivity />, path: '/dashboard/analytics' },
  { id: 'audit', title: 'Audit Logs', icon: <FiActivity />, path: '/dashboard/audit-logs' },
  { id: 'users', title: 'Admin Users', icon: <FiUsers />, path: '/dashboard/users' },
  { id: 'settings', title: 'Settings', icon: <FiSettings />, path: '/dashboard/settings' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSelectedIndex(0);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query) {
      setResults(COMMANDS);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // Search commands first
        const filteredCommands = COMMANDS.filter(cmd => 
          cmd.title.toLowerCase().includes(query.toLowerCase())
        );

        // search applications if query looks like a serial or name
        let appResults = [];
        if (query.length >= 3) {
          const res = await applicationService.getAll({ search: query, limit: 5 });
          if (res.success) {
            appResults = res.data.map(app => ({
              id: app.id,
              title: `${app.firstName} ${app.lastName}`,
              subtitle: `Serial: ${app.serialNumber} | Status: ${app.status}`,
              icon: <FiFileText />,
              path: `/dashboard/applications/${app.id}`,
              type: 'Application'
            }));
          }
        }

        setResults([...filteredCommands, ...appResults]);
      } catch (error) {
        console.error('Command search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    router.push(item.path);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search applications..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
            <FiX />
          </button>
        </div>

        <div className={styles.results}>
          {results.length > 0 ? (
            results.map((item, index) => (
              <div
                key={item.id}
                className={`${styles.resultItem} ${index === selectedIndex ? styles.selected : ''}`}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => handleSelect(item)}
              >
                <div className={styles.itemIcon}>{item.icon}</div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  {item.subtitle && <span className={styles.itemSubtitle}>{item.subtitle}</span>}
                </div>
                {item.type && <span className={styles.itemType}>{item.type}</span>}
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              {loading ? 'Searching...' : 'No results found.'}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.kdbGroup}>
            <kbd>↵</kbd> <span>to select</span>
          </div>
          <div className={styles.kdbGroup}>
            <kbd>↑↓</kbd> <span>to navigate</span>
          </div>
          <div className={styles.kdbGroup}>
            <kbd>esc</kbd> <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

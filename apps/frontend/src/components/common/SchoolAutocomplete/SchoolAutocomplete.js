'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './SchoolAutocomplete.module.css';
import { api } from '../../../utils/api';

export default function SchoolAutocomplete({ value, onChange, placeholder = 'Search school...', name }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSchools = async (searchQuery) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const data = await api(`/api/education/schools/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
      if (data && data.success) {
        setSuggestions(data.data);
      }
    } catch (error) {
      console.error('School search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.toUpperCase();
    setQuery(newValue);
    onChange({ target: { name, value: newValue } });
    searchSchools(newValue);
    setIsOpen(true);
  };

  const handleSelect = (school) => {
    setQuery(school.name);
    onChange({ target: { name, value: school.name } });
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        placeholder={placeholder}
        className={styles.input}
        autoComplete="off"
      />
      
      {loading && <span className={styles.loading}>🔍</span>}
      
      {isOpen && suggestions.length > 0 && (
        <ul className={styles.dropdown}>
          {suggestions.map((school, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(school)}
              className={styles.dropdownItem}
            >
              <span className={styles.schoolName}>{school.name}</span>
              <span className={styles.schoolTown}>{school.town}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

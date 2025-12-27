'use client';
import { useState } from 'react';
import { FiSearch, FiChevronDown, FiHelpCircle } from 'react-icons/fi';
import styles from './styles.module.css';

const FAQ_DATA = [
  {
    category: 'General',
    question: 'How do I start my application?',
    answer: 'To start your application, you first need to purchase a recruitment voucher from any authorized bank or through our USSD code. Once you have the voucher, click on the "Register" button and enter your Serial Number and PIN.'
  },
  {
    category: 'General',
    question: 'Can I apply for multiple categories?',
    answer: 'No, each applicant is allowed to apply for only one category. Please review the requirements for each category carefully before making your selection.'
  },
  {
    category: 'Requirements',
    question: 'What are the minimum height requirements?',
    answer: 'The minimum height requirement is 1.67m (5ft 6in) for males and 1.60m (5ft 3in) for females. However, specific requirements may vary for certain technical roles.'
  },
  {
    category: 'Requirements',
    question: 'Is there an age limit for applicants?',
    answer: 'Yes, applicants must generally be between the ages of 18 and 28. For specialized or professional roles, the upper age limit may be extended to 32 or 35. Check the specific category details for exact limits.'
  },
  {
    category: 'Technical',
    question: 'What documents do I need to upload?',
    answer: 'You will need to upload digital copies of your academic certificates (WASSCE/BECE/Degrees), a valid ID (Ghana Card), your birth certificate, and a professional passport-sized photograph with a white background.'
  },
  {
    category: 'Technical',
    question: 'I lost my Serial Number/PIN, what should I do?',
    answer: 'Please contact our support team immediately with your name, the phone number used for the purchase, and the approximate date of purchase. We will verify your details and help recover your credentials.'
  },
  {
    category: 'Medical',
    question: 'What does the medical examination involve?',
    answer: 'The medical examination includes general physical fitness tests, vision and hearing checks, blood tests, and screenings for chronic conditions to ensure you are fit for the rigors of police training.'
  }
];

const CATEGORIES = ['All', 'General', 'Requirements', 'Technical', 'Medical'];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const filteredFaqs = FAQ_DATA.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.hero}>
        <h1>Frequently Asked Questions</h1>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search for questions..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className={styles.categories}>
        {CATEGORIES.map(cat => (
          <button 
            key={cat} 
            className={`${styles.categoryBtn} ${activeCategory === cat ? styles.activeCategory : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.faqList}>
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <button 
                className={`${styles.question} ${expandedIndex === index ? styles.expandedQuestion : ''}`}
                onClick={() => toggleAccordion(index)}
              >
                {faq.question}
                <FiChevronDown className={styles.chevron} />
              </button>
              <div className={`${styles.answer} ${expandedIndex === index ? styles.expandedAnswer : ''}`}>
                <div className={styles.answerInner}>
                  {faq.answer}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <FiHelpCircle className={styles.emptyIcon} />
            <p>No questions found matching your criteria. Try adjusting your search or category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

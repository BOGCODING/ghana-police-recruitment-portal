'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import styles from './styles.module.css';
import { contactService } from '@/services/contactService';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data) => {
    setError(null);
    try {
      await contactService.sendMessage(data);
      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again later.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.hero}>
        <h1>Contact Us</h1>
        <p>
          Have questions about the recruitment process? Our dedicated support team is here to help you navigate your journey into the Ghana Police Service.
        </p>
      </header>

      <div className={styles.contentGrid}>
        {/* Contact Info */}
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <FiPhone />
            </div>
            <div className={styles.cardContent}>
              <h3>Phone Support</h3>
              <p>Main Line: <a href="tel:+233240625832">+233 24 062 5832</a></p>
              <p>Hotline: <a href="tel:18555">18555</a> (Emergency Only)</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <FiMail />
            </div>
            <div className={styles.cardContent}>
              <h3>Email Inquiries</h3>
              <p><a href="mailto:boglogodwin@gmail.com">boglogodwin@gmail.com</a></p>
              <p><a href="mailto:info@ghanapolice.info">info@ghanapolice.info</a></p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <FiMapPin />
            </div>
            <div className={styles.cardContent}>
              <h3>Headquarters</h3>
              <p>
                Police Headquarters,<br />
                P.O. Box 116,<br />
                Ring Road East, Accra, Ghana
              </p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconWrapper}>
              <FiClock />
            </div>
            <div className={styles.cardContent}>
              <h3>Office Hours</h3>
              <p>Monday - Friday<br />8:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <section className={styles.formSection}>
          <h2>Send us a Message</h2>
          {submitted ? (
            <div className={styles.successMessage}>
              Thank you for reaching out! Your message has been sent successfully. We will get back to you shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              {error && <div className={styles.errorBanner}>{error}</div>}
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input 
                  {...register('name')}
                  placeholder="John Doe"
                  className={styles.input}
                />
                {errors.name && <span className={styles.error}>{errors.name.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input 
                  {...register('email')}
                  type="email"
                  placeholder="john@example.com"
                  className={styles.input}
                />
                {errors.email && <span className={styles.error}>{errors.email.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Subject</label>
                <input 
                  {...register('subject')}
                  placeholder="Recruitment Question"
                  className={styles.input}
                />
                {errors.subject && <span className={styles.error}>{errors.subject.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Your Message</label>
                <textarea 
                  {...register('message')}
                  placeholder="How can we help you?"
                  className={styles.textarea}
                />
                {errors.message && <span className={styles.error}>{errors.message.message}</span>}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : (
                  <>
                    <FiSend /> Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

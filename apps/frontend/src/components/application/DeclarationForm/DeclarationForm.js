import styles from './DeclarationForm.module.css';

// Simplified to a single statement in the component body

export default function DeclarationForm({ register, errors }) {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className={styles.formSection}>
      <div className={styles.warningBox}>
        <strong>⚠️ Important Notice</strong>
        <p>
          Providing false information is a criminal offense and will lead to automatic 
          disqualification and potential prosecution. Please review your application 
          carefully before signing.
        </p>
      </div>

      <div className={styles.declarationList}>
        <label className={styles.checkboxLabel}>
          <input 
            type="checkbox" 
            {...register('acceptsDeclarations')} 
            className={styles.checkbox}
          />
          <span className={styles.labelText}>
            I hereby declare that I am a Ghanaian citizen by birth, of good character, 
            physically and mentally fit for police training, have no criminal record, 
            and have never been dismissed from any public or private service for misconduct. 
            I also agree to the Terms and Conditions of this recruitment process.
          </span>
        </label>
        
        {errors.acceptsDeclarations && (
          <p className={styles.warningMessage}>{errors.acceptsDeclarations.message || 'You should confirm this declaration to proceed.'}</p>
        )}
      </div>

      <div className={styles.signatureSection}>
        <div className={styles.field}>
          <label className={styles.mainLabel}>Applicant Signature (Type your Full Name) *</label>
          <input 
            type="text" 
            {...register('signature')} 
            className={`${styles.signatureInput} ${errors.signature ? styles.error : ''}`}
            placeholder="ENTER YOUR FULL NAME HERE"
          />
          {errors.signature && <span className={styles.errorMessage}>{errors.signature.message}</span>}
        </div>
        
        <div className={styles.field}>
          <label className={styles.mainLabel}>Declaration Date</label>
          <div className={styles.dateDisplay}>{currentDate}</div>
        </div>
      </div>
    </div>
  );
}

import styles from './DeclarationForm.module.css';

const DECLARATION_ITEMS = [
  { 
    id: 'hasNoCriminalRecord', 
    label: 'I confirm that I have no criminal record in Ghana or any other country.' 
  },
  { 
    id: 'hasNotBeenDismissed', 
    label: 'I declare that I have not been dismissed from any public or private service for misconduct.' 
  },
  { 
    id: 'isGhanaianByBirth', 
    label: 'I confirm that I am a Ghanaian citizen by birth.' 
  },
  { 
    id: 'isOfGoodCharacter', 
    label: 'I declare that I am of good character and have never been associated with any subversive activities.' 
  },
  { 
    id: 'isPhysicallyFit', 
    label: 'I declare that I am physically and mentally fit to undergo the rigorous training required by the Ghana Police Service.' 
  },
  { 
    id: 'acceptsTerms', 
    label: 'I have read, understood and agree to the Terms and Conditions of the recruitment process.' 
  }
];

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
        {DECLARATION_ITEMS.map((item) => (
          <label key={item.id} className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              {...register(item.id)} 
              className={styles.checkbox}
            />
            <span className={styles.labelText}>{item.label}</span>
          </label>
        ))}
        {/* Hard block removed to allow soft-fail */}
        {(errors.hasNoCriminalRecord || 
          errors.hasNotBeenDismissed || 
          errors.isGhanaianByBirth || 
          errors.isOfGoodCharacter || 
          errors.isPhysicallyFit || 
          errors.acceptsTerms) && (
          <p className={styles.warningMessage}>Note: Not confirming all declarations will affect your final eligibility status.</p>
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

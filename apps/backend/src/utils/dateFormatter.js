/**
 * dateFormatter.js - Consistent date formatting for reports
 */
const formatDate = (date, type = 'short') => {
  if (!date) return 'N/A';
  const d = new Date(date);
  
  if (type === 'iso') return d.toISOString().split('T')[0];
  if (type === 'full') return d.toLocaleString('en-GB');
  
  return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
};

module.exports = { formatDate };

// Format Ghana phone numbers to standard 233 format
const formatPhone = (phone) => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '233' + cleaned.substring(1);
  } else if (!cleaned.startsWith('233')) {
    cleaned = '233' + cleaned;
  }
  return cleaned;
};

module.exports = { formatPhone };

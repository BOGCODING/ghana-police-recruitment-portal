const xlsx = require('xlsx');

/**
 * Export Service - Handles data conversion for downloads
 */
const ExportService = {
  /**
   * Convert JSON data to Excel buffer
   */
  async toExcel(data, baseFileName = 'export') {
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const fileName = `${baseFileName}_${Date.now()}.xlsx`;
    
    return { buffer, fileName };
  },

  /**
   * Convert JSON data to CSV buffer
   */
  async toCSV(data, baseFileName = 'export') {
    const ws = xlsx.utils.json_to_sheet(data);
    const csv = xlsx.utils.sheet_to_csv(ws);
    const fileName = `${baseFileName}_${Date.now()}.csv`;
    
    return { data: csv, fileName, contentType: 'text/csv' };
  }
};

module.exports = ExportService;

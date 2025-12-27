const { query, transaction } = require('../config/database');

const DocumentsModel = {
  async findByApplicationId(applicationId) {
    const result = await query(
      'SELECT * FROM documents WHERE "applicationId" = $1 ORDER BY "createdAt" DESC',
      [applicationId]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await query('SELECT * FROM documents WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByType(applicationId, documentType) {
    const result = await query(
      'SELECT * FROM documents WHERE "applicationId" = $1 AND "documentType" = $2',
      [applicationId, documentType]
    );
    return result.rows[0] || null;
  },

  async create(documentData) {
    const {
      applicationId, documentType, filename, originalName = null,
      filePath, mimeType = null, fileSize = null, description = null,
      verificationStatus = 'PENDING'
    } = documentData;

    const result = await query(
      `INSERT INTO documents ("applicationId", "documentType", filename, "originalName", "filePath", "mimeType", "fileSize", description, "verificationStatus")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [applicationId, documentType, filename, originalName, filePath, mimeType, fileSize, description, verificationStatus]
    );
    return result.rows[0];
  },

  async createWithClient(client, documentData) {
    const {
      applicationId, documentType, filename, originalName = null,
      filePath, mimeType = null, fileSize = null, description = null
    } = documentData;

    const result = await client.query(
      `INSERT INTO documents ("applicationId", "documentType", filename, "originalName", "filePath", "mimeType", "fileSize", description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [applicationId, documentType, filename, originalName, filePath, mimeType, fileSize, description]
    );
    return result.rows[0];
  },

  async updateVerification(id, status, verifiedBy) {
    const result = await query(
      'UPDATE documents SET "verificationStatus" = $2, "verifiedBy" = $3, "verifiedAt" = NOW() WHERE id = $1 RETURNING *',
      [id, status, verifiedBy]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await query('DELETE FROM documents WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  async deleteByApplicationId(applicationId) {
    const result = await query('DELETE FROM documents WHERE "applicationId" = $1 RETURNING id', [applicationId]);
    return result.rows.length;
  },

  async replace(applicationId, documentType, newDocumentData) {
    return await transaction(async (client) => {
      await client.query('DELETE FROM documents WHERE "applicationId" = $1 AND "documentType" = $2', [applicationId, documentType]);
      const result = await client.query(
        `INSERT INTO documents ("applicationId", "documentType", filename, "originalName", "filePath", "mimeType", "fileSize", description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [applicationId, documentType, newDocumentData.filename, newDocumentData.originalName, newDocumentData.filePath, newDocumentData.mimeType, newDocumentData.fileSize, newDocumentData.description]
      );
      return result.rows[0];
    });
  },

  async findByVerificationStatus(status, limit = 50) {
    const result = await query(
      `SELECT d.*, app."applicationId" as "appNumber" FROM documents d
       JOIN applications app ON d."applicationId" = app.id
       WHERE d."verificationStatus" = $1 ORDER BY d."createdAt" DESC LIMIT $2`,
      [status, limit]
    );
    return result.rows;
  },

  async countByVerificationStatus() {
    const result = await query(
      'SELECT "verificationStatus" as status, COUNT(*) as count FROM documents GROUP BY "verificationStatus"'
    );
    return result.rows;
  },

  async checkRequiredDocuments(applicationId, requiredTypes) {
    const result = await query('SELECT "documentType" FROM documents WHERE "applicationId" = $1', [applicationId]);
    const uploadedTypes = result.rows.map(r => r.documentType);
    const missing = requiredTypes.filter(type => !uploadedTypes.includes(type));
    return { complete: missing.length === 0, missing };
  },

  async checkVerificationStatus(applicationId) {
    const result = await query('SELECT "verificationStatus" FROM documents WHERE "applicationId" = $1', [applicationId]);
    const statuses = result.rows.map(r => r.verificationStatus);
    return {
      allVerified: statuses.length > 0 && statuses.every(s => s === 'VERIFIED'),
      pending: statuses.filter(s => s === 'PENDING').length,
      rejected: statuses.filter(s => s === 'REJECTED').length
    };
  },

  async getStorageUsed(applicationId) {
    const result = await query('SELECT COALESCE(SUM("fileSize"), 0) as total FROM documents WHERE "applicationId" = $1', [applicationId]);
    return parseInt(result.rows[0].total);
  }
};

module.exports = DocumentsModel;

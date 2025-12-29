const { query } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { deleteFile } = require('../middleware/upload.middleware');
const logger = require('../utils/logger');

/**
 * Upload single document (Passport Photo, Certificate, etc.)
 */
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const { documentType, description } = req.body;
    
    // Find application ID for the current applicant
    const appResult = await query(
      'SELECT id FROM applications WHERE "applicantId" = $1',
      [req.user.id]
    );

    if (appResult.rows.length === 0) {
      deleteFile(req.file.path);
      if (req.file.processedPath) deleteFile(req.file.processedPath);
      return errorResponse(res, 'Application not found. Please start an application first.', 404);
    }

    const appId = appResult.rows[0].id;

    // Check if this document type already exists and delete it (optional, based on requirement)
    // For Passport Photo, we usually want only one.
    if (documentType === 'passportPhoto') {
      const existing = await query(
        'SELECT "filePath", id FROM documents WHERE "applicationId" = $1 AND "documentType" = $2',
        [appId, 'passportPhoto']
      );
      if (existing.rows.length > 0) {
        deleteFile(existing.rows[0].filePath);
        await query('DELETE FROM documents WHERE id = $1', [existing.rows[0].id]);
      }
    }

    // Insert into database
    const result = await query(
      `INSERT INTO documents (
        "applicationId", 
        "documentType", 
        filename, 
        "originalName", 
        "filePath", 
        "mimeType", 
        "fileSize", 
        description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        appId,
        documentType || 'OTHER',
        req.file.filename,
        req.file.originalname,
        req.file.processedPath || req.file.path, // Store processed path if exists (e.g. for passport)
        req.file.mimetype,
        req.file.size,
        description
      ]
    );

    logger.info(`Document uploaded: ${req.file.filename} type: ${documentType}`);

    const baseUrl = (process.env.API_URL || '').trim().replace(/\/+$/, '').replace(/\/api$/, '');
    const url = baseUrl ? `${baseUrl}${req.file.url}` : req.file.url;
    
    return successResponse(res, {
      ...result.rows[0],
      url: url
    }, 'Document uploaded successfully', 201);

  } catch (error) {
    logger.error('Upload document error:', error);
    if (req.file) {
      deleteFile(req.file.path);
      if (req.file.processedPath) deleteFile(req.file.processedPath);
    }
    return errorResponse(res, 'Failed to upload document', 500);
  }
};

/**
 * Get all documents for the current applicant
 */
const getUploadedDocuments = async (req, res) => {
  try {
    const result = await query(
      `SELECT d.id, d."documentType", d.filename, d."originalName", d."mimeType", d."fileSize", d."verificationStatus", d."createdAt"
       FROM documents d
       JOIN applications a ON d."applicationId" = a.id
       WHERE a."applicantId" = $1
       ORDER BY d."createdAt" DESC`,
      [req.user.id]
    );

    return successResponse(res, result.rows);
  } catch (error) {
    logger.error('Get documents error:', error);
    return errorResponse(res, 'Failed to retrieve documents', 500);
  }
};

/**
 * Delete a document
 */
const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    // Ensure the document belongs to the current user's application
    const checkResult = await query(
      `SELECT d."filePath", d.id 
       FROM documents d
       JOIN applications a ON d."applicationId" = a.id
       WHERE d.id = $1 AND a."applicantId" = $2`,
      [documentId, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return errorResponse(res, 'Document not found or access denied', 404);
    }

    const { filePath } = checkResult.rows[0];

    // Delete from storage
    deleteFile(filePath);

    // Delete from database
    await query('DELETE FROM documents WHERE id = $1', [documentId]);

    return successResponse(res, null, 'Document deleted successfully');
  } catch (error) {
    logger.error('Delete document error:', error);
    return errorResponse(res, 'Failed to delete document', 500);
  }
};

module.exports = {
  uploadDocument,
  getUploadedDocuments,
  deleteDocument
};

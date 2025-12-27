const { query, transaction } = require('../config/database');

/**
 * Education Model - Handles all database operations for education records
 * Includes main education table and related BECE, WASSCE, and Tertiary tables
 */
const EducationModel = {
  // =============== Main Education Record ===============
  
  async findByApplicationId(applicationId) {
    const result = await query('SELECT * FROM education WHERE "applicationId" = $1', [applicationId]);
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await query('SELECT * FROM education WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(educationData) {
    const {
      applicationId, hasWassce = true, hasNovDec = false,
      hasTertiary = false, hasProfessionalCert = false, hasCompletedNationalService = false
    } = educationData;

    const result = await query(
      `INSERT INTO education ("applicationId", "hasWassce", "hasNovDec", "hasTertiary", "hasProfessionalCert", "hasCompletedNationalService")
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [applicationId, hasWassce, hasNovDec, hasTertiary, hasProfessionalCert, hasCompletedNationalService]
    );
    return result.rows[0];
  },

  async update(applicationId, updates) {
    const fieldMapping = {
      hasWassce: '"hasWassce"',
      hasNovDec: '"hasNovDec"',
      hasTertiary: '"hasTertiary"',
      hasProfessionalCert: '"hasProfessionalCert"',
      hasCompletedNationalService: '"hasCompletedNationalService"'
    };
    
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMapping[key] && value !== undefined) {
        setClauses.push(`${fieldMapping[key]} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) return null;
    values.push(applicationId);
    
    const result = await query(
      `UPDATE education SET ${setClauses.join(', ')}, "updatedAt" = NOW() WHERE "applicationId" = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async upsert(applicationId, educationData) {
    const existing = await this.findByApplicationId(applicationId);
    if (existing) {
      return await this.update(applicationId, educationData);
    }
    return await this.create({ applicationId: applicationId, ...educationData });
  },

  // =============== BECE Results ===============
  
  async findBeceByApplicationId(applicationId) {
    const result = await query('SELECT * FROM bece_results WHERE "applicationId" = $1', [applicationId]);
    return result.rows[0] || null;
  },

  async createBece(beceData) {
    const { applicationId, schoolName, completionYear, indexNumber, certificateNumber, results } = beceData;
    const result = await query(
      `INSERT INTO bece_results ("applicationId", "schoolName", "completionYear", "indexNumber", "certificateNumber", results)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [applicationId, schoolName, completionYear, indexNumber, certificateNumber, JSON.stringify(results)]
    );
    return result.rows[0];
  },

  async updateBece(applicationId, updates) {
    const { schoolName, completionYear, indexNumber, certificateNumber, results } = updates;
    const result = await query(
      `UPDATE bece_results SET "schoolName" = COALESCE($2, "schoolName"), "completionYear" = COALESCE($3, "completionYear"),
       "indexNumber" = COALESCE($4, "indexNumber"), "certificateNumber" = COALESCE($5, "certificateNumber"), results = COALESCE($6, results), "updatedAt" = NOW()
       WHERE "applicationId" = $1 RETURNING *`,
      [applicationId, schoolName, completionYear, indexNumber, certificateNumber, results ? JSON.stringify(results) : null]
    );
    return result.rows[0] || null;
  },

  async upsertBece(applicationId, beceData) {
    const existing = await this.findBeceByApplicationId(applicationId);
    if (existing) {
      return await this.updateBece(applicationId, beceData);
    }
    return await this.createBece({ applicationId: applicationId, ...beceData });
  },

  // =============== WASSCE Results ===============
  
  async findWassceByApplicationId(applicationId, isNovdec = null) {
    let queryText = 'SELECT * FROM wassce_results WHERE "applicationId" = $1';
    const values = [applicationId];
    if (isNovdec !== null) {
      queryText += ' AND "isNovdec" = $2';
      values.push(isNovdec);
    }
    const result = await query(queryText, values);
    return isNovdec !== null ? result.rows[0] || null : result.rows;
  },

  async createWassce(wassceData) {
    const { applicationId, isNovdec = false, schoolName, completionYear, indexNumber, certificateNumber, results } = wassceData;
    const result = await query(
      `INSERT INTO wassce_results ("applicationId", "isNovdec", "schoolName", "completionYear", "indexNumber", "certificateNumber", results)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [applicationId, isNovdec, schoolName, completionYear, indexNumber, certificateNumber, JSON.stringify(results)]
    );
    return result.rows[0];
  },

  async updateWassce(applicationId, isNovdec, updates) {
    const { schoolName, completionYear, indexNumber, certificateNumber, results } = updates;
    const result = await query(
      `UPDATE wassce_results SET "schoolName" = COALESCE($3, "schoolName"), "completionYear" = COALESCE($4, "completionYear"),
       "indexNumber" = COALESCE($5, "indexNumber"), "certificateNumber" = COALESCE($6, "certificateNumber"), results = COALESCE($7, results), "updatedAt" = NOW()
       WHERE "applicationId" = $1 AND "isNovdec" = $2 RETURNING *`,
      [applicationId, isNovdec, schoolName, completionYear, indexNumber, certificateNumber, results ? JSON.stringify(results) : null]
    );
    return result.rows[0] || null;
  },

  async upsertWassce(applicationId, wassceData) {
    const isNovdec = wassceData.isNovdec || false;
    const existing = await this.findWassceByApplicationId(applicationId, isNovdec);
    if (existing) {
      return await this.updateWassce(applicationId, isNovdec, wassceData);
    }
    return await this.createWassce({ applicationId: applicationId, ...wassceData });
  },

  // =============== Tertiary Education ===============
  
  async findTertiaryByApplicationId(applicationId) {
    const result = await query('SELECT * FROM tertiary_education WHERE "applicationId" = $1', [applicationId]);
    return result.rows;
  },

  async createTertiary(tertiaryData) {
    const {
      applicationId, institutionName, qualification, courseOfStudy,
      classObtained, completionYear, certificateNumber, nationalServiceYear, nationalServiceNumber
    } = tertiaryData;
    const result = await query(
      `INSERT INTO tertiary_education ("applicationId", "institutionName", qualification, "courseOfStudy", "classObtained", "completionYear", "certificateNumber", "nationalServiceYear", "nationalServiceNumber")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [applicationId, institutionName, qualification, courseOfStudy, classObtained, completionYear, certificateNumber, nationalServiceYear, nationalServiceNumber]
    );
    return result.rows[0];
  },

  async updateTertiary(id, updates) {
    const fieldMapping = {
      institutionName: '"institutionName"',
      qualification: 'qualification',
      courseOfStudy: '"courseOfStudy"',
      classObtained: '"classObtained"',
      completionYear: '"completionYear"',
      certificateNumber: '"certificateNumber"',
      nationalServiceYear: '"nationalServiceYear"',
      nationalServiceNumber: '"nationalServiceNumber"'
    };

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMapping[key] && value !== undefined) {
        setClauses.push(`${fieldMapping[key]} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) return null;
    values.push(id);
    
    const result = await query(
      `UPDATE tertiary_education SET ${setClauses.join(', ')}, "updatedAt" = NOW() WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async deleteTertiary(id) {
    const result = await query('DELETE FROM tertiary_education WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  },

  // =============== Get Full Education Record ===============
  
  async getFullEducation(applicationId) {
    const [education, bece, wassce, tertiary] = await Promise.all([
      this.findByApplicationId(applicationId),
      this.findBeceByApplicationId(applicationId),
      this.findWassceByApplicationId(applicationId),
      this.findTertiaryByApplicationId(applicationId)
    ]);

    return {
      education,
      bece,
      wassce,
      tertiary
    };
  },

  // =============== Save All Education Data ===============
  
  async saveFullEducation(applicationId, data) {
    return await transaction(async (client) => {
      // 1. Upsert main education record
      await client.query(
        `INSERT INTO education (
          "applicationId", "hasWassce", "hasNovDec", "hasTertiary", 
          "hasProfessionalCert", "hasCompletedNationalService"
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT ("applicationId") DO UPDATE SET
          "hasWassce" = EXCLUDED."hasWassce",
          "hasNovDec" = EXCLUDED."hasNovDec",
          "hasTertiary" = EXCLUDED."hasTertiary",
          "hasProfessionalCert" = EXCLUDED."hasProfessionalCert",
          "hasCompletedNationalService" = EXCLUDED."hasCompletedNationalService",
          "updatedAt" = NOW()`,
        [
          applicationId, 
          data.hasWassce || false, 
          data.hasNovDec || false, 
          data.hasTertiary || false, 
          data.hasProfessionalCert || false, 
          data.hasCompletedNationalService || false
        ]
      );

      // 2. BECE Results
      if (data.bece) {
        await client.query(
          `INSERT INTO bece_results ("applicationId", "schoolName", "completionYear", "indexNumber", "certificateNumber", results)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT ("applicationId") DO UPDATE SET
             "schoolName" = EXCLUDED."schoolName",
             "completionYear" = EXCLUDED."completionYear",
             "indexNumber" = EXCLUDED."indexNumber",
             "certificateNumber" = EXCLUDED."certificateNumber",
             results = EXCLUDED.results,
             "updatedAt" = NOW()`,
          [
            applicationId, 
            data.bece.schoolName, 
            data.bece.completionYear, 
            data.bece.indexNumber, 
            data.bece.certificateNumber,
            JSON.stringify(data.bece.results)
          ]
        );
      }

      // 3. WASSCE Results
      if (data.wassce) {
        await client.query(
          `INSERT INTO wassce_results ("applicationId", "isNovdec", "schoolName", "completionYear", "indexNumber", "certificateNumber", results)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT ("applicationId", "isNovdec") DO UPDATE SET
             "schoolName" = EXCLUDED."schoolName",
             "completionYear" = EXCLUDED."completionYear",
             "indexNumber" = EXCLUDED."indexNumber",
             "certificateNumber" = EXCLUDED."certificateNumber",
             results = EXCLUDED.results,
             "updatedAt" = NOW()`,
          [
            applicationId, 
            false, 
            data.wassce.schoolName, 
            data.wassce.completionYear, 
            data.wassce.indexNumber, 
            data.wassce.certificateNumber,
            JSON.stringify(data.wassce.results)
          ]
        );
      }

      // 4. NovDec Results
      if (data.novdec) {
        await client.query(
          `INSERT INTO wassce_results ("applicationId", "isNovdec", "schoolName", "completionYear", "indexNumber", "certificateNumber", results)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT ("applicationId", "isNovdec") DO UPDATE SET
             "schoolName" = EXCLUDED."schoolName",
             "completionYear" = EXCLUDED."completionYear",
             "indexNumber" = EXCLUDED."indexNumber",
             "certificateNumber" = EXCLUDED."certificateNumber",
             results = EXCLUDED.results,
             "updatedAt" = NOW()`,
          [
            applicationId, 
            true, 
            data.novdec.schoolName, 
            data.novdec.completionYear, 
            data.novdec.indexNumber, 
            data.novdec.certificateNumber,
            JSON.stringify(data.novdec.results)
          ]
        );
      }

      // 5. Tertiary Education
      if (data.tertiary) {
        await client.query(
          `INSERT INTO tertiary_education (
            "applicationId", "institutionName", qualification, "courseOfStudy", 
            "classObtained", "completionYear", "certificateNumber", 
            "nationalServiceYear", "nationalServiceNumber"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT ("applicationId") DO UPDATE SET
            "institutionName" = EXCLUDED."institutionName",
            qualification = EXCLUDED.qualification,
            "courseOfStudy" = EXCLUDED."courseOfStudy",
            "classObtained" = EXCLUDED."classObtained",
            "completionYear" = EXCLUDED."completionYear",
            "certificateNumber" = EXCLUDED."certificateNumber",
            "nationalServiceYear" = EXCLUDED."nationalServiceYear",
            "nationalServiceNumber" = EXCLUDED."nationalServiceNumber",
            "updatedAt" = NOW()`,
          [
            applicationId, 
            data.tertiary.institutionName, 
            data.tertiary.qualification, 
            data.tertiary.courseOfStudy, 
            data.tertiary.classObtained, 
            data.tertiary.completionYear, 
            data.tertiary.certificateNumber, 
            data.tertiary.nationalServiceYear, 
            data.tertiary.nationalServiceNumber
          ]
        );
      }

      return { success: true };
    });
  }
};

module.exports = EducationModel;

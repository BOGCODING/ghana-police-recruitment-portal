export default function ApplicationDetail({ application }) {
  if (!application) return <div>Loading...</div>;

  const DetailSection = ({ title, children }) => (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-6">
      <div className="bg-slate-50 px-6 py-4 border-b">
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const Field = ({ label, value }) => (
    <div className="mb-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-slate-900 font-medium">{value || 'N/A'}</p>
    </div>
  );

  const SectionGrid = ({ children }) => (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
     </div>
  );

  // Helper to safely access education data whether flat (legacy) or nested (new model)
  const edu = application.education || {};
  const wassce = Array.isArray(edu.wassce) ? edu.wassce[0] : (edu.wassce || {});
  const bece = edu.bece || {};
  const tertiary = edu.tertiary || [];
  
  // Also support flat legacy structure as fallback
  const wassceSchool = wassce.school_name || wassce.schoolName || edu.wassceSchool || edu.wassce_school;
  const wassceYear = wassce.completion_year || wassce.completionYear || edu.wassceYear || edu.wassce_year;
  const wassceIndex = wassce.index_number || wassce.indexNumber || edu.wassceIndexNumber || edu.wassce_index_number;
  
  const beceSchool = bece.school_name || bece.schoolName || edu.beceSchool || edu.bece_school;
  const beceYear = bece.completion_year || bece.completionYear || edu.beceYear || edu.bece_year;
  const beceAggregate = bece.aggregate || edu.beceAggregate || edu.bece_aggregate;

  return (
    <div className="space-y-6">
      <DetailSection title="Personal Information">
        <SectionGrid>
           <Field label="Full Name" value={`${application.personalInfo?.firstName || application.personalInfo?.first_name} ${application.personalInfo?.lastName || application.personalInfo?.last_name}`} />
           <Field label="Date of Birth" value={(application.personalInfo?.dateOfBirth || application.personalInfo?.date_of_birth) ? new Date(application.personalInfo?.dateOfBirth || application.personalInfo?.date_of_birth).toLocaleDateString() : 'N/A'} />
           <Field label="Gender" value={application.personalInfo?.gender} />
           <Field label="Nationality" value={application.personalInfo?.nationality} />
           <Field label="Phone" value={application.contactInfo?.phoneNumber || application.contactInfo?.phone_number} />
           <Field label="Email" value={application.contactInfo?.email} />
        </SectionGrid>
      </DetailSection>

      <DetailSection title="Education">
        {wassceSchool ? (
          <div className="mb-4 pb-4 border-b">
            <h4 className="text-sm font-bold text-slate-700 mb-2">WASSCE</h4>
            <SectionGrid>
               <Field label="School" value={wassceSchool} />
               <Field label="Year" value={wassceYear} />
               <Field label="Index Number" value={wassceIndex} />
            </SectionGrid>
            {/* Display WASSCE results if available in the detailed object */}
            {wassce.results && (
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {Array.isArray(wassce.results) ? wassce.results.map((r, i) => (
                  <span key={i} className="bg-slate-100 p-1 rounded">{r.subject}: {r.grade}</span>
                )) : (
                  // Fallback for legacy flat fields or stringified JSON
                  <>
                    <span className="bg-slate-100 p-1 rounded">Math: {edu.wassceMath || edu.wassce_math || 'N/A'}</span>
                    <span className="bg-slate-100 p-1 rounded">English: {edu.wassceEnglish || edu.wassce_english || 'N/A'}</span>
                  </>
                )}
              </div>
            )}
          </div>
        ) : null}
        
        {beceSchool ? (
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-700 mb-2">BECE</h4>
            <SectionGrid>
               <Field label="School" value={beceSchool} />
               <Field label="Year" value={beceYear} />
               <Field label="Aggregate" value={beceAggregate} />
            </SectionGrid>
          </div>
        ) : null}

        {(tertiary.length > 0 || edu.tertiaryInstitution || edu.tertiary_institution) ? (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-bold text-slate-700 mb-2">Tertiary</h4>
            {Array.isArray(tertiary) && tertiary.length > 0 ? (
              tertiary.map((t, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <SectionGrid>
                     <Field label="Institution" value={t.institutionName || t.institution_name} />
                     <Field label="Qualification" value={t.qualification} />
                     <Field label="Course" value={t.courseOfStudy || t.course_of_study} />
                     <Field label="Class" value={t.classObtained || t.class_obtained} />
                     <Field label="Cert #" value={t.certificateNumber || t.certificate_number} />
                     <Field label="NSS" value={t.nationalServiceNumber || t.national_service_number} />
                  </SectionGrid>
                </div>
              ))
            ) : (
                <SectionGrid>
                   <Field label="Institution" value={edu.tertiaryInstitution || edu.tertiary_institution} />
                   <Field label="Qualification" value={edu.tertiaryQualification || edu.tertiary_qualification} />
                   <Field label="Year" value={edu.tertiaryYear || edu.tertiary_year} />
                </SectionGrid>
            )}
          </div>
        ) : null}
      </DetailSection>

      <DetailSection title="Documents">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {application.documents?.map((doc, idx) => (
               <a 
                 key={idx} 
                 href={doc.url || doc.filePath || doc.file_path} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block p-4 border rounded-lg hover:bg-slate-50 transition-colors text-center"
               >
                  <div className="text-3xl mb-2">📄</div>
                  <p className="text-sm font-medium text-blue-600 truncate">{doc.documentType || doc.document_type || 'Document'}</p>
               </a>
            ))}
         </div>
      </DetailSection>
    </div>
  );
}

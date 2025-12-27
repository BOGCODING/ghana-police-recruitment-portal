const UserModel = require('./User.model');
const AdminModel = require('./Admin.model');
const ApplicantModel = require('./Applicant.model');
const ApplicationModel = require('./Application.model');
const VoucherModel = require('./Voucher.model');
const PersonalInfoModel = require('./PersonalInfo.model');
const ContactInfoModel = require('./ContactInfo.model');
const EducationModel = require('./Education.model');

const DocumentsModel = require('./Documents.model');
const NotificationModel = require('./Notification.model');
const RegionalModel = require('./Regional.model');
const AuditLogModel = require('./AuditLog.model');
const EmploymentHistoryModel = require('./EmploymentHistory.model');

module.exports = {
  User: UserModel,
  Admin: AdminModel,
  Applicant: ApplicantModel,
  Application: ApplicationModel,
  Voucher: VoucherModel,
  PersonalInfo: PersonalInfoModel,
  ContactInfo: ContactInfoModel,
  Education: EducationModel,

  Documents: DocumentsModel,
  Notification: NotificationModel,
  Regional: RegionalModel,
  AuditLog: AuditLogModel,
  EmploymentHistory: EmploymentHistoryModel
};

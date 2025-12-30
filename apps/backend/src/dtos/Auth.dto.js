const BaseDTO = require('./Base.dto');
const { normalizePhoneNumber, toUpperCase } = require('../utils/helpers');

class AuthDTO extends BaseDTO {
  static toRegisterInput(body) {
    return {
      serialNumber: toUpperCase(body.serialNumber?.trim()),
      pinCode: toUpperCase(body.pinCode?.trim()),
      email: this.cleanEmail(body.email),
      phoneNumber: normalizePhoneNumber(body.phoneNumber?.trim()),
      password: body.password
    };
  }

  static toLoginInput(body) {
    return {
      email: this.cleanEmail(body.email),
      password: body.password
    };
  }

  static toVoucherInput(body) {
    return {
      serialNumber: toUpperCase(body.serialNumber?.trim()),
      pinCode: toUpperCase(body.pinCode?.trim()),
      email: this.cleanEmail(body.email),
      phoneNumber: normalizePhoneNumber(body.phoneNumber?.trim())
    };
  }

  static toCurrentUserResponse(user, application = null) {
    const formatted = {
      id: user.id,
      serialNumber: user.serialNumber,
      email: user.email,
      phoneNumber: user.phoneNumber,
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    if (user.firstName) {
      formatted.fullName = [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(' ');
      formatted.firstName = user.firstName;
      formatted.lastName = user.lastName;
    }

    if (application) {
      formatted.application = {
        id: application.id || application.app_id,
        applicationId: application.applicationId,
        status: application.status || application.applicationStatus,
        currentStep: application.currentStep,
        category: application.category,
        subCategory: application.subCategory,
        submittedAt: application.submittedAt,
        
        // Review/Action details
        requiredDocuments: application.requiredDocuments || [],
        documentRequestMessage: application.documentRequestMessage,
        rejectionReason: application.rejectionReason,
        reviewComments: application.reviewComments
      };
      
      // For backward compatibility with some frontend components
      formatted.applicationStatus = formatted.application.status;
      formatted.applicationId = formatted.application.applicationId;
      formatted.currentStep = formatted.application.currentStep;
    }

    if (user.passportPhotoPath) {
      formatted.profileImage = user.passportPhotoPath; // Controller can format this or we can pass pre-formatted
    }

    return formatted;
  }
}

module.exports = AuthDTO;

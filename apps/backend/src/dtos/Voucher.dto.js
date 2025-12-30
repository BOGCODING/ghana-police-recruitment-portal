const BaseDTO = require('./Base.dto');

class VoucherDTO extends BaseDTO {
  static toGenerateSingleInput(body) {
    return {
      email: this.cleanEmail(body.email),
      phoneNumber: body.phoneNumber?.trim(),
      notes: body.notes?.trim()
    };
  }

  static toGenerateBulkInput(body) {
    return {
      quantity: parseInt(body.quantity) || 10,
      expiryDays: parseInt(body.expiryDays) || 31,
      notes: body.notes?.trim()
    };
  }

  static toQueryFilters(query) {
    return {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 20,
      status: query.status || 'all',
      search: query.search?.trim(),
      startDate: query.startDate,
      endDate: query.endDate
    };
  }

  static toVoucherResponse(voucher) {
    return {
      id: voucher.id,
      code: voucher.code,
      serialNumber: voucher.serialNumber,
      pinCode: voucher.pinCode,
      email: voucher.email,
      phoneNumber: voucher.phoneNumber,
      isUsed: voucher.isUsed,
      usedAt: voucher.usedAt,
      expiresAt: voucher.expiresAt,
      applicantId: voucher.applicantId,
      applicantEmail: voucher.applicantEmail, // From join
      deactivatedAt: voucher.deactivatedAt,
      createdAt: voucher.createdAt,
      notes: voucher.notes
    };
  }

  static toVoucherListResponse(vouchers, pagination) {
    return {
      success: true,
      data: vouchers.map(v => this.toVoucherResponse(v)),
      pagination
    };
  }
}

module.exports = VoucherDTO;

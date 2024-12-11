import config from "config";
import { HTTP400Error, HTTP404Error } from "../../../utils/httpErrors";
import { Utilities } from "../../../utils/Utilities";
import { MESSAGES } from "../../../constants/messages";
import mongoose from "mongoose";
import { CompanyModel } from "../../../db/company";

export const addCompany = async (bodyData: any, token: any, next: any) => {
  try {
    const decoded: any = await Utilities.getDecoded(token);
    // Validate if email is already in use
    const isEmailExist = await CompanyModel.findOne({
      email: bodyData.email,
      isDeleted: false,
    });

    if (isEmailExist) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.EMAIL_EXISTS,
        })
      );
    }

    // Create Company
    const companyData = {
      companyName: bodyData.companyName,
      email: bodyData.email,
      numberOfEmployees: bodyData.numberOfEmployees,
      tax: bodyData.tax,
      description: bodyData.description,
      phone: bodyData.phone,
      status: bodyData.status,
      createdBy: new mongoose.Types.ObjectId(decoded.id)
    };

    const company = await CompanyModel.create(companyData);

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.PARTNER_CREATED,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

export const editCompany = async (companyId: string, bodyData: any, next: any) => {
  try {
    // Validate if company exists
    const company = await CompanyModel.findOne({ _id: new mongoose.Types.ObjectId(companyId), isDeleted: false });
    if (!company) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: MESSAGES.ADMIN.COMPANY_NOT_FOUND,
        })
      );
    }

    // Update company data
    const updatedCompanyData = {
      companyName: bodyData.companyName || company.companyName,
      email: bodyData.email || company.email,
      numberOfEmployees: bodyData.numberOfEmployees || company.numberOfEmployees,
      tax: bodyData.tax || company.tax,
      description: bodyData.description || company.description,
      phone: bodyData.phone || company.phone,
      status: bodyData.status || company.status,
    };

    await CompanyModel.findByIdAndUpdate(companyId, updatedCompanyData, { new: true });

    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.COMPANY_UPDATED,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCompanies = async (token: any, query: any, next: any) => {
  try {
    let skip = parseInt(query.skip) || 0;
    let limit = parseInt(query.limit) || 10;
    let sortOrder: any = query.sortOrder === 'desc' ? -1 : 1;
    const filters: any = [{ isDeleted: false }];

    const companies = await CompanyModel.aggregate([
      {
        $match: { $and: filters }
      },
      {
        "$sort": {
          "createdAt": sortOrder
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
    ]);

    let totalCounts = await CompanyModel.countDocuments({ isDeleted: false });

    // Return success response
    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.COMPANIES_FETCHED,
      totalRecord: totalCounts,
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (companyId: string, next: any) => {
  try {
    // Validate Company ID
    if (!companyId) {
      throw new Error("Company ID is required");
    }

    // Fetch Company by ID
    const company = await CompanyModel.findOne({ _id: companyId, isDeleted: false }).lean();

    if (!company) {
      return Utilities.sendResponsData({
        code: 404,
        message: MESSAGES.ADMIN.COMPANY_NOT_FOUND,
        data: null,
      });
    }

    // Return success response
    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.COMPANY_FETCHED,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCompanyById = async (companyId: string, next: any) => {
  try {
    // Validate Company ID
    if (!companyId) {
      throw new Error("Company ID is required");
    }

    // Find and Soft Delete Company
    const company = await CompanyModel.findOneAndUpdate(
      { _id: companyId, isDeleted: false }, 
      { isDeleted: true }, 
      { new: true }
    ).lean();

    if (!company) {
      return Utilities.sendResponsData({
        code: 404,
        message: MESSAGES.ADMIN.COMPANY_NOT_FOUND,
        data: null,
      });
    }

    // Return Success Response
    return Utilities.sendResponsData({
      code: 200,
      message: MESSAGES.ADMIN.COMPANY_DELETED,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};
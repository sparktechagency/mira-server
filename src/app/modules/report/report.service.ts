import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IReportFilterables, IReport } from './report.interface';
import { Report } from './report.model';
import { JwtPayload } from 'jsonwebtoken';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { reportSearchableFields } from './report.constants';

import { USER_ROLES } from '../../../enum/user';
import { sendNotification } from '../../../helpers/notificationHelper';


const createReport = async (user: JwtPayload, payload: IReport) => {
  payload.reporter = user.authId;
  const report = await Report.create({
    ...payload,
  });
  return 'Thank you for reporting. We will review your report and take appropriate action.';
};

const updateReport = async (user: JwtPayload, payload: IReport, id: string) => {
  const report = await Report.findById(id);
  if (!report) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Report not found');
  }
  if (report.reporter?.toString() !== user.authId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to update this report');
  }
  await report.updateOne(payload);
  return 'Report updated successfully';
};


const getAllReports = async (user:JwtPayload,pagination: IPaginationOptions, filter: IReportFilterables) => {
  const { page, limit,skip, sortBy, sortOrder } = paginationHelper.calculatePagination(pagination);
  const {searchTerm, ...filterData} = filter;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      $or: reportSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

    if(Object.keys(filter).length){
    andConditions.push({
      $and:Object.entries(filterData).map(([field,value])=>({
        [field]:value
      }))
    })
  }

  if(user.role !==USER_ROLES.ADMIN){
    andConditions.push({
      reporter:user.authId
    })
  }

  const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};
  const [result, total] = await Promise.all([
    Report.find(whereConditions)
    .populate({
      path: 'reporter',
      select: 'firstName lastName profile',
    })
    .populate({
      path: 'reportedUser',
      select: 'firstName lastName profile',
    })
    .populate({
      path: 'reportedMessage',
    })
    .populate({
      path: 'reportedComment',
    })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(whereConditions),
  ])
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
}

const updateReportStatus = async (user:JwtPayload, id: string, payload:{status:'pending' | 'in review' | 'resolved' | 'rejected', feedBack?: string} ) => {
  const {status, feedBack} = payload;
  const report = await Report.findById(id);

  if (!report) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'The requested report not found.');
  }

  if(report.status === status){
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Report status is already '+status);
  }

  await report.updateOne({
    status
  });
  //if the the report status is either in review or resolved, then send a notification to the reporter
  const notificationBody= status === 'in review' ? 'Thank you for reporting. We will review your report and take appropriate action.' : feedBack || `We have gone through your report and took appropriate action. Current status is ${status}. If you have any questions, please contact us.`;
  if(status === 'in review' || status === 'resolved'){
    await sendNotification({
      authId: user.authId.toString(),
      name:user.name,
      profile:user.profile
    },
    report.reporter.toString(),
    `Your report has been update by admin, current status is ${status}.`,
    notificationBody
  );
  return 'Report status updated successfully';
}
}

export const ReportServices = {
  createReport,
  updateReport,
  getAllReports,
  updateReportStatus,
  
}

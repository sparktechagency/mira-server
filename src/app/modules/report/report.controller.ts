import { Request, Response } from 'express';
import { ReportServices } from './report.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { reportFilterables } from './report.constants';
import { paginationFields } from '../../../interfaces/pagination';

const createReport = catchAsync(async (req: Request, res: Response) => {
  
  const result = await ReportServices.createReport(req.user!, req.body );
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Report created successfully',
    data: result,
  });
});

const updateReportStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, feedBack } = req.body;
  const result = await ReportServices.updateReportStatus(req.user!, id, {
    status,
    feedBack,
  });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Report status updated successfully',
    data: result,
  });
});

const getAllReports = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, reportFilterables);
  const paginationOptions = pick(req.query, paginationFields);
  const result = await ReportServices.getAllReports(req.user!,filters, paginationOptions);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reports retrieved successfully',
    data: result,
  });
});

const updateReport = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReportServices.updateReport(req.user!, req.body, id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Report updated successfully',
    data: result,
  });
});



export const ReportController = {
  createReport,
  updateReportStatus,
  getAllReports,
  updateReport,
};
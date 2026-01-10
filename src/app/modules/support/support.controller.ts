import { Request, Response } from 'express';
import { SupportServices } from './support.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../../shared/pick';
import { supportFilterables } from './support.constants';
import { paginationFields } from '../../../interfaces/pagination';

const createSupport = catchAsync(async (req: Request, res: Response) => {
  const supportData = req.body;

  const result = await SupportServices.createSupport(
    req.user!,
    supportData
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Support created successfully',
    data: result,
  });
});

const updateSupport = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const supportData = req.body;

  const result = await SupportServices.updateSupport(id, supportData);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Support updated successfully',
    data: result,
  });
});

const getSingleSupport = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SupportServices.getSingleSupport(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Support retrieved successfully',
    data: result,
  });
});

const getAllSupports = catchAsync(async (req: Request, res: Response) => {
  const filterables = pick(req.query, supportFilterables);
  const pagination = pick(req.query, paginationFields);

  const result = await SupportServices.getAllSupports(
    req.user!,
    filterables,
    pagination
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Supports retrieved successfully',
    data: result,
  });
});

const deleteSupport = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SupportServices.deleteSupport(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Support deleted successfully',
    data: result,
  });
});

export const SupportController = {
  createSupport,
  updateSupport,
  getSingleSupport,
  getAllSupports,
  deleteSupport,
};
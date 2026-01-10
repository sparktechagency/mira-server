import { Request, Response } from 'express';
  import { ReviewServices } from './review.service';
  import catchAsync from '../../../shared/catchAsync';
  import sendResponse from '../../../shared/sendResponse';
  import { StatusCodes } from 'http-status-codes';
import { paginationFields } from '../../../interfaces/pagination';
import pick from '../../../shared/pick';
  
  const createReview = catchAsync(async (req: Request, res: Response) => {
    const reviewData = req.body;
    const result = await ReviewServices.createReview(req.user!,reviewData);
    
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Review created successfully',
      data: result,
    });
  });
  
  const updateReview = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const reviewData = req.body;
    const result = await ReviewServices.updateReview(req.user!,id, reviewData);
    
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Review updated successfully',
      data: result,
    });
  });
  

  
  const getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const type = req.params.type as 'reviewer' | 'reviewee';
    const paginationOptions = pick(req.query, paginationFields)
    const result = await ReviewServices.getAllReviews(req.user!,type,paginationOptions);
    
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Reviews retrieved successfully',
      data: result,
    });
  });
  
  const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ReviewServices.deleteReview(id,req.user!);
    
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Review deleted successfully',
      data: result,
    });
  });
  
  export const ReviewController = {
    createReview,
    updateReview,
    getAllReviews,
    deleteReview,
  };
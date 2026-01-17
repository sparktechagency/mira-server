import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { settingsService } from './settings.service';

const addSetting = catchAsync(async (req, res) => {
     const result = await settingsService.upsertSettings(req.body);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Setting added successfully',
          data: result,
     });
});

const getSettings = catchAsync(async (req, res): Promise<void> => {
     const result = await settingsService.getSettings(req.query.key as string);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Setting retrieved successfully',
          data: result,
     });
});
const getPrivacyPolicy = catchAsync(async (req, res): Promise<void> => {
     const result = await settingsService.getPrivacyPolicy();
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Privacy retrieved successfully',
          data: result,
     });
});
const getTermsOfService = catchAsync(async (req, res): Promise<void> => {
     const result = await settingsService.getTermsOfService();
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'TermsOfService retrieved successfully',
          data: result,
     });
});
const getSupport = catchAsync(async (req, res): Promise<void> => {
     const result = await settingsService.getSupport();
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Support retrieved successfully',
          data: result,
     });
});
const getAboutUs = catchAsync(async (req, res): Promise<void> => {
     const result = await settingsService.getAboutUs();
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'AboutUs retrieved successfully',
          data: result,
     });
});

// const getAccountDelete = catchAsync(async (req, res): Promise<void> => {
//   const htmlContent = await settingsService.getAccountDelete();
//   res.sendFile(htmlContent);
// });

// const getSupport = catchAsync(async (req, res): Promise<void> => {
//   const htmlContent = await settingsService.getSupport();
//   res.sendFile(htmlContent);
// });
export const settingsController = {
     getSettings,
     getPrivacyPolicy,
     getAboutUs,
     getSupport,
     addSetting,
     getTermsOfService,
};

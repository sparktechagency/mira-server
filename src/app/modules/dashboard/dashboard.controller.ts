import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { DashboardService } from "./dashboard.service";

const getGeneralStats = catchAsync(async (req, res) => {
   
    const stats = await DashboardService.getGeneralStats()
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'General stats retrieved successfully',
      data: stats,
    })
  
})
const getMonthlyUserStats = catchAsync(async (req, res) => {
  const { year } = req.params;
  const stats = await DashboardService.getMonthlyUserStats(Number(year));
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Monthly user stats retrieved successfully',
    data: stats,
  })
})

export const DashboardController = {
  getGeneralStats,
  getMonthlyUserStats,
}

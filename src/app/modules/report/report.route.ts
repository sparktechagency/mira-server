import express from 'express';
import { ReportController } from './report.controller';
import { ReportValidations } from './report.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';


const router = express.Router();

router.post(
  '/',
  auth(
    USER_ROLES.USER,
  ),
  validateRequest(ReportValidations.create),
  ReportController.createReport
)
router.patch(
  '/:id',
  auth(
    USER_ROLES.USER,
  ),
  validateRequest(ReportValidations.update),
  ReportController.updateReport
)
router.patch(
  '/status/:id',
  auth(
    USER_ROLES.USER,
    USER_ROLES.ADMIN,
  ),
  validateRequest(ReportValidations.updateStatus),
  ReportController.updateReportStatus
)
router.get(
  '/',
  auth(
    USER_ROLES.USER,
    USER_ROLES.ADMIN,
  ),
  ReportController.getAllReports
)


export const ReportRoutes = router;
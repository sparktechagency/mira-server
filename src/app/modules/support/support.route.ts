import express from 'express';
import { SupportController } from './support.controller';
import { SupportValidations } from './support.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';


const router = express.Router();

router.get(
  '/',
  auth(
   
    USER_ROLES.ADMIN
  ),
  SupportController.getAllSupports
);

router.get(
  '/:id',
  auth(
   
    USER_ROLES.ADMIN
  ),
  SupportController.getSingleSupport
);

router.post(
  '/',
  auth(
   
    USER_ROLES.ADMIN
  ),
  
  validateRequest(SupportValidations.create),
  SupportController.createSupport
);

router.patch(
  '/:id',
  auth(
   
    USER_ROLES.ADMIN
  ),
  
  validateRequest(SupportValidations.update),
  SupportController.updateSupport
);

router.delete(
  '/:id',
  auth(
   
    USER_ROLES.ADMIN
  ),
  SupportController.deleteSupport
);

export const SupportRoutes = router;
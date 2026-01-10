import express from 'express'
import { UserController } from './user.controller'
import { UserValidations } from './user.validation'
import validateRequest from '../../middleware/validateRequest'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import {
  fileAndBodyProcessorUsingDiskStorage,
} from '../../middleware/processReqBody'

const router = express.Router()


router.patch(
  '/profile',
  auth(
    USER_ROLES.CUSTOMER,
    USER_ROLES.ADMIN,
    USER_ROLES.USER,
    USER_ROLES.GUEST,
  ),
  fileAndBodyProcessorUsingDiskStorage(),
  validateRequest(UserValidations.updateUserZodSchema),
  UserController.updateProfile,
)

router.get(
  '/check-username-availability/:userName',
  validateRequest(UserValidations.checkUserNameZodSchema),
  UserController.checkAndGetUserNameAvailablity,
)

router.get(
  '/profile',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.USER,

  ),
  UserController.getProfile,
)


router.get(
  '/',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.USER,

  ),
  UserController.getAllUsers,
)

export const UserRoutes = router

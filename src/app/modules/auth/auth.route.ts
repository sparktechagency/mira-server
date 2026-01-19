import express from 'express'
import passport from 'passport'
import { PassportAuthController } from './passport.auth/passport.auth.controller'
import { CustomAuthController } from './custom.auth/custom.auth.controller'
import validateRequest from '../../middleware/validateRequest'
import { AuthValidations } from './auth.validation'
import { USER_ROLES } from '../../../enum/user'
import auth, { tempAuth } from '../../middleware/auth'

const router = express.Router()

router.post(
  '/signup',
  validateRequest(AuthValidations.createUserZodSchema),
  CustomAuthController.createUser,
)
router.post(
  '/admin-login',
  validateRequest(AuthValidations.adminLoginZodSchema),
  CustomAuthController.adminLogin,
)
router.post(
  '/login',
  validateRequest(AuthValidations.loginZodSchema),
  CustomAuthController.customLogin,
)

router.post(
  '/google-login',
  CustomAuthController.customLogin,
)

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
)

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  PassportAuthController.googleAuthCallback,
)

router.post(
  '/verify-account',
  validateRequest(AuthValidations.verifyAccountZodSchema),
  CustomAuthController.verifyAccount,
)

router.post(
  '/custom-login',
  validateRequest(AuthValidations.loginZodSchema),
  CustomAuthController.customLogin,
)

router.post(
  '/forget-password',
  validateRequest(AuthValidations.forgetPasswordZodSchema),
  CustomAuthController.forgetPassword,
)
router.post(
  '/reset-password',
  validateRequest(AuthValidations.resetPasswordZodSchema),
  CustomAuthController.resetPassword,
)

router.post(
  '/resend-otp',
  // tempAuth(
  //   USER_ROLES.ADMIN,
  //   USER_ROLES.USER,
  //   USER_ROLES.GUEST,
  //   USER_ROLES.CUSTOMER,
  // ),
  validateRequest(AuthValidations.resendOtpZodSchema),
  CustomAuthController.resendOtp,
)

router.post(
  '/change-password',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.GUEST),
  validateRequest(AuthValidations.changePasswordZodSchema),
  CustomAuthController.changePassword,
)

router.delete(
  '/delete-account',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.GUEST),
  validateRequest(AuthValidations.deleteAccount),
  CustomAuthController.deleteAccount,
)
router.post('/refresh-token', CustomAuthController.getRefreshToken)

router.post('/social-login', validateRequest(AuthValidations.socialLoginZodSchema), CustomAuthController.socialLogin)
router.patch('/toggle-user-status/:userId', auth(USER_ROLES.ADMIN), validateRequest(AuthValidations.toggleUserStatusZodSchema), CustomAuthController.toggleUserStatus)

export const AuthRoutes = router

import express from 'express'
import { MessageController } from './message.controller'
import { MessageValidations } from './message.validation'
import validateRequest from '../../middleware/validateRequest'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

router.post(
  '/',
  auth(USER_ROLES.USER),
  validateRequest(MessageValidations.create),
  MessageController.sendMessageToRandomUserOptimized,
)

router.get('/', auth(USER_ROLES.USER), MessageController.getMyMessages)

router.get('/feed', auth(USER_ROLES.USER), MessageController.getFeedMessages)

router.post(
  '/share/:messageId',
  auth(USER_ROLES.USER),
  validateRequest(MessageValidations.share),
  MessageController.shareMessage,
)
router.delete(
  '/:messageId',
  auth(USER_ROLES.USER),
  MessageController.deleteMessage,
)
export const MessageRoutes = router

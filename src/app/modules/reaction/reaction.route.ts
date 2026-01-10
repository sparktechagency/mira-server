import express from 'express';
import { ReactionController } from './reaction.controller';
import { ReactionValidations } from './reaction.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';


const router = express.Router();

router.patch('/toggle/:messageId',auth(USER_ROLES.USER), validateRequest(ReactionValidations.toggleReaction), ReactionController.toggleReaction);
router.get('/list/:messageId', auth(USER_ROLES.USER), validateRequest(ReactionValidations.getReactionListByMessage), ReactionController.getReactionListByMessage);

export const ReactionRoutes = router;
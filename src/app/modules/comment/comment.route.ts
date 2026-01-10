import express from 'express';
import { CommentController } from './comment.controller';
import { CommentValidations } from './comment.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';


const router = express.Router();

router.post(
  '/:messageId',
  auth(
    USER_ROLES.USER
  ),
  validateRequest(CommentValidations.create),
  CommentController.createComment
);

router.get(
  '/:messageId',
  auth(
    USER_ROLES.USER
  ),
  validateRequest(CommentValidations.get),
  CommentController.getCommentByMessage
);

router.delete(
  '/:commentId',
  auth(
    USER_ROLES.USER
  ),
  validateRequest(CommentValidations.remove),
  CommentController.removeComment
);

router.post(
  '/:commentId/react',
  auth(
    USER_ROLES.USER
  ),
  validateRequest(CommentValidations.react),
  CommentController.reactForComment
);

export const CommentRoutes = router;
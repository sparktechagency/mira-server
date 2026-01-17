import express from 'express';
import { settingsController } from './settings.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';

const SettingsRouter = express.Router();


SettingsRouter.put('/', auth(USER_ROLES.ADMIN), settingsController.addSetting).get('/', settingsController.getSettings);

export default SettingsRouter;

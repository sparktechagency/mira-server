import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { USER_ROLES } from "../../../enum/user";
import auth from "../../middleware/auth";

const router = Router();

router.get('/general-stats',auth(USER_ROLES.ADMIN), DashboardController.getGeneralStats);
router.get('/monthly-stats/:year',auth(USER_ROLES.ADMIN), DashboardController.getMonthlyUserStats);

export const DashboardRoutes = router;


import { UserRoutes } from '../app/modules/user/user.route'
import { AuthRoutes } from '../app/modules/auth/auth.route'
import express, { Router } from 'express'
import { NotificationRoutes } from '../app/modules/notifications/notifications.route'
import { PublicRoutes } from '../app/modules/public/public.route'
import { MessageRoutes } from '../app/modules/message/message.route'
import { ReactionRoutes } from '../app/modules/reaction/reaction.route'
import { CommentRoutes } from '../app/modules/comment/comment.route'
import { ReportRoutes } from '../app/modules/report/report.route'
import { SupportRoutes } from '../app/modules/support/support.route'
import { DashboardRoutes } from '../app/modules/dashboard/dashboard.route'
import SettingsRouter from '../app/modules/settings/settings.route'


const router = express.Router()

const apiRoutes: { path: string; route: Router }[] = [
  { path: '/user', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },


  { path: '/notifications', route: NotificationRoutes },
  { path: '/dashboard', route: DashboardRoutes },

  { path: '/public', route: PublicRoutes },
  { path: '/message', route: MessageRoutes },
  { path: '/reaction', route: ReactionRoutes },
  { path: '/comment', route: CommentRoutes },
  { path: '/report', route: ReportRoutes },
  { path: '/settings', route: SettingsRouter },
  { path: '/support', route: SupportRoutes }]

apiRoutes.forEach(route => {
  router.use(route.path, route.route)
})

export default router

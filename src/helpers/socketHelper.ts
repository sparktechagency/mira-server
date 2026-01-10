import colors from 'colors'
import { Server, Socket } from 'socket.io'
import { logger } from '../shared/logger'
import { onlineUsers } from '../server'
import { Notification } from '../app/modules/notifications/notifications.model'
import { USER_ROLES } from '../enum/user'
import { JwtPayload } from 'jsonwebtoken'
import { socketMiddleware } from '../app/middleware/socketAuth'


// Define interface for socket with user data
export interface SocketWithUser extends Socket {
  user?: JwtPayload & {
    authId: string
    role: string
  }
}

const socket = (io: Server) => {
  // Apply authentication middleware to all connections
  io.use(
    socketMiddleware.socketAuth(
      USER_ROLES.CUSTOMER,
      USER_ROLES.ADMIN,
      USER_ROLES.GUEST,
      USER_ROLES.USER,
    ),
  )

  io.on('connection', (socket: SocketWithUser) => {
    if (socket.user) {
      onlineUsers.set(socket.id, socket.user.authId)
      logger.info(colors.blue(`⚡ User ${socket.user.authId} connected`))

      // Send notifications only on initial connection
      // sendNotificationsToAllConnectedUsers(socket)

      registerEventHandlers(socket)
    }
  })
}

// Separate function to register all event handlers
const registerEventHandlers = (socket: SocketWithUser) => {
  const userRooms = new Set<string>();
  socket.on('joinMessageRoom', (messageId: string) => {
    socket.join(messageId)
    userRooms.add(messageId);
    logger.info(`Socket ${socket.id} joined room ${messageId}`);
  })

   socket.on("leaveMessageRoom", (messageId) => {
    socket.leave(messageId);
    logger.info(`Socket ${socket.id} left room ${messageId}`);
  });

  // Disconnect handler
  socket.on('disconnect', () => {
        // Cleanup all rooms for this user
    userRooms.forEach(room => socket.leave(room));
    onlineUsers.delete(socket.id)
    logger.info(
      colors.red(`User ${socket.user?.authId || 'Unknown'} disconnected ⚡`),
    )
  })
}

// const sendNotificationsToAllConnectedUsers = async (socket: SocketWithUser) => {
//   try {
//     const userId = socket.user?.authId
//     if (!userId) return

//     const [notifications, unreadCount] = await Promise.all([
//       Notification.find({ receiver: userId }).populate([
//         { path: 'sender', select: 'name profile' },
//       ]).lean(),
//       Notification.countDocuments({ receiver: userId, isRead: false }),
//     ])

//     socket.emit(`notification::${userId}`, {
//       notifications,
//       unreadCount,
//     })
//   } catch (error) {
//     logger.error('Error sending notifications:', error)
//   }
// }

export const socketHelper = {
  socket,
  // sendNotificationsToAllConnectedUsers,`
}

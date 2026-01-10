import { Types } from 'mongoose'
import { Notification } from '../app/modules/notifications/notifications.model'
import { logger } from '../shared/logger'
import { getSocketIO } from './socketInstances'
// import { sendPushNotification } from './pushnotificationHelper'

export const sendNotification = async (
  from: {
    authId: string,
    profile?: string,
    name?: string,
  },
  to: string,
  title: string,
  body: string,
  deviceToken?: string,
) => {
  try {
    const result = await Notification.create({
      from: from.authId,
      to,
      title,
      body,
      isRead: false,
    })

    if (!result) logger.warn('Notification not sent')

    const socketResponse = {
      _id: result._id,
      from: {
        _id: from.authId,
        name: from?.name,
        profile: from?.profile,
      },
      to,
      title,
      body,
      isRead: false,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,

    }


    const socketIO = getSocketIO()
    if (socketIO) {
      socketIO.emit(`notification::${to}`, socketResponse)
    } else {
      logger.warn('Socket.IO not initialized - Skipping notification emit')
    }

    // if(deviceToken){
    //  await sendPushNotification(deviceToken, title, body, { from: from.authId, to })
    // }
  } catch (err) {
    //@ts-ignore
    logger.error(err, 'FROM NOTIFICATION HELPER')
  }
}

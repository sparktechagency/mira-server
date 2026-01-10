// import admin from "firebase-admin";
// import config from "../config";
// import { logger } from "../shared/logger";

// const serviceAccountJson = Buffer.from(config.firebase_service_account_base64!, "base64").toString("utf8");
// const serviceAccount = JSON.parse(serviceAccountJson);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
// });

// type NotificationData = { [key: string]: string };

// export const sendPushNotification = async (
//   deviceToken: string,
//   title: string,
//   body: string,
//   data: NotificationData,
//   icon?: string
// ) => {
//   const message: admin.messaging.Message = {
//     token: deviceToken,
//     notification: { title, body },
//     data,
//     ...(icon && {
//       android: {
//         notification: { icon },
//       },
//     }),
//     apns: {
//       payload: {
//         aps: {
//           'mutable-content': 1,
//         },
//       },
//     },
//   };

//   try {
//     const response = await admin.messaging().send(message);
//     logger.info('Successfully sent message:', response);
//   } catch (error: any) {
//     logger.error('Error sending message:', error?.message, error);
//   }
// };

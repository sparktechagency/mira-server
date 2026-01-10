import colors from 'colors'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import app from './app'
import config from './config'

import { errorLogger, logger } from './shared/logger'
import { socketHelper } from './helpers/socketHelper'
import { UserServices } from './app/modules/user/user.service'


import { setSocketIO } from './helpers/socketInstances'
//uncaught exception
process.on('uncaughtException', error => {
  errorLogger.error('UnhandledException Detected', error)
  process.exit(1)
})

export const onlineUsers = new Map()
let server: any
async function main() {
  try {
    mongoose.connect(config.database_url as string)
    logger.info(colors.green('🚀 Database connected successfully'))

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port)

    server = app.listen(port, config.ip_address as string, () => {
      logger.info(
        colors.yellow(`♻️  Application listening on port:${config.port}`),
      )
    })

    //socket
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    })

    //create admin user
    await UserServices.createAdmin()


    socketHelper.socket(io)
    setSocketIO(io) 
    

  } catch (error) {
    errorLogger.error(colors.red('🤢 Failed to connect Database'))
    config.node_env === 'development' && console.log(error)
  }

  //handle unhandleRejection
  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        errorLogger.error('UnhandledRejection Detected', error)
        process.exit(1)
      })
    } else {
      process.exit(1)
    }
  })
}

main()

//SIGTERM
process.on('SIGTERM', async () => {

  logger.info('SIGTERM IS RECEIVE')
  if (server) {
    server.close()
  }
})
